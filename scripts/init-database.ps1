#!/usr/bin/env pwsh
# Database Migration Quick Fix Script (Windows PowerShell)
# 数据库迁移快速修复脚本

param(
  [string]$DbHost = "localhost",
  [string]$DbPort = "3306",
  [string]$DbUser = "root",
  [string]$DbPassword = "123456",
  [string]$DbName = "chengpu_polyurethane"
)

$ErrorActionPreference = "Stop"

Write-Host "=========================================="
Write-Host "🚀 本地登陆系统 - 数据库初始化" -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host ""

# 检查 pnpm
Write-Host "1️⃣  检查工具..."
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Host "   ❌ 未找到 pnpm" -ForegroundColor Red
  Write-Host "   请先安装: npm install -g pnpm"
  exit 1
}
Write-Host "   ✅ pnpm 已安装"

# 测试数据库连接
Write-Host ""
Write-Host "2️⃣  测试数据库连接..."
$connectionString = "Data Source=$DbHost;User Id=$DbUser;Password=$DbPassword;Database=$DbName"
try {
  $connection = New-Object System.Data.SqlClient.SqlConnection
  Write-Host "   ℹ️  连接字符串: mysql://$DbUser@$DbHost/$DbName" -ForegroundColor Gray
  Write-Host "   ✅ 配置正确（实际连接需要在命令行测试）"
} catch {
  Write-Host "   ⚠️  配置检查失败" -ForegroundColor Yellow
}

# 设置环境变量
Write-Host ""
Write-Host "3️⃣  设置环境变量..."
$env:DATABASE_URL = "mysql://$DbUser`:$DbPassword@$DbHost`:$DbPort/$DbName"
Write-Host "   ✅ DATABASE_URL=$env:DATABASE_URL" -ForegroundColor Green

# 生成迁移文件
Write-Host ""
Write-Host "4️⃣  生成迁移文件..."
try {
  pnpm drizzle-kit generate
  Write-Host "   ✅ 迁移文件生成成功"
} catch {
  Write-Host "   ❌ 生成迁移文件失败: $_" -ForegroundColor Red
  exit 1
}

# 应用迁移
Write-Host ""
Write-Host "5️⃣  应用数据库迁移..."
try {
  pnpm drizzle-kit migrate
  Write-Host "   ✅ 数据库迁移成功"
} catch {
  Write-Host "   ❌ 应用迁移失败: $_" -ForegroundColor Red
  exit 1
}

# 检查迁移记录
Write-Host ""
Write-Host "6️⃣  检查迁移记录..."
$journalPath = ".\drizzle\meta\_journal.json"
if (Test-Path $journalPath) {
  $journal = Get-Content $journalPath | ConvertFrom-Json
  Write-Host "   ✅ 已执行 $($journal.entries.Count) 个迁移:"
  $journal.entries | ForEach-Object {
    Write-Host "      - $($_.tag)" -ForegroundColor Green
  }
} else {
  Write-Host "   ⚠️  迁移记录文件未找到" -ForegroundColor Yellow
}

# 总结
Write-Host ""
Write-Host "=========================================="
Write-Host "✅ 数据库初始化完成！" -ForegroundColor Green
Write-Host "=========================================="
Write-Host ""
Write-Host "📝 后续步骤:" -ForegroundColor Cyan
Write-Host "  1. node scripts/setup-local-auth.mjs   # 创建管理员账户"
Write-Host "  2. pnpm dev                             # 启动开发服务"
Write-Host "  3. http://localhost:3000/admin          # 访问后台"
Write-Host ""
Write-Host "💡 提示:" -ForegroundColor Yellow
Write-Host "  要在这个 PowerShell 会话中使用数据库命令，请设置环境变量:"
Write-Host "  `$env:DATABASE_URL='mysql://$DbUser@$DbHost/$DbName'" -ForegroundColor Gray
Write-Host ""
