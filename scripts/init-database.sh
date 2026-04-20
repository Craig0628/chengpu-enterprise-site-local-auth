#!/usr/bin/env bash
# Database Migration Quick Fix Script
# 数据库迁移快速修复脚本

set -e

echo "=========================================="
echo "🚀 本地登陆系统 - 数据库初始化"
echo "=========================================="
echo ""

# 检查环境
if ! command -v mysql &> /dev/null; then
  echo "⚠️  未找到 mysql 命令"
  echo "请确保 MySQL 已安装并添加到 PATH"
  exit 1
fi

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
  echo "❌ 未找到 pnpm"
  echo "请先安装 pnpm: npm install -g pnpm"
  exit 1
fi

# 测试数据库连接
echo "1️⃣  测试数据库连接..."
if mysql -h localhost -u root -p123456 chengpu_polyurethane -e "SELECT 1;" >/dev/null 2>&1; then
  echo "   ✅ 数据库连接成功"
else
  echo "   ❌ 数据库连接失败"
  echo "   请检查 MySQL 是否运行，以及用户名/密码是否正确"
  exit 1
fi

# 生成迁移文件
echo ""
echo "2️⃣  生成迁移文件..."
export DATABASE_URL="mysql://root:123456@localhost:3306/chengpu_polyurethane"
pnpm drizzle-kit generate

# 应用迁移
echo ""
echo "3️⃣  应用数据库迁移..."
pnpm drizzle-kit migrate

# 验证
echo ""
echo "4️⃣  验证数据库表..."
mysql -h localhost -u root -p123456 chengpu_polyurethane -e "
SELECT 
  CONCAT('Table: ', TABLE_NAME, ' (', COLUMN_COUNT, ' columns)') as status
FROM (
  SELECT TABLE_NAME, COUNT(*) as COLUMN_COUNT
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'chengpu_polyurethane'
  GROUP BY TABLE_NAME
) t
ORDER BY TABLE_NAME;
"

echo ""
echo "5️⃣  检查本地认证字段..."
mysql -h localhost -u root -p123456 chengpu_polyurethane -e "
SELECT 
  IF(EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME='users' AND COLUMN_NAME='passwordHash'), '✅', '❌') as passwordHash,
  IF(EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME='users' AND COLUMN_NAME='isLocalAuthEnabled'), '✅', '❌') as isLocalAuthEnabled;
"

echo ""
echo "=========================================="
echo "✅ 数据库初始化完成！"
echo "=========================================="
echo ""
echo "📝 后续步骤:"
echo "  1. node scripts/setup-local-auth.mjs   # 创建管理员"
echo "  2. pnpm dev                             # 启动服务"
echo "  3. http://localhost:3000/admin          # 访问后台"
echo ""
