#!/usr/bin/env bash

# 本地认证系统快速部署脚本

echo "=========================================="
echo "本地认证系统快速部署指南"
echo "=========================================="
echo ""

# 检查环境
echo "📋 检查环境..."

if ! command -v pnpm &> /dev/null; then
  echo "❌ 未找到 pnpm，请先安装: npm install -g pnpm"
  exit 1
fi

echo "✓ pnpm 已安装"

# 检查数据库
echo ""
echo "🗄️  检查数据库配置..."

if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  未配置 DATABASE_URL 环境变量"
  echo "请在 .env.local 文件中设置："
  echo "  DATABASE_URL=mysql://user:password@localhost:3306/dbname"
else
  echo "✓ DATABASE_URL 已配置"
fi

# 检查 JWT_SECRET
echo ""
if [ -z "$JWT_SECRET" ]; then
  echo "⚠️  未配置 JWT_SECRET 环境变量"
  echo "请在 .env.local 文件中设置："
  echo "  JWT_SECRET=your_secure_secret_key_here"
else
  echo "✓ JWT_SECRET 已配置"
fi

# 运行迁移
echo ""
echo "🔄 运行数据库迁移..."
pnpm drizzle-kit migrate

# 提示创建用户
echo ""
echo "👤 创建本地管理员账户..."
echo ""
echo "方式 1: 使用交互式脚本"
echo "  node scripts/setup-local-auth.mjs"
echo ""
echo "方式 2: 手动执行 SQL"
echo "  INSERT INTO users (openId, email, name, passwordHash, isLocalAuthEnabled, loginMethod, role) "
echo "  VALUES ('local_admin_001', 'admin@example.com', '管理员', '{password_hash}', true, 'local', 'admin');"
echo ""

# 启动开发服务器
echo "🚀 启动开发服务器..."
echo ""
echo "  pnpm dev"
echo ""

echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "📍 访问地址:"
echo "  后台: http://localhost:3000/admin"
echo "  官网: http://localhost:3000"
echo ""
echo "📖 更多信息："
echo "  查看 LOCAL_AUTH_GUIDE.md 了解详细文档"
echo ""
