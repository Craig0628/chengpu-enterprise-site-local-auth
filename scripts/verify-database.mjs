#!/usr/bin/env node

import mysql from 'mysql2/promise';
import 'dotenv/config';

async function verifyDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'chengpu_polyurethane',
  });

  try {
    console.log('📊 验证数据库表结构...\n');

    // 检查 users 表
    const [users] = await connection.execute('DESCRIBE users');
    console.log('✅ Users 表已创建');
    console.log('字段列表:');
    users.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
    });

    // 检查其他表
    const tables = ['categories', 'products', 'news', 'banners'];
    for (const table of tables) {
      const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`\n✅ ${table} 表已创建 (记录数: ${result[0].count})`);
    }

    // 检查本地认证字段
    console.log('\n🔐 本地认证字段验证:');
    const [cols] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND TABLE_SCHEMA='chengpu_polyurethane'"
    );
    const colNames = cols.map(c => c.COLUMN_NAME);
    console.log(`  ✅ passwordHash: ${colNames.includes('passwordHash') ? '已添加' : '❌ 缺失'}`);
    console.log(`  ✅ isLocalAuthEnabled: ${colNames.includes('isLocalAuthEnabled') ? '已添加' : '❌ 缺失'}`);

    console.log('\n✨ 数据库初始化完成！');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

verifyDatabase();
