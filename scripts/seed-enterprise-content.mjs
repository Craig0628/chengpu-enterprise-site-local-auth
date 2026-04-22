import mysql from 'mysql2/promise';

// 本地图片路径（替代云端URL）
const heroImage = '/images/header.png';
const polyetherImage = '/images/组合聚醚.png';
const isocyanateImage = '/images/异氰酸酯.png';
const epoxyImage = '/images/环氧自流平.png';
const sprayImage = '/images/喷涂组合聚醚应用.png';
const boardImage = '/images/板材组合聚醚应用.png';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  await connection.execute(
    `INSERT INTO banners (id, title, subtitle, imageUrl, ctaLabel, ctaLink, sortOrder, isActive)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE title = VALUES(title), subtitle = VALUES(subtitle), imageUrl = VALUES(imageUrl), ctaLabel = VALUES(ctaLabel), ctaLink = VALUES(ctaLink), sortOrder = VALUES(sortOrder), isActive = VALUES(isActive)`,
    [1, '聚氨酯材料服务国内外工业客户', '围绕保温、冷链、建筑外墙与工业构件场景，提供稳定可靠的聚氨酯产品与配套方案。', heroImage, '了解产品中心', '/products', 1, 1],
  );

  const categories = [
    [1, '组合聚醚', 'polyether', '适用于冷链与保温系统的组合聚醚产品。', null, 1, 1, polyetherImage, 1],
    [2, '保温板材', 'insulation-board', '用于冷库、建筑与工业设备的聚氨酯板材。', null, 1, 2, boardImage, 1],
    [3, '工程喷涂', 'engineering-spray', '面向现场喷涂与建筑节能的组合料方案。', null, 1, 3, sprayImage, 1],
    [4, '冷库板', 'cold-room-board', '保温板材子分类。', 2, 2, 1, boardImage, 1],
    [5, '复合板', 'composite-board', '保温板材子分类。', 2, 2, 2, boardImage, 1],
  ];

  for (const row of categories) {
    await connection.execute(
      `INSERT INTO categories (id, name, slug, description, parentId, level, sortOrder, coverImage, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), parentId = VALUES(parentId), level = VALUES(level), sortOrder = VALUES(sortOrder), coverImage = VALUES(coverImage), isActive = VALUES(isActive)`,
      row,
    );
  }

  const products = [
    [1, 1, '聚氨酯发酵罐组合料', 'beer-tank-material', '适用于啤酒发酵罐等保温系统，兼顾发泡稳定性与隔热性能。', '该系列材料可用于工业发酵罐、储液罐等保温结构，兼顾机械强度、尺寸稳定性与施工适配性。', JSON.stringify([{ label: '适用场景', value: '工业保温容器' }, { label: '主要特点', value: '导热系数低、尺寸稳定' }, { label: '交付方式', value: '组合料' }]), polyetherImage, JSON.stringify([polyetherImage, '/images/罐体保温1.jpg']), 1, 1, 1],
    [2, 2, '聚氨酯冷库板', 'polyurethane-cold-room-board', '适合冷库保温围护结构，强调保温效率与安装便利。', '产品广泛应用于冷库、冷链物流与工业温控空间，可根据厚度与面板形式进行灵活选型。', JSON.stringify([{ label: '芯材', value: '聚氨酯硬泡' }, { label: '面板形式', value: '彩钢/不锈钢可选' }, { label: '特性', value: '隔热、轻质、施工便捷' }]), boardImage, JSON.stringify([boardImage, '/images/冷库工程1.png']), 1, 1, 2],
    [3, 2, '聚氨酯复合板', 'polyurethane-composite-board', '适用于工业厂房、设备外壳与建筑围护的复合板产品。', '复合板兼顾强度与保温性，适配多类工业建筑和设备配套场景。', JSON.stringify([{ label: '应用', value: '工业围护/设备外壳' }, { label: '特点', value: '平整度高、保温稳定' }]), boardImage, JSON.stringify([boardImage]), 1, 1, 3],
    [4, 3, '工程喷涂系列组合料', 'engineering-spray-material', '服务于现场喷涂保温、防腐与建筑节能应用。', '面向建筑外墙、屋面与工业管道等场景，满足不同施工工艺要求。', JSON.stringify([{ label: '施工方式', value: '现场喷涂' }, { label: '应用场景', value: '建筑/工业保温' }]), sprayImage, JSON.stringify([sprayImage, '/images/建筑外墙保温1.png']), 1, 1, 4],
  ];

  for (const row of products) {
    await connection.execute(
      `INSERT INTO products (id, categoryId, name, slug, excerpt, description, parameters, coverImage, gallery, isFeatured, isPublished, sortOrder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE categoryId = VALUES(categoryId), name = VALUES(name), excerpt = VALUES(excerpt), description = VALUES(description), parameters = VALUES(parameters), coverImage = VALUES(coverImage), gallery = VALUES(gallery), isFeatured = VALUES(isFeatured), isPublished = VALUES(isPublished), sortOrder = VALUES(sortOrder)`,
      row,
    );
  }

  const news = [
    [1, '工程喷涂系列组合料在建筑领域的应用趋势', 'spray-material-building-trend', '从施工效率、节能表现与耐久性角度，观察聚氨酯喷涂材料的行业价值。', '<p>随着建筑节能要求不断提高，聚氨酯喷涂材料在围护结构中的应用越来越广。其优势主要体现在保温效率、施工连续性与复杂结构适应能力等方面。</p><p>在工业厂房、冷链设施与公共建筑节能改造中，该类材料能够显著提升整体热工性能。</p>', sprayImage, 1, Date.now()],
    [2, '聚氨酯冷库板在冷链工程中的选型建议', 'cold-room-board-selection-guide', '围绕芯材性能、面材方案与施工节点控制，梳理冷库板选型要点。', '<p>冷链工程对保温材料的稳定性和密封性要求较高，冷库板的结构强度、导热性能与接口处理方式均会影响长期运行表现。</p>', boardImage, 1, Date.now()],
    [3, '企业生产线升级后交付效率进一步提升', 'production-line-upgrade', '通过工艺优化与流程标准化，缩短部分产品交付周期。', '<p>在生产和质检环节持续优化后，公司在冷链板材与组合料类产品的交付效率上取得进一步提升，为客户项目推进提供更稳定支持。</p>', heroImage, 1, Date.now()],
  ];

  for (const row of news) {
    await connection.execute(
      `INSERT INTO news (id, title, slug, summary, content, coverImage, isPublished, publishedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, FROM_UNIXTIME(? / 1000))
       ON DUPLICATE KEY UPDATE title = VALUES(title), summary = VALUES(summary), content = VALUES(content), coverImage = VALUES(coverImage), isPublished = VALUES(isPublished), publishedAt = VALUES(publishedAt)`,
      row,
    );
  }

  await connection.end();
  console.log('Seeded enterprise content successfully.');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
