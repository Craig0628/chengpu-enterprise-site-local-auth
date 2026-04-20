# 本地登陆验证系统完全指南

本文档说明如何使用本地网络认证系统登陆后台管理系统。该系统支持本地账户（用户名/密码）和 Manus OAuth 两种登陆方式。

## 📋 功能概述

### 登陆方式
1. **官方登陆** - 使用 Manus OAuth（推荐用于公网）
2. **本地登陆** - 使用本地账户和密码（用于内网部署）

### 本地认证特性
- 基于 PBKDF2-SHA256 的密码加密
- 安全的会话管理（JWT Cookie）
- 用户角色支持（管理员/普通用户）
- 本地用户管理界面
- 密码修改功能

## 🚀 快速开始

### 1. 数据库设置

运行迁移以添加本地认证字段：

```sql
-- 自动执行或手动运行以下 SQL
ALTER TABLE `users` ADD COLUMN `passwordHash` varchar(255) AFTER `email`;
ALTER TABLE `users` ADD COLUMN `isLocalAuthEnabled` boolean DEFAULT false AFTER `passwordHash`;
```

### 2. 创建首个本地管理员账户

#### 方式A：通过数据库直接创建（开发环境）

```sql
-- 生成密码哈希（使用 PBKDF2-SHA256）
-- 你可以使用 node 命令行运行密码生成脚本

-- 示例：创建一个密码为 "Admin@123456" 的账户
INSERT INTO users (
  openId,
  email,
  name,
  passwordHash,
  isLocalAuthEnabled,
  loginMethod,
  role,
  lastSignedIn
) VALUES (
  'local_admin@example.com_1234567890',
  'admin@example.com',
  '系统管理员',
  '需要使用 hashPassword() 函数生成',
  true,
  'local',
  'admin',
  NOW()
);
```

#### 方式B：通过 API 创建（推荐）

如果系统已有管理员，可以通过本地用户管理页面创建新账户。

### 3. 登陆流程

```
用户访问 /admin
    ↓
检查认证状态
    ↓
    ├─ 已认证 → 进入后台
    └─ 未认证 → 显示登陆页面
         ↓
    用户选择登陆方式
    ├─ 官方登陆（Manus OAuth）
    │   ├─ 重定向到 OAuth 服务
    │   └─ OAuth 回调验证
    └─ 本地登陆（Email/密码）
        ├─ 输入邮箱和密码
        ├─ 服务器验证密码
        ├─ 密码正确 → 创建会话
        └─ 密码错误 → 显示错误信息
         ↓
    创建 JWT Session Cookie
         ↓
    重定向到 /admin
         ↓
    进入后台管理系统
```

## 🔐 安全特性

### 密码加密
- **算法**: PBKDF2-SHA256
- **迭代次数**: 100,000
- **盐长度**: 32 字节（256 位）
- **密钥长度**: 64 字节（512 位）
- **格式**: `salt$iterations$hash`

### 会话管理
- **令牌类型**: JWT (HS256)
- **存储位置**: HttpOnly Cookie (`app_session_id`)
- **过期时间**: 1 年
- **SameSite**: None（跨域支持）

### 最佳实践
1. 使用强密码（至少 8 个字符）
2. 定期更新密码
3. 不要在代码中暴露 `JWT_SECRET`
4. 在生产环境使用 HTTPS

## 📱 使用本地登陆

### 登陆流程

1. **访问后台**
   ```
   http://localhost:3000/admin
   ```

2. **选择登陆方式**
   - 点击登陆页面的"本地登陆"标签
   - 或点击"使用本地账户登录"按钮

3. **输入凭证**
   - 输入邮箱地址
   - 输入密码
   - 点击"登录"

4. **登陆成功**
   - 自动重定向到管理后台
   - 显示当前用户信息

### 登出

1. 点击左侧菜单底部用户卡片
2. 点击"退出登录"按钮
3. 重定向到登陆页面

## 👥 本地用户管理

### 查看用户列表
- 进入"本地账户管理"页面
- 查看所有本地用户及其信息

### 创建新用户
1. 点击"创建新用户"按钮
2. 填写以下信息：
   - **邮箱地址**: 用户的邮箱（唯一）
   - **用户名**: 显示名称
   - **密码**: 至少 8 个字符
   - **确认密码**: 再次输入密码
   - **角色**: 选择"管理员"或"普通用户"
