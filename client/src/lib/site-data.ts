export const siteConfig = {
  company: {
    name: "绍兴市顺丰聚氨酯",
    nameEn: "SHUNFENG POLYURETHANE",
    logo: "SF",
    phone: "13567550208",
    email: "sxsfjaz@126.com",
    address: "浙江省绍兴市越城区孙端街道许家桥村7幢1楼",
    founded: "2008",
  },
};

const heroImage = "/images/header.png";

export const fallbackData = {
  banners: [
    {
      id: 1,
      title: "聚氨酯材料服务国内外工业客户",
      subtitle: "专业生产聚氨酯硬泡系统料，具备防水防腐保温工程一级资质",
      imageUrl: heroImage,
      ctaLabel: "了解产品",
      ctaLink: "/products",
    },
  ],
  categories: [
    {
      id: 1,
      name: "组合聚醚",
      slug: "polyether",
      description: "主要产品，包括喷涂、板材、仿木等多种应用类型",
      level: 1,
    },
    {
      id: 2,
      name: "异氰酸酯",
      slug: "isocyanate",
      description: "聚氨酯系统料配套产品",
      level: 1,
    },
    {
      id: 3,
      name: "环氧自流坪",
      slug: "epoxy-flooring",
      description: "环氧树脂基地坪漆，具有耐水、耐油、耐酸碱等特性",
      level: 1,
    },
  ],
  products: [
    {
      id: 1,
      name: "B1/B2级喷涂组合聚醚",
      slug: "spray-polyether",
      excerpt: "用于建筑外墙、工业保温的喷涂系统料",
      description: "B1/B2级聚氨酯喷涂组合聚醚，广泛应用于建筑外墙保温、工业设备隔热等领域，具有优异的阻燃性能和保温效率。",
      parameters: JSON.stringify([
        { label: "阻燃等级", value: "B1/B2" },
        { label: "应用方式", value: "现场喷涂" },
        { label: "特点", value: "保温效率高、施工便捷、质量稳定" },
      ]),
      coverImage: heroImage,
      gallery: JSON.stringify([heroImage]),
      categoryId: 1,
      isFeatured: true,
      isPublished: true,
    },
    {
      id: 2,
      name: "冷库板用组合聚醚",
      slug: "cold-storage-polyether",
      excerpt: "专为冷库保温工程设计的组合聚醚",
      description: "冷库板用组合聚醚，具有优异的保温性能和尺寸稳定性，广泛应用于冷库、冷链物流等低温环境。公司可承接国内外大型冷库保温工程。",
      parameters: JSON.stringify([
        { label: "应用场景", value: "冷库、冷链物流" },
        { label: "保温性能", value: "导热系数低、隔热效果好" },
        { label: "特点", value: "尺寸稳定、长期耐用" },
      ]),
      coverImage: heroImage,
      gallery: JSON.stringify([heroImage]),
      categoryId: 1,
      isFeatured: true,
      isPublished: true,
    },
    {
      id: 3,
      name: "仿木/仿石组合聚醚",
      slug: "imitation-wood-polyether",
      excerpt: "创意装饰应用的聚氨酯产品",
      description: "聚氨酯仿木组合聚醚，可制造具有逼真木纹或石纹效果的装饰制品，广泛应用于建筑装饰、家居用品等领域。",
      parameters: JSON.stringify([
        { label: "应用", value: "建筑装饰、家居制品" },
        { label: "特点", value: "纹理逼真、质感优异、易加工" },
      ]),
      coverImage: heroImage,
      gallery: JSON.stringify([heroImage]),
      categoryId: 1,
      isFeatured: false,
      isPublished: true,
    },
    {
      id: 4,
      name: "食品灌注组合聚醚",
      slug: "food-grade-polyether",
      excerpt: "食品级聚氨酯灌注料",
      description: "聚氨酯食品灌注组合聚醚，符合食品安全标准，用于食品包装、冷链运输等应用，确保食品安全和保温效果。",
      parameters: JSON.stringify([
        { label: "安全等级", value: "食品级" },
        { label: "应用", value: "食品包装、冷链运输" },
        { label: "特点", value: "安全无毒、保温性好" },
      ]),
      coverImage: heroImage,
      gallery: JSON.stringify([heroImage]),
      categoryId: 1,
      isFeatured: false,
      isPublished: true,
    },
  ],
  news: [
    {
      id: 1,
      title: "顺丰聚氨酯荣获防水防腐保温工程专业承包一级资质",
      slug: "first-class-qualification",
      summary: "公司获得国家防水防腐保温工程专业承包一级资质，可承接国内外大型冷库保温工程。",
      content: "<p>绍兴市顺丰聚氨酯有限公司荣幸获得国家防水防腐保温工程专业承包一级资质。这是对公司多年来在聚氨酯行业专业能力的认可，也标志着公司可以承接国内外大型冷库保温工程及相关保温工程项目。</p><p>公司将继续以质量可靠、技术领先、产品稳定的优势，为客户提供专业的聚氨酯产品和工程施工服务。</p>",
      coverImage: heroImage,
      isPublished: true,
    },
    {
      id: 2,
      title: "聚氨酯产品在冷链物流中的应用优势",
      slug: "cold-chain-application",
      summary: "冷库板用组合聚醚在冷链物流中的应用，保证食品安全和运输效率。",
      content: "<p>随着冷链物流行业的快速发展，对保温材料的要求越来越高。聚氨酯硬泡材料因其优异的保温性能、轻质高强等特点，已成为冷链物流的首选保温材料。</p><p>顺丰聚氨酯的冷库板用组合聚醚产品，具有导热系数低、尺寸稳定、长期耐用等优势，广泛应用于冷库建设、冷藏车、冷链运输等领域，为食品安全保驾护航。</p>",
      coverImage: heroImage,
      isPublished: true,
    },
    {
      id: 3,
      title: "建筑外墙保温材料的选择与应用",
      slug: "building-insulation",
      summary: "B1/B2级喷涂聚氨酯在建筑外墙保温中的应用方案。",
      content: "<p>建筑外墙保温是提高建筑能效的重要手段。聚氨酯喷涂材料因其保温效率高、施工便捷、密闭性好等优点，在建筑外墙保温中得到广泛应用。</p><p>顺丰聚氨酯的B1/B2级喷涂组合聚醚产品，具有优异的阻燃性能和保温效率，可满足各类建筑的保温需求，同时符合国家建筑节能标准。</p>",
      coverImage: heroImage,
      isPublished: true,
    },
  ],
  aboutContent: {
    title: "关于顺丰聚氨酯",
    intro: "绍兴市顺丰聚氨酯有限公司成立于2008年，是一家专业生产聚氨酯硬泡系统料的现代化企业。",
    description: "经过十多年的发展，公司已具备硬质聚氨酯泡沫塑料产品的研制、开发、生产、进出口贸易为一体的完整能力。公司位于浙江省绍兴袍江经济技术开发区，注册资金2000万，已成长为生产经营聚氨酯硬泡系统料、具备国家防水防腐保温工程专业承包一级资质的综合性公司。",
    highlights: [
      "成立于2008年，拥有15年行业经验",
      "国家防水防腐保温工程专业承包一级资质",
      "产品销售遍布全国，远销东南亚",
      "核心团队具有丰富的聚氨酯行业经验",
    ],
    coreValues: "以人为本，合作共赢，质量第一，客户至上",
    mainProducts: [
      "B1/B2级聚氨酯喷涂组合聚醚",
      "聚氨酯仿木组合聚醚",
      "聚氨酯食品灌注组合聚醚",
      "聚氨酯发酵罐用灌注组合聚醚",
      "冷库板用组合聚醚",
      "异氰酸酯",
    ],
    applicationFields: [
      "建筑外墙保温",
      "冷库保温工程",
      "渔船隔热保温",
      "啤酒罐保温",
      "食品发酵罐保温",
      "管道隔热保温",
    ],
  },
  applications: [
    {
      id: 1,
      title: "冷库工程",
      description: "大型冷库保温工程承包，确保冷链物流的温度稳定性",
      icon: "❄️",
    },
    {
      id: 2,
      title: "渔船保温",
      description: "渔船冷藏舱隔热保温，保证海产品新鲜度",
      icon: "🚢",
    },
    {
      id: 3,
      title: "建筑外墙保温",
      description: "建筑节能保温系统，提高建筑能效",
      icon: "🏢",
    },
    {
      id: 4,
      title: "管道保温",
      description: "工业管道隔热保温，减少热损失",
      icon: "🔧",
    },
    {
      id: 5,
      title: "罐体保温",
      description: "啤酒罐、食品发酵罐等罐体保温应用",
      icon: "🏭",
    },
  ],
};

