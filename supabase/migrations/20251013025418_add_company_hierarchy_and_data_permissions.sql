/*
  # 添加企业层级结构和数据访问权限

  1. 修改 companies 表
    - 添加 `parent_id` (uuid, 外键) - 父公司ID，支持多层级结构
    - 添加 `level` (integer, 默认1) - 公司层级，1为顶级公司

  2. 新建 data_permissions 表
    - `id` (uuid, 主键)
    - `user_id` (uuid, 外键) - 用户ID
    - `company_id` (uuid, 外键) - 可访问的公司ID
    - `can_view` (boolean, 默认true) - 是否可查看
    - `can_edit` (boolean, 默认false) - 是否可编辑
    - `granted_by` (uuid, 外键) - 授权人ID
    - `created_at` (timestamptz, 默认now())

  3. 安全设置
    - 更新 companies 表的 RLS 策略以支持层级访问
    - 为 data_permissions 表添加 RLS 策略
    - 超级管理员可以访问所有数据
    - 企业管理员可以访问本公司及子公司数据
    - 普通用户只能访问被授权的公司数据

  4. 创建辅助函数
    - get_user_accessible_companies(user_uuid) - 获取用户可访问的所有公司
    - get_company_with_children(company_uuid) - 获取公司及其所有子公司
*/

-- 为 companies 表添加父子关系字段
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE companies ADD COLUMN parent_id uuid REFERENCES companies(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'level'
  ) THEN
    ALTER TABLE companies ADD COLUMN level integer DEFAULT 1;
  END IF;
END $$;

-- 创建数据访问权限表
CREATE TABLE IF NOT EXISTS data_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  can_view boolean DEFAULT true,
  can_edit boolean DEFAULT false,
  granted_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- 启用 RLS
ALTER TABLE data_permissions ENABLE ROW LEVEL SECURITY;

-- 创建递归函数：获取公司及其所有子公司ID
CREATE OR REPLACE FUNCTION get_company_with_children(company_uuid uuid)
RETURNS TABLE(company_id uuid) AS $$
  WITH RECURSIVE company_tree AS (
    SELECT id FROM companies WHERE id = company_uuid
    UNION ALL
    SELECT c.id
    FROM companies c
    INNER JOIN company_tree ct ON c.parent_id = ct.id
  )
  SELECT id FROM company_tree;
$$ LANGUAGE sql STABLE;

-- 创建函数：获取用户可访问的所有公司ID
CREATE OR REPLACE FUNCTION get_user_accessible_companies(user_uuid uuid)
RETURNS TABLE(company_id uuid) AS $$
DECLARE
  user_role_code text;
  user_company_id uuid;
BEGIN
  SELECT r.code, u.company_id INTO user_role_code, user_company_id
  FROM users u
  LEFT JOIN roles r ON u.role_id = r.id
  WHERE u.id = user_uuid;

  -- 超级管理员可以访问所有公司
  IF user_role_code = 'super_admin' THEN
    RETURN QUERY SELECT id FROM companies;
  
  -- 企业管理员可以访问本公司及所有子公司
  ELSIF user_role_code = 'company_admin' AND user_company_id IS NOT NULL THEN
    RETURN QUERY SELECT * FROM get_company_with_children(user_company_id);
  
  -- 普通用户只能访问被授权的公司
  ELSE
    RETURN QUERY 
      SELECT dp.company_id 
      FROM data_permissions dp 
      WHERE dp.user_id = user_uuid AND dp.can_view = true;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- data_permissions 表的 RLS 策略
CREATE POLICY "超级管理员可查看所有数据权限"
  ON data_permissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.code = 'super_admin'
    )
  );

CREATE POLICY "企业管理员可查看本公司及子公司的数据权限"
  ON data_permissions FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT * FROM get_user_accessible_companies(auth.uid())
    )
  );

CREATE POLICY "用户可查看自己的数据权限"
  ON data_permissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "超级管理员可管理所有数据权限"
  ON data_permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.code = 'super_admin'
    )
  );

CREATE POLICY "企业管理员可管理本公司及子公司的数据权限"
  ON data_permissions FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT * FROM get_user_accessible_companies(auth.uid())
    )
  );

CREATE POLICY "企业管理员可更新本公司及子公司的数据权限"
  ON data_permissions FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT * FROM get_user_accessible_companies(auth.uid())
    )
  );

CREATE POLICY "企业管理员可删除本公司及子公司的数据权限"
  ON data_permissions FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT * FROM get_user_accessible_companies(auth.uid())
    )
  );

-- 更新 companies 表的 RLS 策略，删除旧策略
DROP POLICY IF EXISTS "超级管理员可查看所有企业" ON companies;
DROP POLICY IF EXISTS "企业管理员可查看自己的企业" ON companies;
DROP POLICY IF EXISTS "超级管理员可创建企业" ON companies;
DROP POLICY IF EXISTS "超级管理员可更新所有企业" ON companies;
DROP POLICY IF EXISTS "超级管理员可删除企业" ON companies;

-- 创建新的 companies RLS 策略
CREATE POLICY "超级管理员可查看所有企业"
  ON companies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.code = 'super_admin'
    )
  );

CREATE POLICY "企业管理员可查看本公司及子公司"
  ON companies FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT * FROM get_user_accessible_companies(auth.uid())
    )
  );

CREATE POLICY "普通用户可查看被授权的企业"
  ON companies FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT * FROM get_user_accessible_companies(auth.uid())
    )
  );

CREATE POLICY "超级管理员可创建企业"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.code = 'super_admin'
    )
  );

CREATE POLICY "企业管理员可创建子公司"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (
    parent_id IN (
      SELECT * FROM get_user_accessible_companies(auth.uid())
    )
  );

CREATE POLICY "超级管理员可更新所有企业"
  ON companies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.code = 'super_admin'
    )
  );

CREATE POLICY "企业管理员可更新本公司及子公司"
  ON companies FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT * FROM get_user_accessible_companies(auth.uid())
    )
  );

CREATE POLICY "超级管理员可删除企业"
  ON companies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.code = 'super_admin'
    )
  );

CREATE POLICY "企业管理员可删除本公司的子公司"
  ON companies FOR DELETE
  TO authenticated
  USING (
    parent_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- 创建索引
CREATE INDEX IF NOT EXISTS companies_parent_id_idx ON companies(parent_id);
CREATE INDEX IF NOT EXISTS companies_level_idx ON companies(level);
CREATE INDEX IF NOT EXISTS data_permissions_user_id_idx ON data_permissions(user_id);
CREATE INDEX IF NOT EXISTS data_permissions_company_id_idx ON data_permissions(company_id);

-- 插入示例数据
INSERT INTO companies (name, code, level, parent_id, contact_person, contact_phone) VALUES
  ('A公司', 'company_a', 1, NULL, '张经理', '13800001111'),
  ('B公司', 'company_b', 1, NULL, '李经理', '13800002222')
ON CONFLICT (code) DO NOTHING;

-- 为子公司预留插入（需要先获取父公司ID）
DO $$
DECLARE
  company_a_id uuid;
BEGIN
  SELECT id INTO company_a_id FROM companies WHERE code = 'company_a' LIMIT 1;
  
  IF company_a_id IS NOT NULL THEN
    INSERT INTO companies (name, code, level, parent_id, contact_person, contact_phone) VALUES
      ('A1公司', 'company_a1', 2, company_a_id, '王主管', '13800003333'),
      ('A2公司', 'company_a2', 2, company_a_id, '赵主管', '13800004444')
    ON CONFLICT (code) DO NOTHING;
  END IF;
END $$;
