# 🎯 Supabase 邀请码系统 - 完整设置指南

## 📋 前置条件

- Node.js >= 22.0.0
- npm 或 yarn
- Supabase 账户（免费）
- 现代浏览器

---

## 🚀 第一部分：Supabase 项目设置

### 步骤 1: 注册 Supabase 账户

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 "Start your project"
3. 使用 GitHub/Google/Email 注册
4. 验证邮箱（如果需要）

### 步骤 2: 创建新项目

1. 登录后，点击 "New Project"
2. 填写项目信息：
   ```
   Organization: 选择或创建组织
   Project name: sri-calculator（或任意名称）
   Database Password: 创建强密码并保存
   Region: 选择最近的区域
   - 中国用户推荐：Singapore (ap-southeast-1)
   - 美国用户推荐：US East (us-east-1)
   Pricing Plan: Free（免费版）
   ```
3. 点击 "Create new project"
4. 等待 2-3 分钟项目初始化

### 步骤 3: 运行数据库迁移

1. 项目创建完成后，点击左侧菜单 **SQL Editor**
2. 点击右上角 "+ New query"
3. 打开本地项目的 `supabase/schema.sql` 文件
4. 复制全部内容（约500行）
5. 粘贴到 Supabase SQL Editor
6. 点击右下角 "Run" 按钮
7. 等待执行完成，应该看到 "Success. No rows returned"

✅ **验证成功**：点击左侧菜单 **Table Editor**，应该看到三个表：
- `admins`
- `invite_codes`
- `invite_code_usages`

### 步骤 4: 获取 API 密钥

1. 点击左侧菜单 **Settings** → **API**
2. 在 "Project API keys" 部分找到：
   - **Project URL**: 类似 `https://abcdefghijk.supabase.co`
   - **anon public key**: 一串很长的字符串，以 `eyJ...` 开头
3. 复制这两个值，稍后会用到

⚠️ **重要提示**：
- 只复制 `anon` key，不要使用 `service_role` key
- `anon` key 可以安全地暴露在客户端
- `service_role` key 应该保密，只在服务器端使用

---

## 🎨 第二部分：项目配置

### 步骤 1: 安装依赖

```bash
# 进入项目目录
cd Sexual-Repression-Calculator-main

# 安装所有依赖（包括 Supabase SDK）
npm install

# 或使用 yarn
yarn install
```

### 步骤 2: 配置环境变量

```bash
# 1. 复制示例文件
cp .env.example .env

# 2. 编辑 .env 文件
# 在 Windows 上：
notepad .env

# 在 Mac/Linux 上：
nano .env
# 或
vim .env
```

填入您的 Supabase 配置：
```env
# Supabase 配置
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **安全提示**：
- 不要将 `.env` 文件提交到 Git
- 确保 `.env` 已在 `.gitignore` 中
- 不要在公共场合分享这些密钥

### 步骤 3: 更新代码使用 Supabase

打开 `src/lib/invite-code/index.ts`，在文件开头添加：

```typescript
// 在文件顶部添加
import { isSupabaseAvailable } from '@/lib/supabase/client';
import * as SupabaseAPI from './supabase';

// 如果 Supabase 可用，使用 Supabase API，否则使用 localStorage
const useSupabase = isSupabaseAvailable();

// 导出函数时选择版本
export const createInviteCode = useSupabase
  ? SupabaseAPI.createInviteCode
  : createInviteCodeLocal; // 重命名原函数

// 对所有函数重复此模式
```

或者，直接在管理后台和相关组件中导入 Supabase 版本：

```typescript
// 替换
import { createInviteCode } from '@/lib/invite-code';

