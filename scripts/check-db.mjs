import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [tables] = await conn.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN (?, ?) ",
  ['application_scenes', '_drizzle_migrations'],
);
console.log('tables:', tables);
await conn.end();
