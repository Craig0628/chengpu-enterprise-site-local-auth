# 后台登录配置指南

本文档说明如何配置 `/admin` 后台管理系统的登录功能。

## 登录方式说明

项目支持两种登录方式：

### 方式一：Manus OAuth 登录（推荐用于生产环境）

这是官方推荐的登录方式，通过 Manus 平台的统一身份验证系统。

#### 配置步骤

1. **获取 OAuth 应用凭证**
   - 登录 [Manus 平台](https://manus.im)
   - 进入应用管理，创建或查看你的应用
   - 记录 `App ID`

2. **配置环境变量**
   
   在项目根目录的 `.env.local` 文件中添加：

   ```env
   # Manus OAuth 配置
   VITE_APP_ID=your_app_id_here
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
   JWT_SECRET=your_jwt_secret_key_here
   ```

   **参数说明：**
   - `VITE_APP_ID`：从 Manus 应用管理获取
   - `OAUTH_SERVER_URL`：Manus OAuth 服务器地址（固定）
   - `VITE_OAUTH_PORTAL_URL`：Manus 登录门户地址（固定）
   - `JWT_SECRET`：用于签署会话令牌的密钥，可以是任意长字符串

3. **启动应用**
   ```bash
   pnpm dev
   ```

4. **访问后台**
   - 打开 `http://localhost:3000/admin`
   - 点击"立即登录"按钮
   - 使用 Manus 账户登录
   - 登录成功后自动进入后台管理系统

#### 登录流程图

```
用户访问 /admin
    ↓
检查会话 Cookie (app_session_id)
    ↓
    ├─ 有效 → 进入后台
    └─ 无效/不存在 → 显示登录页面
         ↓
    用户点击"立即登录"
         ↓
    重定向到 Manus OAuth 登录页面
         ↓
    用户输入账号密码登录
         ↓
    Manus 返回授权码
         ↓
    应用交换授权码获取用户信息
         ↓
    创建会话 Cookie
         ↓
    重定向回 /admin
         ↓
    进入后台管理系统
```

### 方式二：本地开发模式（仅用于本地测试）

如果你想在本地开发时跳过 OAuth 登录，可以使用本地测试用户。

#### 配置步骤

1. **直接访问数据库插入测试用户**

   连接到你的 MySQL 数据库，执行以下 SQL：

   ```sql
   INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn)
   VALUES ('test-user-001', 'Admin User', 'admin@example.com', 'local', 'admin', NOW(), NOW(), NOW());
   ```

2. **修改后台登录验证（仅用于开发）**

   编辑 `client/src/components/DashboardLayout.tsx`，在第 46 行附近修改登录检查逻辑：

   ```tsx
   // 原代码
   if (!user) {
     return (
       <div className="flex min-h-screen items-center justify-center ...">
         {/* 显示登录页面 */}
       </div>
     );
   }

   // 改为（仅用于本地测试）
   // 注释掉上面的检查，允许直接进入
   // if (!user) { ... }
   ```

   **警告：** 这种方式仅用于本地开发测试，生产环境必须启用 OAuth 登录！

## 常见问题

### Q1: 登录后显示"无权限"错误

**原因：** 你的用户账户不是管理员角色。

**解决方案：**
1. 连接到数据库
2. 查询你的用户记录：
   ```sql
   SELECT id, name, role FROM users WHERE email = 'your_email@example.com';
   ```
3. 更新角色为 admin：
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';
   ```
4. 刷新浏览器重新登录

### Q2: 点击登录后无反应

**检查清单：**
- `VITE_APP_ID` 是否正确填写？
- `OAUTH_SERVER_URL` 和 `VITE_OAUTH_PORTAL_URL` 是否正确？
- 网络是否能访问 `https://api.manus.im`？
- 浏览器控制台是否有错误信息？

**解决方案：**
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签中的错误信息
3. 检查 Network 标签中的请求是否成功

### Q3: 登录成功但无法进入后台

**原因：** 会话 Cookie 未正确设置。

**解决方案：**
1. 清除浏览器 Cookie：
   - 打开开发者工具 → Application → Cookies
   - 删除 `app_session_id` Cookie
   - 刷新页面重新登录

2. 检查 `JWT_SECRET` 是否正确配置

### Q4: 本地开发时如何快速测试后台功能？

**推荐方案：**

在 `server/_core/context.ts` 中临时添加测试用户（仅用于本地开发）：

```typescript
// 在 authenticateRequest 之前添加
if (process.env.NODE_ENV === 'development') {
  const testUser = {
    id: 1,
    openId: 'test-user-dev',
    name: 'Test Admin',
    email: 'test@local.dev',
    role: 'admin' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  
  // 如果没有真实用户，使用测试用户
  if (!user) {
    user = testUser;
  }
}
```

**警告：** 修改后必须在生产前删除此代码！

## 后台权限说明

登录后，你的权限取决于用户角色：

| 角色 | 权限 | 访问范围 |
|------|------|--------|
| admin | 完全权限 | 所有管理功能：新闻、产品、Banner、分类、用户管理 |
| user | 受限权限 | 仅查看仪表盘，无编辑权限 |

### 如何提升用户为管理员

```sql
-- 查看所有用户
SELECT id, name, email, role FROM users;

-- 提升特定用户为管理员
UPDATE users SET role = 'admin' WHERE id = 2;

-- 降级管理员为普通用户
UPDATE users SET role = 'user' WHERE id = 3;
```

## 后台功能概览

登录后，你可以访问以下功能：

### 1. 仪表盘
- 查看系统概览
- 显示内容统计（新闻数、产品数等）

### 2. 新闻管理
- 创建、编辑、删除新闻
- 支持富文本编辑
- 发布/草稿状态管理

### 3. 产品管理
- 创建、编辑、删除产品
- 上传产品图片到 S3
- 管理产品参数和规格

### 4. Banner 管理
- 创建、编辑、删除轮播 Banner
- 设置 Banner 图片和链接
- 启用/禁用 Banner 显示

### 5. 分类管理
- 创建、编辑、删除产品分类
- 为产品分配分类

### 6. 管理员管理
- 查看所有用户列表
- 提升/降级用户角色
- 管理系统访问权限

## 生产环境部署

在生产环境中部署时，确保：

1. **环境变量已正确设置**
   ```bash
   # 在服务器上设置环境变量
   export VITE_APP_ID=your_production_app_id
   export OAUTH_SERVER_URL=https://api.manus.im
   export VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
   export JWT_SECRET=your_strong_secret_key
   export DATABASE_URL=mysql://user:password@host:3306/db
   ```

2. **HTTPS 已启用**
   - OAuth 登录要求 HTTPS
   - 会话 Cookie 的 `secure` 标志依赖 HTTPS

3. **数据库已迁移**
   ```bash
   pnpm drizzle-kit migrate
   ```

4. **至少有一个管理员用户**
   ```sql
   UPDATE users SET role = 'admin' WHERE openId = 'your_open_id';
   ```

## 获取帮助

- 遇到 OAuth 问题？查看 [Manus 文档](https://docs.manus.im)
- 数据库问题？查看 [Drizzle 文档](https://orm.drizzle.team)
- 前端问题？查看 [React 文档](https://react.dev)
