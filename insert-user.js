import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function run() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  await connection.execute(`INSERT INTO users (openId, email, name, passwordHash, isLocalAuthEnabled, loginMethod, role, lastSignedIn) VALUES (?, ?, ?, ?, true, ?, ?, NOW())`, [
    'local_wanggl0628@126.com_1776696073008',
    'wanggl0628@126.com',
    'admin',
    '55a6269824084c799096e5c9a8f526c35f089ca1235d204f49301115eb49a15d$100000$f4a5454a087c412824a16f0252f83601ddc4577a4b0a65907b081fc001cfffbb0d0a6c6ad06fa1f1f5b81cf7876f2e5b4f50775366880cba8efdda3da96d5c5b',
    'local',
    'admin'
  ]);
  console.log('User inserted successfully');
  await connection.end();
}

run().catch(console.error);