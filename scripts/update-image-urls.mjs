import mysql from 'mysql2/promise';

/**
 * 脚本功能：将数据库中所有的外部图片URL替换为本地图片路径
 * 用法：node scripts/update-image-urls.mjs
 */

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  console.log('Starting to update image URLs in database...');

  try {
    // 更新 banners 表中的图片
    console.log('Updating banners table...');
    await connection.execute(
      `UPDATE banners 
       SET imageUrl = '/images/header.png' 
       WHERE imageUrl LIKE 'https://%' OR imageUrl LIKE 'http://%'`
    );

    // 更新 categories 表中的图片
    console.log('Updating categories table...');
    await connection.execute(
      `UPDATE categories 
       SET coverImage = '/images/组合聚醚.png' 
       WHERE coverImage LIKE 'https://%' OR coverImage LIKE 'http://%'`
    );

    // 更新 products 表中的 coverImage
    console.log('Updating products coverImage...');
    await connection.execute(
      `UPDATE products 
       SET coverImage = '/images/组合聚醚.png' 
       WHERE coverImage LIKE 'https://%' OR coverImage LIKE 'http://%'`
    );

    // 更新 products 表中的 gallery (JSON 字符串)
    console.log('Updating products gallery...');
    const products = await connection.query('SELECT id, gallery FROM products WHERE gallery IS NOT NULL');
    for (const [product] of products) {
      if (product.gallery && typeof product.gallery === 'string') {
        try {
          let gallery = JSON.parse(product.gallery);
          let updated = false;
          
          if (Array.isArray(gallery)) {
            gallery = gallery.map(img => {
              if (typeof img === 'string' && (img.includes('https://') || img.includes('http://'))) {
                updated = true;
                return '/images/组合聚醚.png';
              }
              return img;
            });
          }
          
          if (updated) {
            await connection.execute(
              'UPDATE products SET gallery = ? WHERE id = ?',
              [JSON.stringify(gallery), product.id]
            );
          }
        } catch (e) {
          console.log(`Skipping gallery update for product ${product.id}: ${e.message}`);
        }
      }
    }

    // 更新 news 表中的图片
    console.log('Updating news table...');
    await connection.execute(
      `UPDATE news 
       SET coverImage = '/images/header.png' 
       WHERE coverImage LIKE 'https://%' OR coverImage LIKE 'http://%'`
    );

    console.log('✓ All image URLs have been updated to local paths');
    
  } catch (error) {
    console.error('Error updating image URLs:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
