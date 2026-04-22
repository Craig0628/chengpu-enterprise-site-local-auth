# Windows 本地部署指南

本文档说明如何在 Windows 系统上本地部署聚氨酯企业官网项目。

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
- 启动 MySQL 服务（Windows 服务管理器或 MySQL Workbench）
- 创建数据库：
  ```sql
  CREATE DATABASE chengpu_polyurethane CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

### 2. 安装 pnpm（推荐包管理器）
```bash
npm install -g pnpm
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

在项目根目录创建 `.env.local` 文件（Windows 下可用记事本创建），添加以下内容：

```env
# 数据库连接
DATABASE_URL=mysql://root:your_password@localhost:3306/chengpu_polyurethane

# OAuth 配置（如果需要登录功能）
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# JWT 密钥
JWT_SECRET=your_jwt_secret_key_here

# 其他配置
OWNER_NAME=Admin
OWNER_OPEN_ID=admin_open_id
```

**说明：**
- `DATABASE_URL`：根据你的 MySQL 用户名、密码、主机和数据库名修改
- 如果不需要 OAuth 登录，可以跳过 OAuth 相关配置
- `JWT_SECRET` 可以是任意长字符串

### 4. 初始化数据库

运行数据库迁移脚本：
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 5. 初始化企业信息表

运行企业设置初始化脚本（创建企业信息表并设置默认值）：
```bash
pnpm init:company
```

**说明：** 此脚本将创建 `company_settings` 表并初始化以下信息：
- 企业名称：绍兴市顺丰聚氨酯有限公司
- 企业地址：浙江省绍兴市越城区孙端街道许家桥村7幢1楼
- 企业电话：13567550208
- 企业邮箱：sxsfjaz@126.com

这些信息可以通过管理后台随时修改。

### 6. 初始化演示数据（可选）

运行初始化脚本填充演示产品、新闻、轮播图等数据：
```bash
pnpm init:seed
```

**快速初始化所有内容：**
```bash
pnpm init:all
```
此命令依次执行数据库迁移、企业设置初始化和演示数据初始化。

### 7. 启动开发服务器

初始化完成后，启动开发服务器：
```bash
pnpm dev
```

启动后，打开浏览器访问 `http://localhost:3000` 查看官网。

## 常见问题

### Q1: 启动时报错 "Cannot find module"
**解决方案：**
```bash
# 清除缓存并重新安装
rm -r node_modules pnpm-lock.yaml
pnpm install
```

### Q2: 数据库连接失败
**检查清单：**
- MySQL 服务是否已启动？（Windows 服务管理器中查看）
- 用户名和密码是否正确？
- 数据库是否已创建？
- 防火墙是否阻止了 3306 端口？

### Q3: 端口 3000 已被占用
**解决方案：**
在 `server/_core/index.ts` 中修改端口号，或者使用命令：
```bash
$port = 3001
$env:PORT=$port
pnpm dev
```

### Q4: 图片上传失败
如果使用本地开发，图片上传功能需要配置 S3 或本地存储。临时方案是在后台编辑内容时直接粘贴图片 URL。

## 生产构建

当准备上线时，运行：

```bash
pnpm build
```

生成的文件位于 `dist/` 目录。

启动生产服务器：
```bash
pnpm start
```

## 后台管理系统访问

1. 启动开发服务器后，访问 `http://localhost:3000/admin`
2. 如果需要登录，使用配置的 OAuth 或本地用户账户
3. 在后台可以管理新闻、产品、分类、Banner 等内容

## 项目结构

```
chengpu-enterprise-site/
├── client/              # 前端代码（React + Tailwind）
│   ├── src/
│   │   ├── pages/      # 页面组件
│   │   ├── components/ # 可复用组件
│   │   └── lib/        # 工具函数
│   └── public/         # 静态文件
├── server/             # 后端代码（Express + tRPC）
│   ├── routers.ts      # API 路由定义
│   └── db.ts           # 数据库查询
├── drizzle/            # 数据库 schema 和迁移
├── scripts/            # 辅助脚本
└── package.json        # 项目配置
```

## 进阶配置

### 修改主题色
编辑 `client/src/index.css` 中的 CSS 变量，修改 `--primary`、`--chart-*` 等颜色值。

### 添加新页面
1. 在 `client/src/pages/` 中创建新组件
2. 在 `client/src/App.tsx` 中添加路由
3. 在 `client/src/components/SiteShell.tsx` 中添加导航菜单项

### 扩展后台功能
1. 在 `drizzle/schema.ts` 中定义新表
2. 在 `server/db.ts` 中添加查询方法
3. 在 `server/routers.ts` 中添加 tRPC 过程
4. 在 `client/src/pages/AdminPage.tsx` 中添加 UI

## 获取帮助

- 项目文档：查看项目根目录的 `README.md`
- 技术栈文档：
  - [React 官网](https://react.dev)
  - [Tailwind CSS](https://tailwindcss.com)
  - [tRPC](https://trpc.io)
  - [Drizzle ORM](https://orm.drizzle.team)

## 许可证

本项目遵循 MIT 许可证。