// 导出便捷数据
export const fallbackBanners = fallbackData.banners;
export const fallbackCategories = fallbackData.categories;
export const fallbackProducts = fallbackData.products;
export const fallbackNews = fallbackData.news;
export const applicationScenes = fallbackData.applications;

// 导出关于我们数据
export const aboutPageData = {
  summary: fallbackData.aboutContent.intro,
  description: fallbackData.aboutContent.description,
  timeline: [
    { year: "2008", title: "公司成立", description: "绍兴市顺丰聚氨酯有限公司正式成立" },
    { year: "2015", title: "资质认证", description: "获得国家防水防腐保温工程专业承包一级资质" },
    { year: "2023", title: "技术创新", description: "完善质量保证体系与质量控制流程" },
  ],
  qualifications: [
    "国家防水防腐保温工程专业承包一级资质",
    "ISO 9001 质量管理体系认证",
    "聚氨酯行业领先企业",
  ],
  contacts: {
    address: fallbackData.aboutContent.applicationFields[0] || "浙江省绍兴市越城区孙端街道许家桥村7幢1楼",
    phone: siteConfig.company.phone,
    email: siteConfig.company.email,
  },
};

// 日期格式化函数
export function formatDate(date: any): string {
  if (!date) return "暂无日期";
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

// 解析 JSON 列表
export function parseJsonList(jsonStr: any): string[] {
  if (!jsonStr) return [];
  try {
    const parsed = typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// 解析产品参数
export function parseParameters(jsonStr: any): Array<{ label: string; value: string }> {
  if (!jsonStr) return [];
  try {
    const parsed = typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
