# 部署检查清单

本清单帮助您完成本地登陆验证系统的部署。

## 📋 环境准备

### 前置条件
- [ ] Node.js 已安装 (v16+)
- [ ] pnpm 已安装 (v8+)
- [ ] MySQL 数据库已运行
- [ ] 数据库连接正常

### 环境变量配置
- [ ] 创建或编辑 `.env.local` 文件
- [ ] 配置 `DATABASE_URL`
- [ ] 配置 `JWT_SECRET`
- [ ] 可选：配置 OAuth 相关变量

## 🗄️ 数据库准备

### 数据库连接
- [ ] 测试数据库连接：`mysql -u user -p -h localhost`
- [ ] 确认数据库存在

### 数据库迁移
- [ ] 运行迁移：`pnpm drizzle-kit migrate`
- [ ] 验证新字段已添加：
  ```sql
  SHOW COLUMNS FROM users;
  ```
  应看到：
  - `passwordHash` (varchar(255))
  - `isLocalAuthEnabled` (boolean)

## 👤 管理员账户创建

### 方式 A: 交互式设置
- [ ] 运行脚本：`node scripts/setup-local-auth.mjs`
- [ ] 按提示输入邮箱、名称、密码
- [ ] 复制生成的 SQL 语句
- [ ] 在 MySQL 中执行

### 方式 B: 手动 SQL
- [ ] 使用 `scripts/setup-local-auth.mjs` 生成密码哈希
- [ ] 手动编写 INSERT 语句
- [ ] 在 MySQL 中执行

### 验证
- [ ] 查询用户是否创建成功：
  ```sql
  SELECT id, email, name, role, isLocalAuthEnabled FROM users WHERE email = '你的邮箱';
  ```

## 🚀 依赖和构建

### 安装依赖
- [ ] 运行 `pnpm install`
- [ ] 等待安装完成

### 构建验证
- [ ] 运行 `pnpm build`
- [ ] 检查是否有编译错误

### 类型检查
- [ ] 运行 `pnpm type-check`
- [ ] 确保没有类型错误

## 🧪 测试

### 单元测试
- [ ] 运行 `pnpm test server/local-auth.test.ts`
- [ ] 所有测试应该通过

### 密码函数测试
- [ ] 验证 `hashPassword()` 返回正确格式
- [ ] 验证 `verifyPassword()` 正确验证
- [ ] 验证 `generateTemporaryPassword()` 生成密码

## 🎯 功能验证

### 启动开发服务器
- [ ] 运行 `pnpm dev`
- [ ] 等待服务器启动（通常 15-30 秒）
- [ ] 检查是否有错误日志

### 前端验证
- [ ] 打开 `http://localhost:3000`
- [ ] 验证前端正常加载
- [ ] 检查浏览器控制台无红色错误

### 登陆功能测试

#### OAuth 登陆（如配置）
- [ ] 点击"官方登录"标签
- [ ] 验证"立即登录"按钮可点击
- [ ] （可选）完成 OAuth 流程

#### 本地登陆
- [ ] 点击"本地登录"标签
- [ ] 输入邮箱和密码
- [ ] 点击"登录"按钮
- [ ] 验证登陆成功
- [ ] 验证重定向到 `/admin`
- [ ] 验证显示用户信息和管理菜单

#### 错误处理
- [ ] 输入错误邮箱测试
- [ ] 输入错误密码测试
- [ ] 验证显示错误信息

### 用户管理验证
- [ ] 在侧边栏找到"本地账户管理"（如有）
- [ ] 查看当前用户列表
- [ ] 创建新用户（如有权限）
- [ ] 验证新用户出现在列表中

### 登出功能
- [ ] 点击用户卡片中的"退出登录"
- [ ] 验证重定向到登陆页面
- [ ] 验证 app_session_id Cookie 被清除

## 📊 数据验证

### 数据库检查
- [ ] 检查用户表是否有新记录
- [ ] 验证 `lastSignedIn` 时间戳更新
- [ ] 检查密码哈希格式正确

### Cookie 检查
- [ ] 打开浏览器开发者工具 (F12)
- [ ] 进入 Application > Cookies
- [ ] 验证 `app_session_id` cookie 存在
- [ ] 验证 cookie 为 HttpOnly 类型
- [ ] 验证 cookie 的 SameSite 设置

## 🔐 安全验证

### 密码安全
- [ ] 验证密码哈希包含 salt、iterations、hash
- [ ] 验证最少 100,000 迭代次数
- [ ] 验证盐长度为 64 个十六进制字符（32 字节）

### 会话安全
- [ ] 验证会话 token 是 JWT 格式
- [ ] 验证 JWT 使用 HS256 算法
- [ ] 验证令牌包含 openId、appId、name

### 网络安全
- [ ] 验证登陆请求使用 POST
- [ ] 验证密码通过 HTTPS（生产环境）
- [ ] 验证 Cookie 的 Secure 标志（HTTPS 环境）

## 📱 跨浏览器测试

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] 手机浏览器（可选）

## 🐛 常见问题排查

### 登陆失败
- [ ] 检查数据库连接
- [ ] 验证用户邮箱存在
- [ ] 确认用户启用了本地认证
- [ ] 检查密码是否正确

### 数据库错误
- [ ] 检查 DATABASE_URL 配置
- [ ] 验证 MySQL 用户权限
- [ ] 运行迁移：`pnpm drizzle-kit migrate`

### 编译错误
- [ ] 清除 node_modules：`rm -rf node_modules && pnpm install`
- [ ] 运行类型检查：`pnpm type-check`
- [ ] 检查 TypeScript 配置

## ✅ 生产部署准备

### 代码准备
- [ ] 所有代码已提交
- [ ] 代码审核完成
- [ ] 没有 TODO 或 FIXME 注释

### 配置准备
- [ ] 生产环境 `.env` 已配置
- [ ] 生产数据库已准备
- [ ] JWT_SECRET 已设置为强密钥
- [ ] DATABASE_URL 指向生产数据库

### 备份
- [ ] 生产数据库已备份
- [ ] 代码已备份/标记版本

### 监控
- [ ] 日志收集已配置
- [ ] 错误追踪已配置
- [ ] 性能监控已配置

## 📞 支持资源

- 详细文档：[LOCAL_AUTH_GUIDE.md](./LOCAL_AUTH_GUIDE.md)
- 实现总结：[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- API 参考：见 LOCAL_AUTH_GUIDE.md 中的 API 路由章节
- 故障排除：见 LOCAL_AUTH_GUIDE.md 中的故障排除章节

## 🎉 完成标记

当以上所有项目都已完成时，请标记此框：

- [ ] ✅ 部署完成

---

**开始时间**: ___________
**完成时间**: ___________
**部署人员**: ___________
**备注**: 

