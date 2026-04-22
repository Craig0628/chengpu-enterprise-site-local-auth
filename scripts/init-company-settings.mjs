import mysql from 'mysql2/promise';
import 'dotenv/config';

/**
 * 脚本功能：初始化企业信息表和设置默认值
 * 用法：node scripts/init-company-settings.mjs
 */

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log('Creating company_settings table...');
    
    // 创建表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS company_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`key\` VARCHAR(64) NOT NULL UNIQUE,
        value LONGTEXT,
        description LONGTEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_key (\`key\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('Table created successfully');

    // 插入默认企业信息
    const settings = [
      {
        key: 'name',
        value: '绍兴市顺丰聚氨酯有限公司',
        description: '企业名称'
      },
      {
        key: 'address',
        value: '浙江省绍兴市越城区孙端街道许家桥村7幢1楼',
        description: '企业地址'
      },
      {
        key: 'phone',
        value: '13567550208',
        description: '企业电话'
      },
      {
        key: 'email',
        value: 'sxsfjaz@126.com',
        description: '企业邮箱'
      },
      {
        key: 'fax',
        value: '',
        description: '企业传真'
      },
      {
        key: 'website',
        value: '绍兴市顺丰聚氨酯有限公司',
        description: '企业网站'
      }
    ];

    console.log('Inserting company settings...');
    
    for (const setting of settings) {
      await connection.execute(
        `INSERT INTO company_settings (\`key\`, value, description)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE value = VALUES(value), description = VALUES(description)`,
        [setting.key, setting.value, setting.description]
      );
    }

    console.log('✓ Company settings initialized successfully');

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
