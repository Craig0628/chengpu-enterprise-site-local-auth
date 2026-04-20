# 🚀 数据库迁移快速参考

## ✅ 当前状态
- ✅ 所有迁移已执行成功
- ✅ 5个表已创建 (users, categories, products, news, banners)
- ✅ 本地认证字段已添加 (passwordHash, isLocalAuthEnabled)

## 📋 常用命令

### Windows PowerShell

```powershell
# 设置数据库连接字符串
$env:DATABASE_URL = "mysql://root:123456@localhost:3306/chengpu_polyurethane"

# 生成迁移文件
pnpm drizzle-kit generate

# 应用迁移
pnpm drizzle-kit migrate

# 查看迁移状态
pnpm drizzle-kit status
```

### macOS / Linux

```bash
# 设置数据库连接字符串
export DATABASE_URL="mysql://root:123456@localhost:3306/chengpu_polyurethane"

# 生成迁移文件
pnpm drizzle-kit generate

# 应用迁移
pnpm drizzle-kit migrate

# 查看迁移状态
pnpm drizzle-kit status
```

## 🎯 完整初始化流程

### 1. 配置数据库连接
编辑 `.env.local`:
```env
DATABASE_URL=mysql://root:123456@localhost:3306/chengpu_polyurethane
JWT_SECRET=chengpu_polyurethane_jwt_001
```

### 2. 运行初始化脚本

**Windows:**
```powershell
.\scripts\init-database.ps1 -DbHost localhost -DbUser root -DbPassword 123456
```

**macOS/Linux:**
```bash
bash scripts/init-database.sh
```

### 3. 创建管理员账户
```bash
node scripts/setup-local-auth.mjs
```

### 4. 启动开发服务
```bash
pnpm dev
```

### 5. 访问后台
```
http://localhost:3000/admin
```

## 🔧 故障排除

### "DATABASE_URL is required"
```powershell
# 确保设置了环境变量
$env:DATABASE_URL = "mysql://root:123456@localhost:3306/chengpu_polyurethane"
```

### "Connection refused"
- 检查 MySQL 是否运行
- 检查主机、端口、用户名、密码是否正确

### "Unknown database"
- 创建数据库: `CREATE DATABASE chengpu_polyurethane;`

### "Access denied"
- 验证 MySQL 凭证是否正确

## 📊 数据库连接信息

```
主机: localhost
端口: 3306
用户: root
密码: 123456
数据库: chengpu_polyurethane
```

## ✨ 数据库表结构

| 表名 | 列数 | 用途 |
|------|------|------|
| users | 11 | 用户账户（包含本地认证字段） |
| categories | 11 | 产品分类 |
| products | 14 | 产品信息 |
| news | 11 | 新闻文章 |
| banners | 10 | 横幅广告 |

## 📁 迁移文件

```
drizzle/
├── 0000_moaning_bucky.sql          # 创建 users 表
├── 0001_wakeful_whistler.sql       # 创建其他表
├── 0002_sticky_grandmaster.sql     # 添加本地认证字段
└── meta/
    └── _journal.json               # 迁移历史记录
```

## 🔐 本地认证字段

```sql
ALTER TABLE users ADD COLUMN passwordHash varchar(255);
ALTER TABLE users ADD COLUMN isLocalAuthEnabled boolean DEFAULT false;
```

这两个字段用于存储用户密码哈希值和标识用户是否启用了本地认证。

## 💡 提示

- 使用 `pnpm db:push` 快速执行 generate + migrate（需要在 package.json 中配置）
- 每次修改 schema.ts 后运行 `pnpm drizzle-kit generate`
- 迁移历史保存在 `drizzle/meta/_journal.json` 中
- 不要手动修改已执行的迁移文件

## 📞 需要帮助？

查看详细文档:
- [DATABASE_MIGRATION_FIX.md](./DATABASE_MIGRATION_FIX.md) - 完整解决方案
- [LOCAL_AUTH_GUIDE.md](./LOCAL_AUTH_GUIDE.md) - 本地认证指南
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - 部署清单