// 为
import { createInviteCode } from '@/lib/invite-code/supabase';
```

---

## 🧪 第三部分：测试

### 步骤 1: 启动开发服务器

```bash
npm run dev
```

应该看到：
```
> Local:    http://localhost:3000/
```

### 步骤 2: 创建第一个管理员

1. 访问 http://localhost:3000/admin/login
2. 系统会自动检测到没有管理员，显示"初始化管理员"界面
3. 填写信息：
   ```
   用户名: admin
   密码: admin123（或更强的密码）
   确认密码: admin123
   ```
4. 点击"创建管理员"
5. 自动登录到管理后台

✅ **验证**：在 Supabase Dashboard 中：
- 点击 **Table Editor** → **admins**
- 应该看到一条记录，role 为 `super-admin`

### 步骤 3: 生成第一个邀请码

1. 在管理后台，点击"创建邀请码"
2. 配置：
   ```
   邀请码类型: 单次使用
   生成数量: 1
   有效期: 0（永久）
   备注: 测试邀请码
   ```
3. 点击"创建"
4. 应该看到新生成的邀请码出现在列表中

✅ **验证**：在 Supabase Dashboard 中：
- 点击 **Table Editor** → **invite_codes**
- 应该看到一条记录，status 为 `active`

### 步骤 4: 测试用户使用流程

1. 复制刚生成的邀请码（12位大写字母+数字）
2. 打开新的隐身窗口：
   - Chrome/Edge: Ctrl+Shift+N
   - Firefox: Ctrl+Shift+P
3. 访问 http://localhost:3000
4. 点击"开始快速测评"
5. 会跳转到邀请码输入页面
6. 粘贴邀请码，点击"验证邀请码"
7. 验证成功，跳转回首页并显示成功提示

✅ **验证**：在 Supabase Dashboard 中：
- 点击 **Table Editor** → **invite_code_usages**
- 应该看到一条使用记录
- invite_codes 表中该邀请码的 `used_count` 应该变为 1

---

## 🔍 第四部分：高级配置

### 配置 RLS 策略（已自动完成）

RLS 策略已在 `schema.sql` 中配置，无需手动操作。验证：

1. 在 Supabase Dashboard 中，点击 **Authentication** → **Policies**
2. 选择表：`admins`, `invite_codes`, `invite_code_usages`
3. 应该看到多条策略，全部启用

### 配置数据库函数（已自动完成）

数据库函数已在 `schema.sql` 中创建，验证：

1. 在 SQL Editor 中运行：
   ```sql
   SELECT * FROM validate_invite_code('TEST123');
   ```
2. 应该返回结果（可能是 invalid）

### 配置触发器（已自动完成）

触发器已自动创建，会在：
- 创建使用记录时自动增加 `used_count`
- 更新邀请码时自动检查状态

---

## 📊 第五部分：监控和管理

### 查看数据库

1. **Table Editor**: 查看和编辑表数据
2. **SQL Editor**: 运行自定义查询
3. **Database**: 查看表结构和关系

### 监控 API 使用

1. 点击 **Settings** → **Usage**
2. 查看：
   - Database size
   - API requests
   - Storage usage
   - Bandwidth

### 查看日志

1. 点击 **Logs**
2. 选择日志类型：
   - Postgres Logs
   - API Logs
   - Auth Logs

---

## 🌐 第六部分：部署到生产环境

### Cloudflare Pages

1. 在 Cloudflare Pages 项目设置中添加环境变量：
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. 构建配置：
   ```
   Build command: npm run cf:deploy
   Build output directory: dist
   ```

3. 部署项目

### Vercel

1. 在 Vercel 项目设置中添加环境变量
2. 自动部署时会读取环境变量

### 自托管

确保服务器环境变量正确设置：
```bash
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-anon-key"
```

---

## 🔧 第七部分：故障排查

### 问题 1: "Supabase 未配置" 错误

**原因**：环境变量未正确设置

**解决方案**：
1. 检查 `.env` 文件是否存在
2. 检查环境变量名是否正确（必须以 `VITE_` 开头）
3. 重启开发服务器：
   ```bash
   # 停止服务器（Ctrl+C）
   # 重新启动
   npm run dev
   ```

### 问题 2: SQL 执行失败

**原因**：SQL 语法错误或权限问题

**解决方案**：
1. 确保复制了完整的 `schema.sql` 内容
2. 检查是否有遗漏的语句
3. 分段执行 SQL（先创建表，再创建函数）

### 问题 3: RLS 策略阻止访问

**原因**：行级安全策略限制

**解决方案**：
1. 暂时禁用 RLS（仅测试）：
   ```sql
   ALTER TABLE invite_codes DISABLE ROW LEVEL SECURITY;
   ```
2. 检查管理员是否正确登录
3. 检查 RLS 策略配置

### 问题 4: API 请求失败

**原因**：网络问题或 API Key 错误

**解决方案**：
1. 检查网络连接
2. 验证 Supabase URL 和 API Key
3. 在浏览器 Network 标签查看请求详情

---

## 📚 第八部分：资源链接

### 官方文档
- [Supabase 文档](https://supabase.com/docs)
- [Supabase JS 客户端](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)

### 相关教程
- [Supabase 快速开始](https://supabase.com/docs/guides/getting-started)
- [RLS 指南](https://supabase.com/docs/guides/auth/row-level-security)
- [数据库函数](https://supabase.com/docs/guides/database/functions)

### 项目文档
- [QUICK_START.md](./QUICK_START.md)
- [INVITE_CODE_GUIDE.md](./INVITE_CODE_GUIDE.md)
- [SUPABASE_GUIDE.md](./SUPABASE_GUIDE.md)

---

## ✅ 完整检查清单

### 环境准备
- [ ] Node.js >= 22.0.0 已安装
- [ ] Supabase 账户已注册
- [ ] 项目已克隆/下载

### Supabase 设置
- [ ] Supabase 项目已创建
- [ ] 数据库迁移 SQL 已执行
- [ ] 三个表已成功创建
- [ ] API 密钥已获取

### 项目配置
- [ ] 依赖已安装（npm install）
- [ ] .env 文件已创建
- [ ] 环境变量已正确配置
- [ ] 代码已更新使用 Supabase

### 功能测试
- [ ] 开发服务器启动成功
- [ ] 管理员创建成功
- [ ] 邀请码生成成功
- [ ] 邀请码验证成功
- [ ] 使用记录创建成功

### 数据验证
- [ ] admins 表有数据
- [ ] invite_codes 表有数据
- [ ] invite_code_usages 表有数据
- [ ] RLS 策略已启用
- [ ] 数据库函数工作正常

---

## 🎉 恭喜！

您已成功设置 Supabase 邀请码系统！现在可以：

- ✅ 创建和管理邀请码
- ✅ 追踪使用情况
- ✅ 多管理员协同工作
- ✅ 数据永久保存
- ✅ 享受生产级安全性

**开始使用吧！** 🚀

---

*有问题？查看 [SUPABASE_GUIDE.md](./SUPABASE_GUIDE.md) 的故障排查部分。*
