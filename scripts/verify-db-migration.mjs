#!/usr/bin/env node

/**
 * Database Migration Verification Script
 * 验证数据库迁移是否成功
 */

import sqlite3 from 'better-sqlite3';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function verifyMigrations() {
  console.log('📋 === 数据库迁移验证 ===\n');

  // 检查迁移文件
  console.log('1️⃣  检查迁移文件:');
  const migrationsDir = './drizzle';
  const sqlFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  sqlFiles.forEach(file => {
    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const lines = content.split('\n').filter(l => l.trim()).length;
    console.log(`  ✅ ${file} (${lines} 行)`);
  });

  // 验证数据库连接
  console.log('\n2️⃣  验证数据库连接:');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'chengpu_polyurethane',
    });
    console.log('  ✅ 连接成功');
  } catch (error) {
    console.error('  ❌ 连接失败:', error.message);
    process.exit(1);
  }

  // 检查表
  console.log('\n3️⃣  检查表结构:');
  const tables = ['users', 'categories', 'products', 'news', 'banners'];
  
  for (const table of tables) {
    try {
      const [result] = await connection.execute(
        `SELECT COUNT(*) as cnt FROM ${table}`
      );
      console.log(`  ✅ ${table} 表已创建`);
    } catch (error) {
      console.log(`  ❌ ${table} 表未创建: ${error.message}`);
    }
  }

  // 检查 users 表的本地认证字段
  console.log('\n4️⃣  检查本地认证字段:');
  const [columns] = await connection.execute(
    `SELECT COLUMN_NAME, COLUMN_TYPE 
     FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_NAME='users' 
     AND TABLE_SCHEMA='chengpu_polyurethane'
     AND COLUMN_NAME IN ('passwordHash', 'isLocalAuthEnabled')`
  );

  if (columns.length >= 2) {
    columns.forEach(col => {
      console.log(`  ✅ ${col.COLUMN_NAME}: ${col.COLUMN_TYPE}`);
    });
  } else {
    console.log('  ⚠️  本地认证字段检查:');
    if (columns.find(c => c.COLUMN_NAME === 'passwordHash')) {
      console.log('    ✅ passwordHash');
    } else {
      console.log('    ❌ passwordHash 缺失');
    }
    if (columns.find(c => c.COLUMN_NAME === 'isLocalAuthEnabled')) {
      console.log('    ✅ isLocalAuthEnabled');
    } else {
      console.log('    ❌ isLocalAuthEnabled 缺失');
    }
  }

  // 检查迁移历史
  console.log('\n5️⃣  检查迁移历史:');
  const journalPath = './drizzle/meta/_journal.json';
  if (fs.existsSync(journalPath)) {
    const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
    console.log(`  ✅ 已执行 ${journal.entries.length} 个迁移:`);
    journal.entries.forEach((entry, i) => {
      console.log(`    ${i + 1}. ${entry.tag}`);
    });
  }

  // 检查 __drizzle_migrations__ 表
  console.log('\n6️⃣  检查 Drizzle 迁移记录表:');
  try {
    const [migrations] = await connection.execute(
      `SELECT name FROM __drizzle_migrations__`
    );
    console.log(`  ✅ 已在数据库中记录 ${migrations.length} 个迁移:`);
    migrations.forEach(m => {
      console.log(`    - ${m.name}`);
    });
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('  ⚠️  __drizzle_migrations__ 表不存在（这是正常的）');
    } else {
      console.log('  ❌ 错误:', error.message);
    }
  }

  console.log('\n✨ === 验证完成 ===');
  console.log('\n📝 后续步骤:');
  console.log('  1. node scripts/setup-local-auth.mjs   # 创建管理员账户');
  console.log('  2. pnpm dev                             # 启动开发服务器');
  console.log('  3. http://localhost:3000/admin          # 访问后台');

  await connection.end();
}

verifyMigrations().catch(err => {
  console.error('验证过程出错:', err);
  process.exit(1);
});