3. 点击"创建账户"

### 更新密码
登陆用户可以在个人设置中更新密码：
1. 进入"账户设置"页面
2. 输入旧密码和新密码
3. 点击"更新密码"

## 🔄 API 路由

### 登陆
```
POST /api/auth/localLogin
Content-Type: application/json

Request:
{
  "email": "admin@example.com",
  "password": "Admin@123456"
}

Response (成功):
{
  "success": true,
  "user": {
    "id": 1,
    "name": "管理员",
    "email": "admin@example.com",
    "role": "admin"
  }
}

Response (失败):
{
  "error": "Invalid email or password"
}
```

### 创建用户（仅管理员）
```
POST /api/auth/localRegister
Content-Type: application/json

Request:
{
  "email": "newuser@example.com",
  "name": "新用户",
  "password": "Password@123456",
  "role": "user"
}

Response (成功):
{
  "success": true,
  "user": { ... }
}
```

### 更新密码（已认证用户）
```
POST /api/auth/updatePassword
Content-Type: application/json

Request:
{
  "oldPassword": "OldPassword@123456",
  "newPassword": "NewPassword@123456"
}

Response:
{
  "success": true
}
```

### 列出本地用户（仅管理员）
```
GET /api/auth/listLocalUsers

Response:
[
  {
    "id": 1,
    "name": "管理员",
    "email": "admin@example.com",
    "role": "admin",
    "loginMethod": "local",
    "lastSignedIn": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

## 🛠️ 环境变量配置

```env
# 必须配置
DATABASE_URL=mysql://user:password@localhost:3306/dbname
JWT_SECRET=your_secure_secret_key_here

# Manus OAuth（可选，用于官方登陆）
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# 可选
OWNER_OPEN_ID=owner_id_for_default_admin
```

## 📊 测试

运行测试套件验证密码功能：

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test server/local-auth.test.ts

# 使用监视模式
pnpm test --watch
```

## 🐛 故障排除

### 问题：无法登陆（"邮箱或密码错误"）
**原因**:
- 邮箱不存在
- 密码不正确
- 用户未启用本地认证

**解决方案**:
1. 确认邮箱已在系统中注册
2. 检查密码是否正确（注意大小写）
3. 确认用户的 `isLocalAuthEnabled` 字段为 `true`

### 问题：数据库连接错误
**解决方案**:
1. 检查 `DATABASE_URL` 环境变量配置
2. 确认 MySQL 服务器运行中
3. 检查数据库凭证和权限

### 问题：会话过期
**解决方案**:
1. 重新登陆
2. 如果问题持续，清除浏览器 Cookie
3. 检查 `JWT_SECRET` 是否正确配置

### 问题：Tabs 组件导入错误
**解决方案**:
如果找不到 `Tabs` 组件，请运行：
```bash
npx shadcn-ui@latest add tabs
```

## 📚 相关文件

```
server/
  ├── _core/
  │   ├── password.ts         # 密码加密/验证函数
  │   ├── sdk.ts              # 包含本地认证方法的 SDK
  │   └── trpc.ts             # 认证程序定义
  ├── db.ts                   # 本地用户数据库操作
  └── routers.ts              # 本地认证路由

client/
  └── src/
      ├── components/
      │   ├── LoginForm.tsx      # 登陆表单 UI
      │   ├── DashboardLayout.tsx # 使用新登陆屏幕
      │   └── LocalAuthUsers.tsx  # 本地用户管理
      └── _core/hooks/
          └── useAuth.ts         # 认证 hook

drizzle/
  ├── schema.ts               # 包含新字段的表定义
  └── 0002_local_auth.sql     # 数据库迁移脚本
```

## 🔗 相关文档

- [ADMIN_LOGIN_GUIDE.md](./ADMIN_LOGIN_GUIDE.md) - OAuth 登陆配置
- [WINDOWS_DEPLOYMENT.md](./WINDOWS_DEPLOYMENT.md) - Windows 部署指南

## 📞 支持

如遇到问题，请检查以下内容：
1. 所有必需环境变量已配置
2. 数据库已运行并可访问
3. 数据库迁移已执行
4. 至少创建了一个本地用户
5. 浏览器开发者工具中的 Network/Console 查看错误信息
