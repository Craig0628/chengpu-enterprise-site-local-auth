# 聚氨酯企业官网 - 部署指南

本文档说明如何在 **Windows** 和 **Linux** 系统上部署聚氨酯企业官网项目。

**快速导航：**
- [项目简介](#项目简介)
- [前置要求](#前置要求)
- [Windows 部署](#windows-部署-详细步骤)
- [Linux 部署](#linux-部署-详细步骤)
- [常见问题](#常见问题)

---

## 项目简介

**聚氨酯企业官网** 是一个现代化的企业门户系统，提供：
- 🌐 企业官网展示（产品、新闻、Banner 管理）
- 🔐 本地认证系统（PBKDF2-SHA256 密码加密）
- 📱 响应式设计（桌面、平板、手机）
- 🎨 现代 UI（Tailwind CSS + Shadcn UI）
- 📊 完整的后台管理系统
- 🗄️ 类型安全数据库（Drizzle ORM）

**技术栈：**
- 前端：React 19 + TypeScript + Vite
- 后端：Node.js + Express + tRPC
- 数据库：MySQL 8.0+
- 认证：JWT + HttpOnly Cookies

---

## 前置要求

### 系统要求

| 项目 | 要求 |
|------|------|
| **操作系统** | Windows 10+ 或 Linux（Ubuntu 20.04+） |
| **Node.js** | 18.x LTS 或更高 |
| **MySQL** | 8.0 或更高 |
| **npm/pnpm** | 最新版本 |
| **磁盘空间** | 至少 2GB |
| **内存** | 至少 2GB |

---

# Windows 部署 - 详细步骤

## 1️⃣ 安装前置软件

### 1.1 安装 Node.js

1. 访问 [https://nodejs.org/](https://nodejs.org/) 下载 LTS 版本
2. 双击安装程序，选择 **"Add to PATH"**（重要！）
3. 完成安装，重启 PowerShell 验证：
   ```powershell
   node --version
   npm --version
   ```

### 1.2 安装 MySQL

1. 访问 [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. 下载 MySQL Community Server（推荐 8.0+）
3. 运行安装程序，按如下步骤配置：
   - **Setup Type**：选择 "Server only"
   - **Config Type**：选择 "Development Machine"
   - **MySQL Port**：保持默认 3306
   - **MySQL Root Password**：设置一个强密码（**记住它！**）
4. 选择 "Configure MySQL as a Windows Service"（自动启动）
5. 完成安装，验证：
   ```powershell
   mysql -u root -p
   # 输入刚才设置的密码
   # 显示 "mysql>" 表示成功
   QUIT;
   ```

### 1.3 创建项目数据库

```powershell
mysql -u root -p
```

输入密码后，执行：

```sql
CREATE DATABASE chengpu_polyurethane CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
QUIT;
```

### 1.4 安装 pnpm（推荐）

```powershell
npm install -g pnpm
pnpm --version
```

---

## 2️⃣ 获取项目代码

选择以下任一方式：

### 方式 A：使用 Git（推荐）

```powershell
git clone <你的项目仓库地址>
cd chengpu-enterprise-site-local-auth
```

### 方式 B：直接下载 ZIP

1. 从 Manus Management UI 或 GitHub 下载项目 ZIP
2. 解压到本地目录
3. 打开 PowerShell，进入项目目录：
   ```powershell
   cd chengpu-enterprise-site-local-auth
   ```

---

## 3️⃣ 配置环境变量

在项目根目录创建 `.env.local` 文件，复制以下内容：

```env
# 数据库连接（格式：mysql://[用户]:[密码]@[主机]:[端口]/[数据库]）
# ⚠️ 替换为你的 MySQL 密码！
DATABASE_URL=mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/chengpu_polyurethane

# JWT 密钥（任意字符串，生产环境建议使用复杂字符）
JWT_SECRET=chengpu_polyurethane_jwt_001

# 其他配置（可选）
VITE_APP_ID=chengpu-enterprise-local
```

**⚠️ 重要：** 将 `YOUR_MYSQL_PASSWORD` 替换为你安装 MySQL 时设置的密码

---

## 4️⃣ 快速部署（一条命令）

```powershell
# 进入项目目录
cd chengpu-enterprise-site-local-auth

# 执行部署脚本
pnpm install && pnpm drizzle-kit generate && pnpm drizzle-kit migrate && node scripts/seed-enterprise-content.mjs && node scripts/setup-local-auth.mjs
```

**这个命令会自动：**
1. ✅ 安装所有依赖
2. ✅ 初始化数据库
3. ✅ 填充演示数据
4. ✅ 创建管理员账户

完成后会提示你输入管理员信息。

---

## 5️⃣ 启动服务器

```powershell
pnpm dev
```

**预期输出：**
```
Server running on http://localhost:3000/
```

**访问应用：**
- 🌐 官网首页：http://localhost:3000
- 🔐 后台管理：http://localhost:3000/admin

---

## 6️⃣ 首次登录

1. 打开浏览器，访问 http://localhost:3000/admin
2. 输入刚才创建的管理员账户
3. 点击 **"登录"** 按钮
4. 成功登录后进入后台管理面板

---

# Linux 部署 - 详细步骤

## 1️⃣ 安装前置软件

### 1.1 更新系统

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 安装 Node.js

```bash
# 使用 NodeSource 仓库获取最新 LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version
```

### 1.3 安装 MySQL

```bash
# 安装 MySQL Server
sudo apt install -y mysql-server

# 运行安全配置向导
sudo mysql_secure_installation
```

**配置选项（推荐）：**
```
Enter current password for root (enter for none): [按 Enter]
Switch to unix_socket authentication? n
Change the root password? y
New password: [输入强密码]
Remove anonymous users? y
Disable remote root login? y
Remove test database? y
Reload privilege tables? y
```

### 1.4 验证 MySQL

```bash
sudo systemctl start mysql
sudo systemctl enable mysql  # 开机自启
mysql -u root -p             # 输入密码测试
QUIT;
```

### 1.5 创建项目数据库

```bash
mysql -u root -p <<EOF
CREATE DATABASE chengpu_polyurethane CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
QUIT;
EOF
```

### 1.6 安装 pnpm（推荐）

```bash
npm install -g pnpm
pnpm --version
```

---

## 2️⃣ 获取项目代码

### 方式 A：使用 Git（推荐）

```bash
git clone <你的项目仓库地址>
cd chengpu-enterprise-site-local-auth
```

### 方式 B：直接下载

```bash
# 从服务器下载 ZIP 文件（示例）
wget https://your-server.com/chengpu-enterprise-site.zip
unzip chengpu-enterprise-site.zip
cd chengpu-enterprise-site-local-auth
```

---

## 3️⃣ 配置环境变量

创建 `.env.local` 文件：

```bash
cat > .env.local <<'EOF'
# 数据库连接（替换为你的 MySQL 密码）
DATABASE_URL=mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/chengpu_polyurethane

# JWT 密钥
JWT_SECRET=chengpu_polyurethane_jwt_001

# 应用 ID
VITE_APP_ID=chengpu-enterprise-local
EOF
```

**⚠️ 重要：** 将 `YOUR_MYSQL_PASSWORD` 替换为你的 MySQL root 密码

---

## 4️⃣ 安装依赖和初始化数据库

```bash
# 进入项目目录
cd chengpu-enterprise-site-local-auth

# 安装依赖
pnpm install

# 初始化数据库
pnpm db:push

# 初始化企业信息表（地址、电话、邮箱等）
pnpm init:company

# 初始化演示数据（产品、新闻、轮播图）
pnpm init:seed
```

---

## 5️⃣ 创建管理员账户

```bash
# 交互式创建本地管理员账户
node scripts/setup-local-auth.mjs
```

完成后会提示你输入管理员信息。

**快速初始化所有内容（一条命令）：**
```bash
pnpm install && pnpm init:all && node scripts/setup-local-auth.mjs
```

---

## 6️⃣ 启动服务器

**开发模式：**
```bash
pnpm dev
```

**生产模式：**
```bash
# 构建
pnpm build

# 启动
pnpm start
```

---

## 7️⃣ 配置反向代理（可选）

如需通过 Nginx 反向代理访问，编辑 `/etc/nginx/sites-available/default`：

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

启用配置：
```bash
sudo systemctl restart nginx
```

---

## 8️⃣ 配置开机自启（使用 PM2）

```bash
# 安装 PM2
npm install -g pm2

# 在项目目录创建启动脚本
pm2 start "pnpm start" --name "chengpu-app"

# 设置开机自启
pm2 startup
pm2 save
```

---

# 常见问题

## Q1：MySQL 密码忘记

**Windows：**
```powershell
# 停止 MySQL 服务
net stop MySQL80

# 无密码启动
mysqld --skip-grant-tables

# 在新的 PowerShell 窗口中
mysql -u root
```

**Linux：**
```bash
# 停止 MySQL
sudo systemctl stop mysql

# 无密码启动
sudo mysqld_safe --skip-grant-tables &

# 重置密码
mysql -u root
```

执行以下 SQL：
```sql
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
QUIT;
```

## Q2：数据库连接失败

**检查清单：**
- ✅ MySQL 服务是否运行？
  - Windows：检查 Windows 服务
  - Linux：`sudo systemctl status mysql`
- ✅ DATABASE_URL 配置正确？
- ✅ .env.local 文件存在？
- ✅ 防火墙是否开放 3306 端口？

**快速测试：**
```bash
mysql -u root -p -h localhost -e "SELECT 1;"
```

## Q3：端口 3000 被占用

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

**或使用其他端口：**
```bash
PORT=3001 pnpm dev
```

## Q4：pnpm 命令找不到

```bash
# 使用 npx 临时执行
npx pnpm install

# 或全局重新安装
npm install -g pnpm
```

## Q5：登录后立即跳回登录页

**原因可能：**
- JWT_SECRET 未设置或为空
- 账户未正确创建

**解决方案：**
```bash
# 检查 .env.local
cat .env.local | grep JWT_SECRET

# 重新创建管理员账户
node scripts/setup-local-auth.mjs

# 清除浏览器 Cookie 重试
# F12 → Storage → Cookies → 删除 localhost 项
```

## Q6：收到 "Cannot find module" 错误

```bash
# 清除缓存重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Q7：如何远程访问应用？

**通过公网 IP：**

在 Linux 服务器上配置防火墙和 Nginx 反向代理，参考 [第 6️⃣ 步](#6️⃣-配置反向代理可选)。

**通过内网 IP：**

访问 `http://服务器内网IP:3000`（确保防火墙允许）

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

- [ ] `.env.local` 配置正确的生产环境变量
- [ ] `JWT_SECRET` 使用强随机密钥
- [ ] 数据库备份已完成
- [ ] MySQL root 密码已更改（不是默认值）
- [ ] 防火墙配置正确
- [ ] 启用 HTTPS/SSL（推荐）
- [ ] 配置日志系统
- [ ] 使用 PM2 等进程管理器
- [ ] 启用开机自启

---

# 获取帮助

## 查看日志

**开发模式：** 控制台直接输出

**生产模式：**
```bash
# Linux
tail -f /var/log/chengpu-app.log

# PM2 日志
pm2 logs chengpu-app
```

## 常用文档

- 📚 [Drizzle ORM](https://orm.drizzle.team)
- 📚 [tRPC](https://trpc.io)
- 📚 [React](https://react.dev)
- 📚 [Tailwind CSS](https://tailwindcss.com)
- 📚 [MySQL](https://dev.mysql.com/doc/)

---

## 版本信息

- **项目版本**: 1.0.0
- **发布日期**: 2026-04-21
- **Node.js**: 18.x LTS+
- **MySQL**: 8.0+
- **pnpm**: 10.x+

## 许可证

MIT License

---

**最后更新**: 2026-04-21  
**维护者**: Chengpu Team
