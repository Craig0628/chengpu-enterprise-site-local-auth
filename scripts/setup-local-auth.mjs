#!/usr/bin/env node

/**
 * 文件名：setup-local-auth.mjs
 * 文件描述：本地认证系统初始化脚本
 * 功能：交互式创建管理员账户，配置本地认证系统
 * 使用方法：node setup-local-auth.mjs 或 pnpm setup-local-auth
 * 前提条件：.env.local 文件已正确配置，MySQL 数据库已创建
 */

import { createHash } from 'crypto';
import { randomBytes } from 'crypto';
import readline from 'readline';
import mysql from 'mysql2/promise';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

/**
 * 代码段作用：对密码进行 PBKDF2-SHA256 加密（脚本内部使用）
 * 返回格式：salt$iterations$hash
 * 迭代次数：100000（增强安全性）
 */
async function hashPassword(password) {
  const { pbkdf2Sync } = await import('crypto');
  const salt = randomBytes(32).toString('hex');
  const iterations = 100000;
  const keylen = 64;
  const digest = 'sha256';

  const hash = pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');
  return `${salt}$${iterations}$${hash}`;
}

async function main() {
  console.log('\n=== 本地认证系统设置向导 ===\n');

  const email = await question('请输入管理员邮箱: ');
  const name = await question('请输入管理员名称: ');
  const password = await question('请输入管理员密码 (至少8个字符): ');
  const confirmPassword = await question('确认密码: ');

  if (password !== confirmPassword) {
    console.error('\n❌ 密码不匹配！');
    rl.close();
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('\n❌ 密码长度不足 8 个字符！');
    rl.close();
    process.exit(1);
  }

  console.log('\n📝 正在生成密码哈希...');
  const passwordHash = await hashPassword(password);

  const openId = `local_${email}_${Date.now()}`;

  console.log('\n✅ 密码哈希已生成！\n');
  
  const sqlStatement = `INSERT INTO users (openId, email, name, passwordHash, isLocalAuthEnabled, loginMethod, role, lastSignedIn) VALUES ('${openId}', '${email}', '${name}', '${passwordHash}', true, 'local', 'admin', NOW())`;
  
  console.log('=== SQL 语句 ===\n');
  console.log(sqlStatement + ';\n');

  console.log('=== 快速检查清单 ===');
  console.log('✓ 邮箱: ' + email);
  console.log('✓ 名称: ' + name);
  console.log('✓ 角色: admin');
  console.log('✓ 本地认证: 已启用\n');

  // 自动执行 SQL 语句
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL 未配置');
    }

    console.log('🔄 正在连接数据库...');
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    console.log('💾 正在插入管理员账户...');
    await connection.execute(
      'INSERT INTO users (openId, email, name, passwordHash, isLocalAuthEnabled, loginMethod, role, lastSignedIn) VALUES (?, ?, ?, ?, true, ?, ?, NOW())',
      [openId, email, name, passwordHash, 'local', 'admin']
    );

    await connection.end();

    console.log('✅ 管理员账户已成功创建！\n');
    console.log('📋 下一步：');
    console.log('1. 启动开发服务: pnpm dev');
    console.log('2. 访问 http://localhost:3000/admin');
    console.log('3. 选择"本地登陆"标签页');
    console.log(`4. 输入邮箱: ${email}`);
    console.log('5. 输入您设置的密码');
    console.log('6. 点击"登陆"按钮\n');
  } catch (error) {
    console.error('\n⚠️ 自动创建失败，请手动执行 SQL：\n');
    console.error(sqlStatement + ';\n');
    console.error('错误详情:', error.message);
  }

  rl.close();
}

main().catch(error => {
  console.error('错误:', error.message);
  rl.close();
  process.exit(1);
});
