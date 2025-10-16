# 🚀 部署指南 - 性压抑指数计算器

## 📋 部署选项概览

本项目支持两种部署方式：

### 1. **静态网站部署** (推荐新手)
- ✅ 零成本
- ✅ 无需数据库配置
- ✅ 数据存储在用户浏览器（隐私保护）
- ✅ 一键部署到 Vercel、Netlify 等
- ❌ 数据可能丢失（用户清理浏览器）

### 2. **数据库部署** (推荐商业用途)
- ✅ 数据持久化
- ✅ 多管理员协同
- ✅ 生产级安全
- ✅ 数据统计和分析
- ❌ 需要配置 Supabase

---

## 🎯 选项 1: 静态网站部署 (5分钟搞定)

### Vercel 部署 (最简单)

1. **准备代码**
   ```bash
   # 确保代码是最新的
   git status
   git add .
   git commit -m "Ready for deployment"
   ```

2. **部署到 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 用 GitHub 账号登录
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Deploy"

3. **完成！** 🎉
   - Vercel 会自动构建和部署
   - 几分钟后你就获得一个在线网站

### Netlify 部署

1. **构建项目**
   ```bash
   npm run build
   ```

2. **部署到 Netlify**
   - 访问 [netlify.com](https://netlify.com)
   - 拖拽 `dist` 文件夹到部署区域
   - 完成！

---

## 🗄️ 选项 2: 数据库部署 (专业版)

### 步骤 1: 配置 Supabase

1. **创建 Supabase 项目**
   - 访问 [supabase.com](https://supabase.com)
   - 注册并创建新项目
   - 记录 Project URL 和 anon key

2. **设置数据库表**
   - 打开 Supabase Dashboard
   - 进入 SQL Editor
   - 复制 `setup-supabase.md` 中的 SQL 代码
   - 点击 "Run" 执行

3. **配置环境变量**
   ```bash
   # 编辑 .env 文件
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 步骤 2: 部署到 Vercel

1. **设置环境变量**
   - 在 Vercel 项目设置中
   - 添加环境变量：
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

2. **自动部署**
   - Vercel 会自动检测环境变量
   - 重新部署项目

3. **创建管理员账户**
   - 访问 `https://your-domain.com/admin/login`
   - 创建第一个管理员账户

---

## 🔧 域名配置

### Vercel 自定义域名
1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的域名（如 `your-domain.com`）
3. 按提示配置 DNS 记录

### Netlify 自定义域名
1. 在 Netlify 设置中点击 "Domain management"
2. 添加自定义域名
3. 配置 DNS 记录

---

## 🛡️ 安全注意事项

### 数据库版本
- ✅ 使用 bcrypt 密码加密
- ✅ 行级安全策略 (RLS)
- ✅ 数据库连接加密
- ✅ API 密钥保护

### 静态版本
- ✅ 数据完全本地存储
- ✅ 无服务器端数据泄露风险
- ✅ 用户完全控制数据

---

## 💰 成本对比

| 部署方式 | 成本 | 维护 | 扩展性 |
|---------|------|------|--------|
| 静态网站 | 免费 | 极简 | 有限 |
| 数据库版本 | 免费额度 | 中等 | 高 |

### Supabase 免费额度
- 500MB 数据库存储
- 50,000 月活用户
- 2GB 带宽
- 无限 API 调用

---

## 🚀 部署后检查清单

### 基础功能测试
- [ ] 网站可以正常访问
- [ ] 邀请码系统工作正常
- [ ] 测评功能完整
- [ ] 响应式设计正常

### 数据库版本额外测试
- [ ] 管理员可以登录
- [ ] 可以创建和管理邀请码
- [ ] 数据统计显示正确
- [ ] 多设备数据同步正常

### 性能优化
- [ ] 页面加载速度 < 3秒
- [ ] 移动端体验良好
- [ ] SEO 基础设置完成

---

## 🆘 常见问题

### Q: 静态版本和数据库版本有什么区别？
A: 静态版本数据存在用户浏览器，数据库版本数据存在云端服务器。

### Q: 可以从静态版本升级到数据库版本吗？
A: 可以！只需要配置 Supabase 并设置环境变量，系统会自动切换。

### Q: 数据库版本需要付费吗？
A: Supabase 有免费额度，小型项目完全够用。超过后按用量付费。

### Q: 如何备份数据？
A: 静态版本用户可以导出数据，数据库版本有自动备份功能。

---

## 🎉 部署成功！

恭喜！你现在拥有一个在线的性压抑指数计算器网站！

**下一步建议：**
1. 分享你的网站链接
2. 创建几个测试邀请码
3. 收集用户反馈
4. 考虑添加更多功能

**需要帮助？**
- 查看 [项目文档](./README.md)
- 检查 [快速开始指南](./QUICK_START.md)
- 提交 Issue 到 GitHub 仓库

**祝你的项目成功！** 🚀