/*
  # 创建完整的角色权限管理系统

  1. 新建表
    - `companies` - 企业表
      - `id` (uuid, 主键)
      - `name` (text, 非空) - 企业名称
      - `code` (text, 唯一) - 企业代码
      - `contact_person` (text) - 联系人
      - `contact_phone` (text) - 联系电话
      - `address` (text) - 地址
      - `created_at` (timestamptz, 默认now())
      - `updated_at` (timestamptz, 默认now())

    - `roles` - 角色表
      - `id` (uuid, 主键)
      - `name` (text, 唯一, 非空) - 角色名称
      - `code` (text, 唯一, 非空) - 角色代码 (super_admin/company_admin/normal_user)
      - `description` (text) - 角色描述
      - `created_at` (timestamptz, 默认now())

    - `permissions` - 权限表
      - `id` (uuid, 主键)
      - `name` (text, 非空) - 权限名称
      - `code` (text, 唯一, 非空) - 权限代码
      - `module` (text, 非空) - 所属模块
      - `description` (text) - 权限描述
      - `created_at` (timestamptz, 默认now())

    - `role_permissions` - 角色权限关联表
      - `id` (uuid, 主键)
      - `role_id` (uuid, 外键) - 角色ID
      - `permission_id` (uuid, 外键) - 权限ID
      - `created_at` (timestamptz, 默认now())

    - `users` - 用户表
      - `id` (uuid, 主键)
      - `username` (text, 唯一, 非空) - 用户名
      - `phone` (text, 唯一, 非空) - 手机号
      - `password_hash` (text) - 密码哈希
      - `company_id` (uuid, 外键) - 所属企业ID
      - `role_id` (uuid, 外键) - 角色ID
      - `enabled` (boolean, 默认true) - 是否启用
      - `created_at` (timestamptz, 默认now())
      - `updated_at` (timestamptz, 默认now())

  2. 安全设置
    - 启用所有表的 RLS
    - 超级管理员可以访问所有数据
    - 企业管理员只能访问自己企业的数据
    - 普通用户只能查看和修改自己的数据

  3. 初始数据
    - 创建三个系统角色：超级管理员、企业管理员、普通用户
    - 创建对应的权限数据
    - 创建角色权限关联
*/

-- 创建企业表
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  contact_person text,
  contact_phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建角色表
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- 创建权限表
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  module text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- 创建角色权限关联表
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  phone text UNIQUE NOT NULL,
  password_hash text,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 启用 RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 企业表 RLS 策略
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

CREATE POLICY "企业管理员可查看自己的企业"
  ON companies FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid()
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

-- 角色表 RLS 策略
CREATE POLICY "所有已认证用户可查看角色"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "超级管理员可管理角色"
  ON roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.code = 'super_admin'
    )
  );

-- 权限表 RLS 策略
CREATE POLICY "所有已认证用户可查看权限"
  ON permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "超级管理员可管理权限"
  ON permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.code = 'super_admin'
    )
  );

-- 角色权限关联表 RLS 策略
CREATE POLICY "所有已认证用户可查看角色权限关联"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "超级管理员可管理角色权限关联"
  ON role_permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.code = 'super_admin'
    )
  );

-- 用户表 RLS 策略
CREATE POLICY "超级管理员可查看所有用户"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.code = 'super_admin'
    )
  );

CREATE POLICY "企业管理员可查看本企业用户"
  ON users FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.code = 'company_admin'
    )
  );

CREATE POLICY "用户可查看自己的信息"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "超级管理员可创建用户"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.code = 'super_admin'
    )
  );

CREATE POLICY "企业管理员可创建本企业用户"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.code = 'company_admin'
    )
  );

CREATE POLICY "超级管理员可更新所有用户"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.code = 'super_admin'
    )
  );

CREATE POLICY "企业管理员可更新本企业用户"
  ON users FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.code = 'company_admin'
    )
  );

CREATE POLICY "用户可更新自己的信息"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "超级管理员可删除用户"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.code = 'super_admin'
    )
  );

CREATE POLICY "企业管理员可删除本企业用户"
  ON users FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.code = 'company_admin'
    )
  );

-- 插入初始角色数据
INSERT INTO roles (name, code, description) VALUES
  ('超级管理员', 'super_admin', '拥有系统所有功能权限，可管理所有企业和用户'),
  ('企业管理员', 'company_admin', '可管理本企业的所有配置和用户，包括企业知识库'),
  ('普通用户', 'normal_user', '仅可查看企业知识库，拥有招标项目、投标文件生成和检查的所有权限')
ON CONFLICT (code) DO NOTHING;

-- 插入权限数据
INSERT INTO permissions (name, code, module, description) VALUES
  ('查看企业知识库', 'knowledge_view', 'knowledge', '查看企业知识库内容'),
  ('编辑企业知识库', 'knowledge_edit', 'knowledge', '编辑、上传企业知识库内容'),
  ('查看招标项目', 'project_view', 'project', '查看招标项目'),
  ('创建招标项目', 'project_create', 'project', '创建招标项目'),
  ('编辑招标项目', 'project_edit', 'project', '编辑招标项目'),
  ('删除招标项目', 'project_delete', 'project', '删除招标项目'),
  ('查看投标文件', 'document_view', 'document', '查看生成的投标文件'),
  ('生成投标文件', 'document_generate', 'document', '生成投标文件'),
  ('编辑投标文件', 'document_edit', 'document', '编辑投标文件'),
  ('删除投标文件', 'document_delete', 'document', '删除投标文件'),
  ('查看检查结果', 'check_view', 'check', '查看投标文件检查结果'),
  ('执行文件检查', 'check_execute', 'check', '执行投标文件检查'),
  ('查看用户信息', 'user_view', 'system', '查看用户信息'),
  ('管理用户', 'user_manage', 'system', '管理用户（增删改）'),
  ('管理角色', 'role_manage', 'system', '管理角色和权限'),
  ('管理企业', 'company_manage', 'system', '管理企业信息'),
  ('系统设置', 'system_settings', 'system', '修改系统设置')
ON CONFLICT (code) DO NOTHING;

-- 为超级管理员分配所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'super_admin'
ON CONFLICT DO NOTHING;

-- 为企业管理员分配权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'company_admin'
  AND p.code IN (
    'knowledge_view', 'knowledge_edit',
    'project_view', 'project_create', 'project_edit', 'project_delete',
    'document_view', 'document_generate', 'document_edit', 'document_delete',
    'check_view', 'check_execute',
    'user_view', 'user_manage'
  )
ON CONFLICT DO NOTHING;

-- 为普通用户分配权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'normal_user'
  AND p.code IN (
    'knowledge_view',
    'project_view', 'project_create', 'project_edit', 'project_delete',
    'document_view', 'document_generate', 'document_edit', 'document_delete',
    'check_view', 'check_execute',
    'user_view'
  )
ON CONFLICT DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS users_company_id_idx ON users(company_id);
CREATE INDEX IF NOT EXISTS users_role_id_idx ON users(role_id);
CREATE INDEX IF NOT EXISTS users_enabled_idx ON users(enabled);
CREATE INDEX IF NOT EXISTS users_phone_idx ON users(phone);
CREATE INDEX IF NOT EXISTS role_permissions_role_id_idx ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS role_permissions_permission_id_idx ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS companies_code_idx ON companies(code);
