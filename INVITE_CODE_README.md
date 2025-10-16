# 🎉 邀请码系统集成说明

## 新增功能

本项目现已集成**邀请码变现系统**，支持两种实现方式：

### 1. localStorage 版本（默认，无需配置）
- ✅ 开箱即用，零配置
- ✅ 完全离线工作
- ✅ 适合个人使用和快速测试

### 2. Supabase 数据库版本（推荐生产环境）
- ✅ 数据持久化
- ✅ 多管理员协同
- ✅ bcrypt 密码加密
- ✅ 行级安全策略（RLS）
- ✅ 生产级可扩展性

---

## 🚀 快速开始

### 使用 localStorage 版本（默认）

```bash
# 1. 安装依赖
npm install

# 2. 启动项目
npm run dev

# 3. 访问管理后台
http://localhost:3000/admin/login

# 4. 创建管理员账户（首次会自动初始化）
# 5. 生成邀请码
# 6. 开始使用！
```

### 使用 Supabase 版本

```bash
# 1. 创建 Supabase 项目
# 访问 https://supabase.com 并创建项目

# 2. 运行数据库迁移
# 在 Supabase SQL Editor 中执行 supabase/schema.sql

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填入您的 Supabase 配置

# 4. 安装依赖
npm install

# 5. 启动项目
npm run dev

# 6. 访问管理后台创建管理员
http://localhost:3000/admin/login
```

---

## 📚 完整文档

### 快速入门
- 📖 [QUICK_START.md](./QUICK_START.md) - 5分钟快速上手指南

### 详细文档
- 📖 [INVITE_CODE_GUIDE.md](./INVITE_CODE_GUIDE.md) - localStorage 版本完整使用指南
- 📖 [SUPABASE_GUIDE.md](./SUPABASE_GUIDE.md) - Supabase 数据库集成指南
- 📖 [SUPABASE_SUMMARY.md](./SUPABASE_SUMMARY.md) - 功能概览和对比

### 技术文档
- 💻 [supabase/schema.sql](./supabase/schema.sql) - 数据库表结构
- 💻 [src/lib/invite-code/](./src/lib/invite-code/) - 核心代码

---

## 🎯 核心功能

### 用户端
- ✅ 邀请码输入和验证
- ✅ 自动状态检查
- ✅ 本地持久化存储

### 管理后台
- ✅ 管理员登录系统
- ✅ 邀请码生成（单次/多次/无限）
- ✅ 批量生成邀请码
- ✅ 邀请码状态管理（启用/禁用/删除）
- ✅ 使用记录查看
- ✅ 统计数据面板
- ✅ CSV 数据导出

---

## 🔒 安全特性

### localStorage 版本
- 简单密码加密
- 适合个人使用
- 数据存储在浏览器本地

### Supabase 版本
- bcrypt 密码加密（成本因子=10）
- PostgreSQL 行级安全策略（RLS）
- API 密钥分离
- 符合生产环境安全标准

---

## 🌐 新增路由

| 路由 | 说明 |
|------|------|
| `/invite` | 邀请码输入页面 |
| `/admin/login` | 管理员登录 |
| `/admin/dashboard` | 管理后台 |

---

## 📦 新增依赖

```json
{
  "@supabase/supabase-js": "^2.39.3",
  "bcryptjs": "^2.4.3"
}
```

---

## 🎨 使用场景

### 1. 付费用户
- 生成单次使用邀请码
- 用户付费后发送邀请码
- 使用后自动失效

### 2. 会员制
- 生成多次使用邀请码
- 设置使用次数（如30次/月）
- 设置有效期（如30天）

### 3. 推广活动
- 批量生成50-100个邀请码
- 设置短期有效期（如7天）
- 通过社交媒体分发

### 4. 企业团购
- 生成无限使用邀请码
- 分享给企业内部员工
- 可随时禁用/启用

---

## ⚡ 技术栈

### 新增技术
- **Supabase**: PostgreSQL 数据库 + 实时 API
- **bcryptjs**: 密码加密
- **RLS**: 行级安全策略

### 原有技术
- React 18 + TypeScript
- React Router v7
- Tailwind CSS + shadcn/ui
- React Query

---

## 📊 数据库表结构（Supabase）

### admins - 管理员表
- 用户名、密码哈希、角色
- 创建时间、最后登录时间
- 激活状态、扩展数据

### invite_codes - 邀请码表
- 邀请码、类型、状态
- 使用次数、最大次数
- 创建时间、过期时间
- 创建者、备注

### invite_code_usages - 使用记录表
- 邀请码ID、使用时间
- 会话ID、用户代理
- IP地址、扩展数据

---

## 🔄 版本选择建议

### 使用 localStorage 如果：
- 个人使用或小规模测试
- 不需要多设备协同
- 希望快速部署

### 使用 Supabase 如果：
- 商业化运营
- 需要数据永久保存
- 多个管理员协同
- 大规模用户使用

---

## 💡 迁移路径

### 从 localStorage 到 Supabase

1. 导出现有邀请码数据
2. 创建 Supabase 项目
3. 运行数据库迁移
4. 更新代码导入
5. 手动导入数据（或重新生成）

详见 [SUPABASE_GUIDE.md](./SUPABASE_GUIDE.md)

---

## 🐛 故障排查

### 常见问题
1. 邀请码验证失败 → 检查邀请码是否正确、是否过期
2. 管理员登录失败 → 检查用户名和密码
3. Supabase 连接失败 → 检查环境变量配置
4. 数据丢失（localStorage）→ 清除浏览器数据导致，使用 Supabase 避免

### 调试工具
- 浏览器开发者工具（F12）
- Console 查看错误日志
- Network 查看请求状态
- Application 查看存储数据

---

## 📞 获取帮助

### 文档
- 查看 [QUICK_START.md](./QUICK_START.md) 快速入门
- 查看 [INVITE_CODE_GUIDE.md](./INVITE_CODE_GUIDE.md) 详细文档
- 查看 [SUPABASE_GUIDE.md](./SUPABASE_GUIDE.md) 数据库指南

### 代码
- 查看代码注释了解实现细节
- 查看测试用例了解使用方法

---

## ✅ 完整功能清单

### 邀请码管理
- [x] 三种类型（单次/多次/无限）
- [x] 使用次数限制
- [x] 有效期管理
- [x] 批量生成
- [x] 状态管理
- [x] 使用记录追踪

### 管理后台
- [x] 管理员登录
- [x] 权限管理
- [x] 统计面板
- [x] 数据导出
- [x] 可视化界面

### 用户功能
- [x] 邀请码输入
- [x] 自动验证
- [x] 状态提示
- [x] 持久化存储

### 安全特性
- [x] 密码加密（bcrypt）
- [x] 会话管理
- [x] RLS 策略（Supabase）
- [x] 数据验证

---

## 🚀 开始使用

选择您的版本，按照对应的快速开始指南操作：

- **localStorage**: 立即开始，无需配置
- **Supabase**: 阅读 [SUPABASE_GUIDE.md](./SUPABASE_GUIDE.md)

**祝您使用愉快！** 🎉
