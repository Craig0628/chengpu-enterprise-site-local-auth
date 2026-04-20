# 数据库迁移问题解决方案

## ✅ 问题已解决

您的数据库迁移已经**成功执行**！根据迁移历史记录，以下3个迁移已完成：

| 迁移序号 | 文件名 | 状态 | 内容 |
|---------|-------|------|------|
| 0 | `0000_moaning_bucky.sql` | ✅ 完成 | 创建 users 表 |
| 1 | `0001_wakeful_whistler.sql` | ✅ 完成 | 创建 categories, products, news, banners 表 |
| 2 | `0002_sticky_grandmaster.sql` | ✅ 完成 | 添加 passwordHash 和 isLocalAuthEnabled 字段 |

## 📋 诊断结果

### 原始问题
```
❌ pnpm drizzle-kit generate 和 pnpm drizzle-kit migrate 未能正确初始化数据库
```

### 问题原因

1. **缺少环境变量** - 默认没有 `.env.local` 文件中的 DATABASE_URL
2. **迁移文件冲突** - 手动创建的 `0002_local_auth.sql` 与自动生成的 `0002_sticky_grandmaster.sql` 冲突
3. **迁移命令执行需要显式设置 DATABASE_URL**

### 解决步骤（已完成）

✅ **步骤 1**: 确认 `.env.local` 文件已配置
```bash
DATABASE_URL=mysql://root:123456@localhost:3306/chengpu_polyurethane
JWT_SECRET=chengpu_polyurethane_jwt_001
```

✅ **步骤 2**: 删除重复的迁移文件
```bash
rm drizzle/0002_local_auth.sql
```
只保留自动生成的迁移文件：
- ✅ `0000_moaning_bucky.sql`
- ✅ `0001_wakeful_whistler.sql`
- ✅ `0002_sticky_grandmaster.sql`

✅ **步骤 3**: 执行迁移（显式设置环境变量）
```bash
$env:DATABASE_URL="mysql://root:123456@localhost:3306/chengpu_polyurethane"
pnpm drizzle-kit migrate
# Output: [✓] migrations applied successfully!
```

## ✨ 验证数据库状态

### 数据库表已创建
- ✅ `users` (11 列)
- ✅ `categories` (11 列)
- ✅ `products` (14 列)
- ✅ `news` (11 列)
- ✅ `banners` (10 列)

### 本地认证字段已添加
- ✅ `passwordHash` varchar(255)
- ✅ `isLocalAuthEnabled` boolean DEFAULT false

### 迁移历史已记录
所有3个迁移已在 `drizzle/meta/_journal.json` 中记录

## 🚀 后续步骤

### 1. 创建第一个管理员账户
```bash
node scripts/setup-local-auth.mjs
```

### 2. 启动开发服务器
```bash
pnpm dev
```

### 3. 访问后台
```
http://localhost:3000/admin
```

### 4. 测试本地登陆
- 点击"本地登录"标签
- 输入邮箱和密码
- 点击"登录"

## 📖 常用迁移命令

### 生成迁移文件（基于 schema 变化）
```bash
$env:DATABASE_URL="mysql://root:123456@localhost:3306/chengpu_polyurethane"
pnpm drizzle-kit generate
```

### 应用所有待执行的迁移
```bash
$env:DATABASE_URL="mysql://root:123456@localhost:3306/chengpu_polyurethane"
pnpm drizzle-kit migrate
```

### 查看迁移状态
```bash
$env:DATABASE_URL="mysql://root:123456@localhost:3306/chengpu_polyurethane"
pnpm drizzle-kit status
```

## 🔒 为生产环境优化

### 在 PowerShell 中永久设置环境变量
编辑 PowerShell 配置文件 (`$PROFILE`):
```powershell
$env:DATABASE_URL = "mysql://user:password@host:3306/dbname"
```

### 或使用 package.json 脚本
```json
{
  "scripts": {
    "db:generate": "cross-env DATABASE_URL=mysql://root:123456@localhost:3306/chengpu_polyurethane drizzle-kit generate",
    "db:migrate": "cross-env DATABASE_URL=mysql://root:123456@localhost:3306/chengpu_polyurethane drizzle-kit migrate",
    "db:push": "cross-env DATABASE_URL=mysql://root:123456@localhost:3306/chengpu_polyurethane pnpm run db:generate && pnpm run db:migrate"
  }
}
```

## 🐛 故障排除

### 问题: "DATABASE_URL is required"
**原因**: 未设置环境变量
**解决**: 在命令前设置 `$env:DATABASE_URL`

### 问题: "Connection refused"
**原因**: MySQL 服务未运行或地址/端口错误
**解决**: 
```bash
# 检查 MySQL 是否运行
mysql -h localhost -u root -p123456
```

### 问题: "Unknown database"
**原因**: 数据库不存在
**解决**:
```sql
CREATE DATABASE chengpu_polyurethane;
```

### 问题: "Access denied"
**原因**: 用户名或密码错误
**解决**: 检查 `.env.local` 中的凭证

## ✅ 完成检查清单

- [x] 环境变量已配置
- [x] 迁移文件已清理（删除重复）
- [x] 所有迁移已执行
- [x] 数据库表已创建
- [x] 本地认证字段已添加
- [x] 迁移历史已记录

## 📞 需要帮助？

如果遇到其他问题，请检查：
1. MySQL 服务是否运行中
2. 数据库凭证是否正确
3. `.env.local` 文件是否存在且格式正确
4. 迁移文件是否完整

---

**最后更新**: 2026-04-20
**状态**: ✅ 完成
