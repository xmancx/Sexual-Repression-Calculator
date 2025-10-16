# Supabase 数据库快速设置指南

## 📋 操作步骤

### 1. 创建项目后，在 Supabase Dashboard 中执行以下 SQL：

```sql
-- ==========================================
-- 性压抑指数计算器 - Supabase 数据库表结构
-- ==========================================

-- 1. 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super-admin', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. 邀请码表
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('single', 'multiple', 'unlimited')),
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('active', 'used', 'expired', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  note TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. 邀请码使用记录表
CREATE TABLE IF NOT EXISTS invite_code_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES invite_codes(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 索引
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_status ON invite_codes(status);
CREATE INDEX idx_invite_code_usages_code_id ON invite_code_usages(code_id);
```

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# Supabase 配置
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. 启用行级安全策略

```sql
-- 启用 RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_code_usages ENABLE ROW LEVEL SECURITY;

-- 基础安全策略
CREATE POLICY "允许所有读取操作" ON admins FOR SELECT USING (true);
CREATE POLICY "允许所有读取操作" ON invite_codes FOR SELECT USING (true);
CREATE POLICY "允许所有读取操作" ON invite_code_usages FOR SELECT USING (true);

CREATE POLICY "允许插入操作" ON admins FOR INSERT WITH CHECK (true);
CREATE POLICY "允许插入操作" ON invite_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "允许插入操作" ON invite_code_usages FOR INSERT WITH CHECK (true);

CREATE POLICY "允许更新操作" ON admins FOR UPDATE USING (true);
CREATE POLICY "允许更新操作" ON invite_codes FOR UPDATE USING (true);

CREATE POLICY "允许删除操作" ON invite_codes FOR DELETE USING (true);
```

### 4. 重启项目

```bash
npm run dev
```

项目将自动检测 Supabase 配置并切换到数据库模式！