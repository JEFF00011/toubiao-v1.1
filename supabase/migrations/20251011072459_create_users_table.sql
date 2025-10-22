/*
  # 创建用户管理表

  1. 新建表
    - `users` - 系统用户表
      - `id` (uuid, 主键, 自动生成)
      - `username` (text, 唯一, 非空) - 用户名
      - `email` (text, 唯一, 非空) - 邮箱
      - `phone` (text) - 手机号
      - `gender` (text) - 性别 (男/女)
      - `status` (text, 默认'在线') - 用户状态 (注册/离线/在线/禁用)
      - `avatar` (text) - 头像URL
      - `created_at` (timestamptz, 默认now()) - 创建时间
      - `updated_at` (timestamptz, 默认now()) - 更新时间

  2. 安全设置
    - 启用 RLS (Row Level Security)
    - 添加策略允许已认证用户查看所有用户
    - 添加策略允许已认证用户创建用户
    - 添加策略允许已认证用户更新用户
    - 添加策略允许已认证用户删除用户

  3. 索引
    - 为 email 和 phone 创建索引以提高查询性能
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  gender text CHECK (gender IN ('男', '女')),
  status text DEFAULT '在线' CHECK (status IN ('注册', '离线', '在线', '禁用')),
  avatar text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许已认证用户查看所有用户"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "允许已认证用户创建用户"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "允许已认证用户更新用户"
  ON users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "允许已认证用户删除用户"
  ON users
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_phone_idx ON users(phone);
CREATE INDEX IF NOT EXISTS users_status_idx ON users(status);

INSERT INTO users (username, email, phone, gender, status, avatar, created_at) VALUES
  ('Richard', 's.qlmxkoa@muu.gd', '17642489546', '女', '注册', 'https://i.pravatar.cc/150?img=1', '2017-06-18 07:47:56'),
  ('Daniel', 'e.cyvqiow@vyjv.tv', '17223273891', '女', '离线', 'https://i.pravatar.cc/150?img=2', '1997-08-09 22:31:06')
ON CONFLICT DO NOTHING;