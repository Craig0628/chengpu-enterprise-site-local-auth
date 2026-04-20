# Windows 本地部署指南

本文档说明如何在 Windows 系统上本地部署聚氨酯企业官网项目。

## 项目简介

**聚氨酯企业官网** 是一个现代化的企业门户系统，集前后端一体，提供：
- 🌐 企业官网展示（产品展示、新闻资讯、Banner 管理）
- 🔐 双认证方式（OAuth + 本地认证）
- 📱 响应式设计（支持桌面、平板、手机）
- 🎨 现代化 UI（Tailwind CSS + Shadcn UI 组件库）
- 📊 完整的后台管理系统
- 🗄️ 类型安全的数据库查询（Drizzle ORM）

**技术栈：**
- 前端：React 19 + TypeScript + Tailwind CSS + Vite
- 后端：Node.js + Express + tRPC + Drizzle ORM
- 数据库：MySQL 8.0+
- 认证：JWT + HttpOnly Cookies

## 前置要求

### 1. 安装必要的软件

#### Node.js 和 npm
- 下载：[Node.js 官网](https://nodejs.org/)（推荐 LTS 版本 18.x 或更高）
- 安装：双击安装程序，按默认选项完成安装
- 验证：打开 PowerShell 或 CMD，运行：
  ```bash
  node --version
  npm --version
  ```

#### Git（可选，但推荐）
- 下载：[Git 官网](https://git-scm.com/download/win)
- 安装：按默认选项完成安装
- 验证：
  ```bash
  git --version
  ```

#### MySQL 8.0 或更高版本
- 下载：[MySQL 官网](https://dev.mysql.com/downloads/mysql/)
- 安装：选择 MySQL Community Server，按向导完成安装
- **重要**：记住安装时设置的 root 用户密码
- 启动 MySQL 服务（Windows 服务管理器或 MySQL Workbench）
- 验证连接：
  ```bash
  mysql -u root -p
  ```
- 创建项目数据库：
  ```sql
  CREATE DATABASE chengpu_polyurethane CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  EXIT;
  ```

### 2. 安装 pnpm（推荐包管理器）
```bash
npm install -g pnpm
pnpm --version  # 验证安装
```

## 部署步骤

### 1. 获取项目代码

**方式一：使用 Git 克隆（推荐）**
```bash
git clone <你的项目仓库地址> chengpu-enterprise-site
cd chengpu-enterprise-site
```

**方式二：直接下载**
- 从 Manus Management UI 中下载项目 ZIP 文件
- 解压到本地目录
- 在 PowerShell 中进入项目目录：
  ```bash
  cd chengpu-enterprise-site
  ```

### 2. 安装依赖

```bash
pnpm install
```

如果遇到权限问题，可以使用管理员权限打开 PowerShell 重试。

### 3. 配置环境变量

在项目根目录创建 `.env.local` 文件，添加以下内容：

```env
# ========== 数据库配置 ==========
# 格式: mysql://[用户名]:[密码]@[主机]:[端口]/[数据库名]
# 默认 MySQL 用户: root，默认端口: 3306
DATABASE_URL=mysql://root:123456@localhost:3306/chengpu_polyurethane

# ========== 认证配置 ==========
# JWT 签名密钥（用于签署会话 token）
JWT_SECRET=chengpu_polyurethane_jwt_001

# ========== OAuth 配置（可选） ==========
# 仅在需要第三方 OAuth 登录时配置
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# ========== 系统管理员配置 ==========
OWNER_NAME=System Admin
OWNER_OPEN_ID=system_admin
```

**配置说明：**

| 变量 | 必需 | 说明 | 示例 |
|------|------|------|------|
| `DATABASE_URL` | ✅ | 数据库连接字符串 | `mysql://root:password@localhost:3306/chengpu_polyurethane` |
| `JWT_SECRET` | ✅ | JWT 签名密钥（任意字符串） | `your_secure_secret_key` |
| `VITE_APP_ID` | ❌ | OAuth 应用 ID | - |
| `OAUTH_SERVER_URL` | ❌ | OAuth 服务器地址 | - |
| `VITE_OAUTH_PORTAL_URL` | ❌ | OAuth 门户地址 | - |

**👉 重要提示：**
- 数据库密码要与你 MySQL 安装时设置的密码一致
- JWT_SECRET 建议使用复杂字符串，生产环境更要注意安全
- 本地部署可跳过 OAuth 配置，系统已内置本地认证

### 4. 初始化数据库

#### 步骤 4.1：运行数据库迁移

```bash
# 生成迁移文件（检查 schema 变更）
pnpm drizzle-kit generate

# 应用迁移到数据库
pnpm drizzle-kit migrate
```

**预期输出：**
```
[✓] migrations applied successfully!
```

**问题排除：**
- 如果报错 `DATABASE_URL is required`，检查 `.env.local` 文件是否存在
- 如果报错 `Connection refused`，检查 MySQL 是否启动

#### 步骤 4.2：填充初始数据（可选）

运行初始化脚本，填充演示数据（产品、分类、Banner、新闻等）：

```bash
node scripts/seed-enterprise-content.mjs
```

**输出示例：**
```
Seeded enterprise content successfully.
```

#### 步骤 4.3：创建管理员账户

使用交互式脚本创建本地认证管理员账户：

```bash
node scripts/setup-local-auth.mjs
```

**交互过程示例：**
```
=== 本地认证系统设置向导 ===

请输入管理员邮箱: admin@example.com
请输入管理员名称: Administrator
请输入管理员密码 (至少8个字符): ••••••••
确认密码: ••••••••

✅ 管理员账户已成功创建！
```

**下一步提示会显示在屏幕上**

### 5. 启动开发服务器

```bash
pnpm dev
```

**预期输出：**
```
Server running on http://localhost:3000/
```

**访问地址：**

| 功能 | 地址 |
|------|------|
| 🌐 **官网首页** | http://localhost:3000 |
| 🔐 **后台管理** | http://localhost:3000/admin |

### 6. 首次登陆

1. 打开浏览器，访问 http://localhost:3000/admin
2. 选择 **"本地登陆"** 标签页
3. 输入刚才创建的管理员账户：
   - 📧 邮箱：admin@example.com
   - 🔑 密码：刚才设置的密码
4. 点击 **"登陆"** 按钮
5. 登陆成功后进入后台管理面板

## 完整部署流程（快速参考）

```bash
# 1. 进入项目目录
cd chengpu-enterprise-site-local-auth

# 2. 安装依赖
pnpm install

# 3. 初始化数据库
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# 4. 填充演示数据（可选）
node scripts/seed-enterprise-content.mjs

# 5. 创建管理员账户
node scripts/setup-local-auth.mjs

# 6. 启动开发服务器
pnpm dev

# 7. 在浏览器打开
# 官网: http://localhost:3000
# 后台: http://localhost:3000/admin
```

## 常见问题

### Q1：启动时报错 "Cannot find module"
**症状：** `Cannot find module '@...' or its corresponding type declarations`

**解决方案：**
```bash
# 清除缓存并重新安装
Remove-Item -Recurse -Force node_modules
Remove-Item pnpm-lock.yaml
pnpm install
pnpm check
```

### Q2：数据库连接失败
**症状：** `Connection refused` 或 `Cannot find module 'mysql2'`

**检查清单：**
- [ ] MySQL 服务是否启动？（打开 Windows 服务管理器查看）
- [ ] 用户名和密码是否正确？（默认用户: root）
- [ ] 数据库 `chengpu_polyurethane` 是否已创建？
- [ ] `.env.local` 文件中 DATABASE_URL 是否正确？
- [ ] 防火墙是否阻止了 MySQL 3306 端口？

**快速测试连接：**
```bash
mysql -u root -p -h localhost -e "SELECT 1"
```

### Q3：端口 3000 已被占用
**症状：** `Error: listen EADDRINUSE :::3000`

**解决方案1：** 查找并关闭占用端口的进程
```powershell
# 查找占用 3000 端口的进程
netstat -ano | findstr :3000

# 根据 PID 关闭进程（假设 PID 为 12345）
taskkill /PID 12345 /F

# 重新启动
pnpm dev
```

**解决方案2：** 使用其他端口
```bash
$env:PORT=3001
pnpm dev
```

### Q4：登陆后立即跳回登陆页面
**症状：** 输入正确的邮箱和密码仍无法进入后台

**原因分析：**
- JWT_SECRET 未配置或为空
- 账户未正确创建到数据库
- Cookie 被浏览器禁用

**解决步骤：**
```bash
# 1. 检查 .env.local 中 JWT_SECRET 是否已设置
cat .env.local | findstr JWT_SECRET

# 2. 验证管理员账户是否存在
mysql -u root -p -h localhost chengpu_polyurethane -e "SELECT * FROM users;"

# 3. 重新创建管理员账户
node scripts/setup-local-auth.mjs

# 4. 清除浏览器 Cookie 并重试
# 按 F12 打开开发者工具 → Storage → Cookies → 删除 localhost 相关 Cookie
```

### Q5：pnpm 命令提示找不到
**症状：** `pnpm: 无法将"pnpm"项识别为 cmdlet、函数或可运行程序`

**解决方案：**
```bash
# 使用 npx 临时运行 pnpm
npx pnpm install

# 或重新全局安装 pnpm
npm install -g pnpm

# 重启 PowerShell 使环境变量生效
```

### Q6：图片上传失败
**症状：** 后台编辑时上传图片失败

**当前限制：** 
- 本地开发默认不配置 S3 存储
- 建议使用外部图片 URL 或 CDN 链接

**临时方案：**
1. 从其他来源获取图片 URL
2. 在编辑表单中直接粘贴图片 URL

### Q7：数据库迁移卡住或超时
**症状：** `pnpm drizzle-kit migrate` 持续运行或超时

**解决方案：**
```bash
# 1. 中断当前操作（Ctrl + C）
# 2. 检查 MySQL 连接
mysql -u root -p -h localhost

# 3. 查看迁移状态
pnpm drizzle-kit status

# 4. 如果卡住，可手动检查数据库状态
# 在 MySQL 中查看已执行的迁移
SELECT * FROM _drizzle_migrations;
```

### Q8："打开默认浏览器"提示
**症状：** 启动时不自动打开浏览器

**解决方案：** 手动在浏览器中访问：
```
http://localhost:3000
```

## 生产构建与部署

### 构建生产版本

```bash
# 编译前端和后端代码
pnpm build
```

**输出目录：**
- `dist/` - 生产版本（包含打包后的代码）

### 启动生产服务器

```bash
pnpm start
```

**生产环境检查清单：**
- [ ] `.env.local` 已配置正确的生产环境变量
- [ ] `JWT_SECRET` 使用强随机密钥
- [ ] 数据库备份已完成
- [ ] MySQL 使用强密码
- [ ] 防火墙规则已配置（仅允许必要的端口）
- [ ] 日志系统已启用
- [ ] SSL/TLS 证书已配置（如果需要 HTTPS）

## 后台管理系统功能

登陆后台后可以管理以下内容：

| 功能模块 | 说明 |
|---------|------|
| 📊 **仪表板** | 系统概览和统计信息 |
| 📰 **新闻管理** | 添加、编辑、删除新闻文章 |
| 🏭 **产品管理** | 管理产品分类、产品信息和图库 |
| 📁 **分类管理** | 创建和维护产品分类层级 |
| 🎪 **Banner 管理** | 管理首页横幅和宣传图 |
| 👥 **用户管理** | 管理本地认证用户账户 |
| 🔐 **本地认证** | 用户密码修改和认证设置 |

## 项目结构详解

```
chengpu-enterprise-site-local-auth/
├── client/                      # 前端代码（React + Vite）
│   ├── src/
│   │   ├── pages/              # 页面组件
│   │   │   ├── AdminPage.tsx   # 后台管理主页
│   │   │   ├── ComponentShowcase.tsx  # 组件展示页
│   │   │   ├── Home.tsx        # 官网首页
│   │   │   ├── SitePages.tsx   # 内容页面
│   │   │   └── NotFound.tsx    # 404 页面
│   │   ├── components/         # 可复用组件
│   │   │   ├── LoginForm.tsx   # 本地登陆表单
│   │   │   ├── DashboardLayout.tsx  # 后台布局
│   │   │   ├── SiteShell.tsx   # 官网外壳
│   │   │   └── ui/             # Shadcn UI 组件库
│   │   ├── _core/
│   │   │   └── hooks/
│   │   │       └── useAuth.ts  # 认证 hooks
│   │   ├── lib/                # 工具函数
│   │   │   ├── trpc.ts         # tRPC 客户端配置
│   │   │   └── utils.ts        # 通用工具
│   │   ├── App.tsx             # 主应用组件
│   │   └── main.tsx            # 入口文件
│   ├── public/                 # 静态资源
│   └── index.html              # HTML 模板
│
├── server/                      # 后端代码（Express + tRPC）
│   ├── _core/
│   │   ├── index.ts            # 服务器入口
│   │   ├── context.ts          # tRPC 上下文
│   │   ├── sdk.ts              # OAuth SDK（已禁用）
│   │   ├── password.ts         # 密码哈希模块
│   │   ├── cookies.ts          # Cookie 管理
│   │   ├── trpc.ts             # tRPC 配置
│   │   ├── vite.ts             # Vite 中间件
│   │   └── oauth.ts            # OAuth 路由（已移除）
│   ├── routers.ts              # tRPC 路由定义
│   ├── db.ts                   # 数据库查询函数
│   ├── storage.ts              # 文件存储模块
│   └── types/                  # TypeScript 类型定义
│
├── drizzle/                     # 数据库 ORM
│   ├── schema.ts               # 数据库架构定义
│   ├── 0000_*.sql              # 迁移文件 1
│   ├── 0001_*.sql              # 迁移文件 2
│   ├── 0002_*.sql              # 迁移文件 3
│   └── meta/
│       └── _journal.json       # 迁移执行历史
│
├── scripts/                     # 辅助脚本
│   ├── setup-local-auth.mjs    # 创建管理员账户
│   ├── seed-enterprise-content.mjs  # 填充演示数据
│   ├── init-database.ps1       # 数据库初始化（Windows）
│   └── init-database.sh        # 数据库初始化（Linux/Mac）
│
├── .env.local                   # 环境配置（本地）
├── .gitignore                   # Git 忽略文件
├── package.json                 # 项目配置
├── tsconfig.json                # TypeScript 配置
├── drizzle.config.ts            # Drizzle 配置
├── vite.config.ts               # Vite 配置
└── README.md                    # 本文档
```

## 数据库模式

### users 表
存储用户账户信息，支持 OAuth 和本地认证两种方式。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| openId | VARCHAR | 用户唯一标识（OAuth ID 或本地前缀） |
| email | VARCHAR | 邮箱地址（本地认证必需） |
| name | VARCHAR | 用户名 |
| role | ENUM | 用户角色：'user' 或 'admin' |
| passwordHash | VARCHAR | 密码哈希（本地认证） |
| isLocalAuthEnabled | BOOLEAN | 是否启用本地认证 |
| loginMethod | VARCHAR | 登陆方法：'oauth' 或 'local' |
| lastSignedIn | DATETIME | 最后登陆时间 |
| createdAt | DATETIME | 创建时间 |

### 其他表
- **categories** - 产品分类
- **products** - 产品信息
- **news** - 新闻文章
- **banners** - 首页横幅

## 进阶配置

### 修改主题色和样式

编辑 `client/src/index.css` 中的 CSS 变量：

```css
@layer base {
  :root {
    --primary: 0 118 188;        /* 主色（Sky 蓝） */
    --primary-foreground: 255 255 255;
    --secondary: 203 213 225;
    --background: 248 250 252;
    --foreground: 15 23 42;
    /* 其他颜色变量 */
  }
}
```

**常用颜色预设：**
- Sky 蓝（当前）: `0 118 188`
- 海洋蓝: `3 105 161`
- 深紫: `109 40 217`
- 翡翠绿: `5 150 105`

### 添加新的管理员账户

```bash
node scripts/setup-local-auth.mjs
```

### 批量导入产品数据

编辑 `scripts/seed-enterprise-content.mjs` 中的数据数组，然后运行：

```bash
node scripts/seed-enterprise-content.mjs
```

### 添加新页面到官网

**步骤 1：创建页面组件**
在 `client/src/pages/` 中创建新文件，如 `AboutPage.tsx`：

```typescript
export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <h1>关于我们</h1>
      {/* 页面内容 */}
    </div>
  );
}
```

**步骤 2：添加路由**
在 `client/src/App.tsx` 中：

```typescript
import AboutPage from './pages/AboutPage';

export function App() {
  return (
    <Switch>
      <Route path="/about" component={AboutPage} />
      {/* 其他路由 */}
    </Switch>
  );
}
```

**步骤 3：添加导航菜单**
在 `client/src/components/SiteShell.tsx` 中添加链接。

### 扩展数据库模式

**步骤 1：编辑 schema**
在 `drizzle/schema.ts` 中添加新表：

```typescript
export const testimonials = mysqlTable('testimonials', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }),
  content: text('content'),
  rating: int('rating').default(5),
  createdAt: datetime('createdAt').default(sql`CURRENT_TIMESTAMP`),
});
```

**步骤 2：生成和应用迁移**
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

**步骤 3：添加数据库操作函数**
在 `server/db.ts` 中添加查询函数。

**步骤 4：创建 tRPC 路由**
在 `server/routers.ts` 中添加相应的 API 端点。

### 配置 HTTPS（可选）

对于生产环境，建议使用 HTTPS。在反向代理（如 Nginx）中配置 SSL 证书。

### 设置 Redis 缓存（可选）

对于高流量场景，可以添加 Redis 缓存层来提升性能。

## API 文档

### 认证 API

#### 本地登陆
```
POST /api/trpc/auth.localLogin
```

请求体：
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

响应：
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Administrator",
    "role": "admin"
  }
}
```

#### 获取当前用户
```
GET /api/trpc/auth.me
```

响应：
```json
{
  "id": 1,
  "email": "admin@example.com",
  "name": "Administrator",
  "role": "admin",
  "isLocalAuthEnabled": true
}
```

#### 登陆
```
POST /api/trpc/auth.logout
```

响应：
```json
{ "success": true }
```

### 产品 API

所有产品相关 API 都遵循 tRPC 约定，客户端通过 `trpc.products.*` 访问。

## 性能优化建议

### 前端优化
- ✅ 已启用代码分割
- ✅ 已启用图片优化
- ✅ 使用 Tailwind CSS 进行样式优化
- 💡 考虑添加 Service Worker 实现 PWA

### 后端优化
- ✅ 已启用数据库连接池
- ✅ 已启用 tRPC 批处理
- 💡 考虑添加 Redis 缓存
- 💡 考虑启用 GZIP 压缩

## 安全建议

- ✅ 使用 PBKDF2-SHA256 + 256 位 salt 进行密码加密
- ✅ JWT token 签名验证
- ✅ HttpOnly Cookie 保护 token
- ⚠️ **生产环境必须使用 HTTPS**
- ⚠️ **定期更新依赖包**
- ⚠️ **使用强密码和复杂的 JWT_SECRET**
- ⚠️ **不要将敏感信息提交到版本控制**

## 获取帮助

### 文档资源
- 📚 [Drizzle ORM 文档](https://orm.drizzle.team)
- 📚 [tRPC 文档](https://trpc.io)
- 📚 [React 官网](https://react.dev)
- 📚 [Tailwind CSS](https://tailwindcss.com)
- 📚 [MySQL 官网](https://dev.mysql.com/doc/)

### 常见问题
查看上面的 **"常见问题"** 部分，包含详细的故障排除步骤。

### 联系支持
- 提交 GitHub Issue（如果在公开仓库）
- 联系项目维护者

## 许可证

本项目遵循 MIT 许可证。

## 版本信息

- **项目版本**: 1.0.0
- **发布日期**: 2026-04-20
- **Node.js 版本**: 18.x 或更高
- **MySQL 版本**: 8.0 或更高
- **pnpm 版本**: 10.x 或更高

## 更新日志

### v1.0.0 (2026-04-20)
- ✨ 初始版本发布
- ✨ 实现本地认证系统（PBKDF2-SHA256 密码加密）
- ✨ 完整的后台管理系统
- ✨ 产品、新闻、分类、Banner 管理功能
- ✨ 响应式官网设计
- 🔒 移除 OAuth 登陆页面选项（仅本地认证）
- 📚 完整的部署和开发文档

## 技术致谢

本项目使用以下开源技术和库：

| 技术 | 作用 |
|------|------|
| React 19 | 前端框架 |
| TypeScript | 类型安全 |
| Tailwind CSS | 样式引擎 |
| Vite | 前端构建工具 |
| Express | HTTP 服务器 |
| tRPC | 类型安全 API |
| Drizzle ORM | 数据库 ORM |
| MySQL2 | 数据库驱动 |
| shadcn/ui | UI 组件库 |
| Lucide React | 图标库 |

---

**最后更新**: 2026-04-20  
**维护者**: Chengpu Team  
**项目地址**: [chengpu-enterprise-site-local-auth](https://github.com/your-org/chengpu-enterprise-site-local-auth)
