import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

function hashPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const iterations = 100000;
  const keylen = 64;
  const digest = 'sha256';

  const hash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');
  return `${salt}$${iterations}$${hash}`;
}

function verifyPassword(password, storedHash) {
  const parts = storedHash.split('$');
  if (parts.length !== 3) return false;

  const salt = parts[0];
  const iterations = parseInt(parts[1]);
  const storedHashValue = parts[2];

  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha256').toString('hex');
  return hash === storedHashValue;
}

async function test() {
  const testPassword = '12345678';
  const hashed = hashPassword(testPassword);
  console.log('Generated hash:', hashed);

  const isValid = verifyPassword(testPassword, hashed);
  console.log('Verification test:', isValid);

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await connection.execute('SELECT passwordHash FROM users WHERE email = ?', ['wanggl0628@126.com']);
  if (rows.length > 0) {
    const storedHash = rows[0].passwordHash;
    console.log('Stored hash:', storedHash);
    const match = verifyPassword(testPassword, storedHash);
    console.log('Password match:', match);
  }
  await connection.end();
}

test().catch(console.error);