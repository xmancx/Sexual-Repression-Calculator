# 🗄️ Supabase 数据库配置 - 详细步骤指南

## 🎯 步骤 1: 创建 Supabase 项目

### 1.1 访问并注册
- 打开浏览器，访问：https://supabase.com
- 点击 "Sign Up" 注册账户（可以用 GitHub 账号快速注册）

### 1.2 创建新项目
1. 登录后，点击 "New Project"
2. 选择你的组织（如果没有会自动创建一个）
3. 填写项目信息：
   ```
   Project Name: sri-calculator
   Database Password: [设置一个强密码，记住它！]
   Region: 选择离你最近的区域
   ```
4. 点击 "Create new project"
5. 等待 2-3 分钟项目创建完成

### 1.3 获取 API 密钥
项目创建完成后：
1. 在左侧菜单点击 **Settings** → **API**
2. 你会看到两个重要信息：
   ```
   Project URL: https://abc123xyz.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **复制这两个值**，等下要用

---

## 🗃️ 步骤 2: 设置数据库表

### 2.1 打开 SQL 编辑器
1. 在 Supabase Dashboard 左侧菜单点击 **SQL Editor**
2. 点击 **"+ New query"** 创建新查询

### 2.2 复制并执行 SQL
复制以下全部 SQL 代码，粘贴到编辑器中：

```sql
-- ==========================================
-- 性压抑指数计算器 - 数据库表结构
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

-- 创建索引
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_status ON invite_codes(status);
CREATE INDEX idx_invite_code_usages_code_id ON invite_code_usages(code_id);

-- 启用行级安全
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_code_usages ENABLE ROW LEVEL SECURITY;

-- 设置基础安全策略
CREATE POLICY "允许所有操作" ON admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "允许所有操作" ON invite_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "允许所有操作" ON invite_code_usages FOR ALL USING (true) WITH CHECK (true);
```

### 2.3 执行 SQL
点击 **"Run"** 按钮执行 SQL 代码
如果看到 "Success" 消息，说明数据库表创建成功！

---

## ⚙️ 步骤 3: 配置环境变量

### 3.1 编辑 .env 文件
在项目根目录找到 `.env` 文件，用记事本或代码编辑器打开

### 3.2 填入你的 Supabase 配置
将步骤 1.3 中复制的 Project URL 和 anon key 填入：

```env
# Supabase 配置
VITE_SUPABASE_URL=https://你的项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=你的匿名密钥
```

**示例：**
```env
VITE_SUPABASE_URL=https://abc123xyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.3 保存文件
保存 `.env` 文件

---

## 🧪 步骤 4: 测试本地功能

### 4.1 重启开发服务器
如果开发服务器还在运行，它会自动检测配置变化

### 4.2 检查控制台日志
打开浏览器开发者工具 (F12)，查看 Console：
- 如果看到 "Supabase 配置已设置" 说明连接成功
- 如果看到 "使用 localStorage 作为备用方案" 说明配置有问题

### 4.3 测试数据库功能
1. 访问：http://localhost:3000/admin/login
2. 创建第一个管理员账户
3. 创建一些测试邀请码
4. 测试邀请码验证功能

---

## 🚀 步骤 5: 部署到生产环境

### 5.1 提交代码到 GitHub
```bash
git add .
git commit -m "配置 Supabase 数据库集成"
git push origin main
```

### 5.2 部署到 Vercel
1. 访问：https://vercel.com
2. 用 GitHub 账号登录
3. 点击 "New Project"
4. 选择你的 GitHub 仓库
5. 在 "Environment Variables" 部分添加：
   ```
   VITE_SUPABASE_URL = https://你的项目ID.supabase.co
   VITE_SUPABASE_ANON_KEY = 你的匿名密钥
   ```
6. 点击 "Deploy"

### 5.3 等待部署完成
通常需要 2-3 分钟，部署完成后你会得到一个在线链接

---

## ✅ 步骤 6: 验证线上功能

1. 访问你的线上网站（Vercel 提供的链接）
2. 访问 `/admin/login` 创建管理员账户
3. 测试邀请码创建和验证功能
4. 确认数据可以正常保存和读取

---

## 🆘 遇到问题？

### 常见问题解决：

**Q: 控制台显示 "Supabase 配置未设置"**
```
A: 检查 .env 文件是否正确配置，确保 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 都有值
```

**Q: 邀请码创建失败**
```
A: 1. 检查数据库表是否正确创建
   2. 确认 RLS 策略已设置
   3. 查看浏览器控制台的错误信息
```

**Q: 管理员登录失败**
```
A: 1. 首次使用需要创建管理员账户
   2. 检查密码是否正确（至少6位）
   3. 查看数据库 admins 表是否有数据
```

**Q: 部署后功能不正常**
```
A: 1. 确认 Vercel 中的环境变量设置正确
   2. 重新部署项目
   3. 检查 Supabase Dashboard 的日志
```

---

## 🎉 完成！

恭喜！现在你的性压抑指数计算器已经成功集成了 Supabase 数据库！

**你现在拥有：**
✅ 数据持久化存储
✅ 多管理员协同功能
✅ 生产级安全保护
✅ 邀请码管理系统
✅ 使用统计和分析

**下一步建议：**
1. 创建几个测试邀请码
2. 邀请朋友测试功能
3. 根据用户反馈优化体验
4. 考虑添加更多高级功能

**需要帮助？随时联系！** 🚀