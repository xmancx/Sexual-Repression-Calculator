# 🗄️ Supabase 数据库集成指南

## 📋 概述

本指南将帮助您将邀请码系统从 localStorage 迁移到 Supabase 数据库，实现：

- ✅ 数据持久化存储
- ✅ 多管理员协同工作
- ✅ bcrypt 密码加密
- ✅ 行级安全策略（RLS）
- ✅ 实时数据同步
- ✅ 生产级别的安全性

---

## 🚀 快速开始

### 步骤 1: 创建 Supabase 项目

1. 访问 [Supabase官网](https://supabase.com/)
2. 注册/登录账户
3. 点击 "New Project" 创建新项目
4. 填写项目信息：
   - Project name: `sri-calculator`（或您喜欢的名称）
   - Database Password: 设置强密码（保存好）
   - Region: 选择离您最近的区域
5. 等待项目创建完成（约2分钟）

### 步骤 2: 运行数据库迁移

1. 在 Supabase Dashboard 中，点击左侧菜单的 **SQL Editor**
2. 点击 "+ New query"
3. 复制 `supabase/schema.sql` 文件的全部内容
4. 粘贴到 SQL 编辑器中
5. 点击 "Run" 执行 SQL

✅ **成功！** 数据库表结构已创建

### 步骤 3: 获取 API 密钥

1. 在 Supabase Dashboard 中，点击左侧菜单的 **Settings** → **API**
2. 找到以下两个值：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public key**: 一串很长的 JWT token

### 步骤 4: 配置环境变量

1. 在项目根目录创建 `.env` 文件（复制 `.env.example`）：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入您的 Supabase 配置：
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **⚠️ 重要**：将 `.env` 添加到 `.gitignore`，不要提交到 Git

### 步骤 5: 安装依赖

```bash
npm install @supabase/supabase-js bcryptjs
npm install --save-dev @types/bcryptjs
```

### 步骤 6: 启动项目

```bash
npm run dev
```

---

## 🔄 迁移现有数据（可选）

如果您已经在 localStorage 中有数据，可以选择迁移：

### 导出 localStorage 数据

1. 打开浏览器开发者工具（F12）
2. 进入 **Console** 标签页
3. 运行以下代码：
   ```javascript
   // 导出邀请码数据
   const data = localStorage.getItem('sri_admin_data');
   console.log(JSON.parse(data));
   ```

4. 复制输出的 JSON 数据

### 导入到 Supabase

目前需要手动导入，或者使用管理后台逐个创建邀请码。

---

## 📊 数据库表结构

### 1. admins - 管理员表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| username | TEXT | 用户名（唯一） |
| password_hash | TEXT | bcrypt 加密的密码 |
| role | TEXT | 角色（super-admin/admin） |
| created_at | TIMESTAMPTZ | 创建时间 |
| last_login_at | TIMESTAMPTZ | 最后登录时间 |
| is_active | BOOLEAN | 是否激活 |
| metadata | JSONB | 扩展数据 |

### 2. invite_codes - 邀请码表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| code | TEXT | 邀请码（唯一） |
| type | TEXT | 类型（single/multiple/unlimited） |
| max_uses | INTEGER | 最大使用次数（-1=无限） |
| used_count | INTEGER | 已使用次数 |
| status | TEXT | 状态（active/used/expired/disabled） |
| created_at | TIMESTAMPTZ | 创建时间 |
| expires_at | TIMESTAMPTZ | 过期时间 |
| created_by | UUID | 创建者ID（外键） |
| note | TEXT | 备注 |
| metadata | JSONB | 扩展数据 |

### 3. invite_code_usages - 使用记录表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| code_id | UUID | 邀请码ID（外键） |
| code | TEXT | 邀请码 |
| used_at | TIMESTAMPTZ | 使用时间 |
| session_id | TEXT | 会话ID |
| user_agent | TEXT | 用户代理 |
| ip_address | TEXT | IP地址 |
| metadata | JSONB | 扩展数据 |

---

## 🔐 安全特性

### 行级安全策略（RLS）

Supabase 使用 PostgreSQL 的 RLS 功能确保数据安全：

1. **管理员表**
   - 管理员可以查看所有管理员
   - 只有超级管理员可以创建新管理员
   - 管理员只能更新自己的信息

2. **邀请码表**
   - 只有激活的管理员可以查看、创建、更新、删除邀请码
   - 所有操作都会记录创建者

3. **使用记录表**
   - 管理员可以查看所有使用记录
   - 系统可以自动创建使用记录

### 密码加密

- 使用 bcrypt 加密密码（成本因子=10）
- 密码永远不会以明文存储
- 登录时通过 bcrypt.compare 验证

---

## 🔧 使用 Supabase 版本

### 代码调整

主要代码已经准备好，您需要做的调整：

#### 1. 更新 `src/lib/invite-code/index.ts`

在文件开头添加：
```typescript
// 导入 Supabase 版本
import * as SupabaseAPI from './supabase';
import { isSupabaseAvailable } from '@/lib/supabase/client';

// 自动选择使用 Supabase 或 localStorage
const useSupabase = isSupabaseAvailable();

export const createInviteCode = useSupabase
  ? SupabaseAPI.createInviteCode
  : localStorageCreateInviteCode;

// ... 其他函数类似
```

#### 2. 或者直接使用 Supabase

在管理后台和相关组件中：
```typescript
// 替换导入
import {
  createInviteCode,
  getAllInviteCodes,
  // ... 其他函数
} from '@/lib/invite-code/supabase'; // 使用 supabase 版本
```

---

## 📈 数据库函数和触发器

### 自动触发器

1. **自动更新邀请码状态**
   - 当使用次数达到上限时，自动标记为 `used`
   - 当过期时间到达时，自动标记为 `expired`

2. **自动增加使用次数**
   - 当创建使用记录时，自动增加邀请码的 `used_count`

### 数据库函数

1. **validate_invite_code(code)**
   - 验证邀请码是否有效
   - 返回验证结果和原因
   - 自动更新过期状态

2. **get_invite_stats()**
   - 获取所有统计数据
   - 包含最近10条使用记录
   - 性能优化

---

## 🎯 API 使用示例

### 创建邀请码
```typescript
import { createInviteCode } from '@/lib/invite-code/supabase';

const code = await createInviteCode({
  type: 'multiple',
  maxUses: 10,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天
  note: '月度会员'
}, adminId);
```

### 验证邀请码
```typescript
import { validateInviteCode } from '@/lib/invite-code/supabase';

const result = await validateInviteCode('ABC123XYZ456');
if (result.valid) {
  console.log('邀请码有效！');
} else {
  console.log('失败原因:', result.reason);
}
```

### 获取统计数据
```typescript
import { getInviteCodeStats } from '@/lib/invite-code/supabase';

const stats = await getInviteCodeStats();
console.log('总邀请码:', stats.totalCodes);
console.log('激活中:', stats.activeCodes);
```

---

## 🐛 常见问题

### Q1: "Supabase 未配置" 错误

**A:** 检查：
1. `.env` 文件是否存在且配置正确
2. 环境变量名是否以 `VITE_` 开头
3. 重启开发服务器（`npm run dev`）

### Q2: RLS 策略阻止访问

**A:** 这是正常的安全措施。确保：
1. 管理员已正确登录
2. 使用 `auth.uid()` 作为身份验证
3. 检查 Supabase Dashboard 的 RLS 策略

### Q3: 数据库连接失败

**A:** 检查：
1. Supabase Project URL 是否正确
2. API Key 是否正确（使用 `anon` key）
3. 网络连接是否正常
4. Supabase 项目是否处于激活状态

### Q4: 密码验证失败

**A:**
1. 确保使用 bcrypt 加密密码
2. 不要使用简单的 Base64 编码
3. 密码长度至少6位

---

## 🔄 从 localStorage 切换到 Supabase

### 方案 1: 平滑过渡（推荐）

保留 localStorage 版本作为备份：

```typescript
// src/lib/invite-code/index.ts
import { isSupabaseAvailable } from '@/lib/supabase/client';
import * as SupabaseAPI from './supabase';
import * as LocalStorageAPI from './localStorage'; // 重命名原版本

export const createInviteCode = isSupabaseAvailable()
  ? SupabaseAPI.createInviteCode
  : LocalStorageAPI.createInviteCode;

// ... 其他函数类似
```

### 方案 2: 完全迁移

直接替换所有导入：

```typescript
// 替换所有
import { ... } from '@/lib/invite-code';
// 为
import { ... } from '@/lib/invite-code/supabase';
```

---

## 📊 性能优化

### 索引

数据库已经创建了必要的索引：
- `code` 列（快速查找）
- `status` 列（筛选状态）
- `expires_at` 列（过期查询）
- `used_at` 列（排序）

### 视图

提供了两个视图简化查询：
- `invite_code_stats`: 快速获取统计数据
- `invite_codes_with_creator`: 包含创建者信息的邀请码

### 缓存策略

建议在客户端使用 React Query 缓存：
```typescript
import { useQuery } from '@tanstack/react-query';

const { data: codes } = useQuery({
  queryKey: ['invite-codes'],
  queryFn: getAllInviteCodes,
  staleTime: 5 * 60 * 1000, // 5分钟
});
```

---

## 🚀 生产环境部署

### Cloudflare Pages

1. 在 Cloudflare Pages 设置中添加环境变量：
   ```
   VITE_SUPABASE_URL=your-url
   VITE_SUPABASE_ANON_KEY=your-key
   ```

2. 构建配置不变：
   ```
   Build command: npm run cf:deploy
   Build output directory: dist
   ```

### Vercel

1. 在 Vercel 项目设置中添加环境变量
2. 自动部署时会读取环境变量

### 自托管

确保服务器环境变量正确设置。

---

## 📚 相关资源

- [Supabase 官方文档](https://supabase.com/docs)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [bcrypt 文档](https://github.com/kelektiv/node.bcrypt.js)

---

## ✅ 检查清单

完成以下步骤确保 Supabase 集成成功：

- [ ] 创建 Supabase 项目
- [ ] 运行 `supabase/schema.sql` 创建表结构
- [ ] 配置 `.env` 文件
- [ ] 安装依赖（`@supabase/supabase-js`, `bcryptjs`）
- [ ] 更新代码导入 Supabase 版本
- [ ] 测试管理员创建
- [ ] 测试邀请码生成
- [ ] 测试邀请码验证
- [ ] 测试使用记录
- [ ] 检查 RLS 策略
- [ ] 部署到生产环境

---

## 🎉 完成！

现在您的邀请码系统已经升级到 Supabase，享受以下好处：

- ✅ 数据永久存储，不会丢失
- ✅ 多个管理员可以协同工作
- ✅ 更安全的密码加密
- ✅ 生产级别的可扩展性
- ✅ 实时数据同步
- ✅ 专业的数据库管理

**祝您使用愉快！** 🚀
