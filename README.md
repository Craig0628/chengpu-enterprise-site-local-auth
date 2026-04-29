# 聚氨酯企业官网 - 部署指南

本文档说明如何在 **Windows** 和 **Linux** 系统上完整部署本项目，并给出详细的操作步骤。

**快速导航：**
- [项目简介](#项目简介)
- [前置要求](#前置要求)
- [Windows 部署](#windows-部署)
- [Linux 部署](#linux-部署)
- [常见问题](#常见问题)
- [生产部署](#生产部署)
- [获取帮助](#获取帮助)

---

## 项目简介

**聚氨酯企业官网** 是一个现代化的企业门户系统，集前后端一体，支持后台管理与本地认证。

主要功能：
- 🌐 企业官网展示（产品、新闻、Banner 管理）
- 🔐 本地认证系统（PBKDF2-SHA256 密码加密）
- 📱 响应式设计（桌面、平板、手机）
- 🎨 现代 UI（Tailwind CSS + shadcn/ui）
- 📊 后台管理系统（产品、新闻、分类、用户等）
- 🗄️ 类型安全数据库（Drizzle ORM + MySQL）

技术栈：
- 前端：React 19 + TypeScript + Vite
- 后端：Node.js + Express + tRPC
- 数据库：MySQL 8.0+
- 认证：JWT + HttpOnly Cookies

---

## 前置要求

### 系统要求

| 项目 | 要求 |
|------|------|
| **操作系统** | Windows 10+ 或 Linux（Ubuntu 20.04+ / Debian / CentOS） |
| **Node.js** | 18.x LTS 或更高 |
| **MySQL** | 8.0 或更高 |
| **pnpm** | 推荐 pnpm 10.x |
| **磁盘空间** | 至少 2GB |
| **内存** | 至少 2GB |

### 软件要求

- Node.js
- MySQL 8.x
- Git（推荐）
- pnpm
- 可选：Nginx、PM2

---

# Windows 部署

以下步骤在 Windows 环境中完成项目部署。

## 1️⃣ 安装前置软件

### 1.1 安装 Node.js

1. 访问 [https://nodejs.org/](https://nodejs.org/) 下载 LTS 版本。
2. 双击安装程序，勾选 **Add to PATH**。
3. 安装完成后，打开 PowerShell / CMD，验证：
   ```powershell
   node --version
   npm --version
   ```

### 1.2 安装 MySQL

1. 访问 [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)。
2. 下载 MySQL Community Server（推荐 8.0+）。
3. 按向导安装：
   - **Setup Type**：选择 "Server only" 或 "Developer Default"
   - **Config Type**：选择 "Development Machine"
   - **MySQL Port**：默认 3306
   - 设置 root 密码
4. 勾选 "Configure MySQL as a Windows Service"，建议设置为自动启动。
5. 安装完成后，验证：
   ```powershell
   mysql -u root -p
   # 输入密码后
   QUIT;
   ```

### 1.3 安装 pnpm

```powershell
npm install -g pnpm
pnpm --version
```

### 1.4 安装 Git（可选，但推荐）

```powershell
git --version
```

---

## 2️⃣ 获取项目代码

### 方式 A：Git 克隆（推荐）

```powershell
git clone <你的项目仓库地址> chengpu-enterprise-site-local-auth
cd chengpu-enterprise-site-local-auth
```

### 方式 B：下载 ZIP

1. 从 GitHub 或其他来源下载压缩包。
2. 解压到本地目录。
3. 打开 PowerShell，进入项目目录：
   ```powershell
   cd chengpu-enterprise-site-local-auth
   ```

---

## 3️⃣ 配置环境变量

在项目根目录创建 `.env.local` 文件，内容如下：

```env
DATABASE_URL=mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/chengpu_polyurethane
JWT_SECRET=chengpu_polyurethane_jwt_001
VITE_APP_ID=chengpu-enterprise-local
```

**说明：**
- `DATABASE_URL`：请替换为真实数据库密码。
- `JWT_SECRET`：生产环境请使用强随机字符串。
- `VITE_APP_ID`：当前项目本地部署可保留默认值。

---

## 4️⃣ 安装依赖与初始化数据库

### 4.1 安装依赖

```powershell
pnpm install
```

### 4.2 初始化数据库与迁移

本项目提供以下脚本：

```powershell
pnpm db:push
```

该命令会执行：
- `drizzle-kit generate`
- `drizzle-kit migrate`

如果需要手动执行也可分步运行：

```powershell
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 4.3 填充示例数据（可选）

```powershell
pnpm init:seed
```

### 4.4 初始化企业信息（可选）

```powershell
pnpm init:company
```

### 4.5 一次性初始化全部内容

```powershell
pnpm init:all
```

---

## 5️⃣ 创建管理员账户

运行本地认证管理员创建脚本：

```powershell
node scripts/setup-local-auth.mjs
```

按提示输入：
- 管理员邮箱
- 管理员名称
- 管理员密码
- 确认密码

创建成功后即可使用管理员账号登录后台。

---

## 6️⃣ 启动项目

### 开发模式

```powershell
pnpm dev
```

### 生产模式

```powershell
pnpm build
pnpm start
```

---

## 7️⃣ 访问地址

- 官网首页：`http://localhost:3000`
- 后台管理：`http://localhost:3000/admin`

---

## 8️⃣ 首次登录

1. 打开浏览器访问 `http://localhost:3000/admin`
2. 选择本地登录方式
3. 输入管理员账号和密码
4. 登录成功后进入后台管理界面

---

## 9️⃣ 可选：生产部署与进程守护

### 使用 PM2

```powershell
npm install -g pm2
pm2 start "pnpm start" --name "chengpu-app"
pm2 startup
pm2 save
```

### 端口冲突处理

如果 3000 被占用，查找并结束进程：

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

# Linux 部署

以下步骤适用于 Ubuntu / Debian 等 Linux 环境。

## 1️⃣ 安装前置软件

### 1.1 更新系统

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 安装 Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### 1.3 安装 MySQL

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

推荐配置：
- 选择 `n` 关闭 unix_socket 认证
- 选择 `y` 设置 root 密码
- 删除匿名用户
- 禁止远程 root 登录
- 删除测试数据库
- 重新加载权限表

### 1.4 启动并检查 MySQL

```bash
sudo systemctl start mysql
sudo systemctl enable mysql
mysql -u root -p
QUIT;
```

### 1.5 安装 pnpm

```bash
sudo npm install -g pnpm
pnpm --version
```

---

## 2️⃣ 获取项目代码

### 方式 A：使用 Git

```bash
git clone <你的项目仓库地址> chengpu-enterprise-site-local-auth
cd chengpu-enterprise-site-local-auth
```

### 方式 B：下载 ZIP

```bash
wget <仓库 ZIP URL>
unzip chengpu-enterprise-site-local-auth.zip
cd chengpu-enterprise-site-local-auth
```

---

## 3️⃣ 配置环境变量

创建 `.env.local`：

```bash
cat > .env.local <<'EOF'
DATABASE_URL=mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/chengpu_polyurethane
JWT_SECRET=chengpu_polyurethane_jwt_001
VITE_APP_ID=chengpu-enterprise-local
EOF
```

请替换 `YOUR_MYSQL_PASSWORD` 为实际密码。

---

## 4️⃣ 安装依赖与初始化数据库

```bash
pnpm install
pnpm db:push
pnpm init:seed
pnpm init:company
```

如果你希望一步完成：

```bash
pnpm init:all
```

---

## 5️⃣ 创建管理员账户

```bash
node scripts/setup-local-auth.mjs
```

---

## 6️⃣ 启动项目

开发模式：

```bash
pnpm dev
```

生产模式：

```bash
pnpm build
pnpm start
```

---

## 7️⃣ 可选：配置 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

重启 Nginx：

```bash
sudo systemctl restart nginx
```

---

## 8️⃣ 可选：使用 PM2 管理进程

```bash
sudo npm install -g pm2
pm2 start "pnpm start" --name "chengpu-app"
pm2 startup
pm2 save
```

---

# 常见问题

## Q1：MySQL 密码忘记

**Windows：**

```powershell
net stop MySQL80
mysqld --skip-grant-tables
mysql -u root
```

**Linux：**

```bash
sudo systemctl stop mysql
sudo mysqld_safe --skip-grant-tables &
mysql -u root
```

执行：

```sql
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
QUIT;
```

## Q2：数据库连接失败

检查：
- MySQL 是否已启动
- `DATABASE_URL` 是否正确
- `.env.local` 是否存在
- 防火墙是否开放 3306 端口

快速测试：

```bash
mysql -u root -p -h localhost -e "SELECT 1;"
```

## Q3：端口 3000 已被占用

**Windows：**

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux：**

```bash
lsof -i :3000
kill -9 <PID>
```

或者使用其他端口：

```bash
PORT=3001 pnpm dev
```

## Q4：pnpm 命令不可用

```bash
npx pnpm install
npm install -g pnpm
```

## Q5：登录后跳回登录页

原因可能：
- `JWT_SECRET` 未配置
- 管理员账户未创建或数据异常
- 浏览器 Cookie 被禁用

检查：

```bash
cat .env.local | findstr JWT_SECRET
mysql -u root -p -h localhost chengpu_polyurethane -e "SELECT * FROM users;"
```

重新创建管理员：

```bash
node scripts/setup-local-auth.mjs
```

## Q6：收到 "Cannot find module" 错误

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

# 生产部署

## 构建生产版本

```bash
pnpm build
```

## 启动生产服务器

```bash
pnpm start
```

## 生产环境检查清单

- [ ] `.env.local` 已配置正确
- [ ] `JWT_SECRET` 使用复杂随机值
- [ ] MySQL 已备份
- [ ] 防火墙规则正确
- [ ] HTTPS/SSL 已启用（推荐）
- [ ] 使用 PM2 或其他进程管理器
- [ ] 日志机制已配置

---

# 获取帮助

## 查看日志

**开发模式：** 直接查看控制台输出。

**生产模式：**

```bash
# Linux
pm2 logs chengpu-app
```

## 参考文档

- [Drizzle ORM](https://orm.drizzle.team)
- [tRPC](https://trpc.io)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [MySQL](https://dev.mysql.com/doc/)

---

**最后更新**: 2026-04-29
**维护者**: Chengpu Team
