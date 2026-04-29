/**
 * 文件名：db.ts
 * 文件描述：数据库操作模块
 * 功能：统一管理所有数据库操作，包括用户、产品、新闻、Banner等的增删改查
 * 特点：使用 Drizzle ORM 提供类型安全的数据库查询
 */

import { and, asc, desc, eq, inArray, isNull, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  applicationScenes,
  banners,
  categories,
  companySettings,
  InsertApplicationScene,
  InsertBanner,
  InsertCategory,
  InsertNewsItem,
  InsertProduct,
  InsertUser,
  news,
  products,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

// 数据库连接单例
let _db: ReturnType<typeof drizzle> | null = null;

/**
 * 代码段作用：获取数据库连接实例（单例模式）
 * 调用方法：const db = await getDb(); 然后使用 db.select() 等操作
 * 特点：懒加载，首次调用时创建连接
 */
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      console.log("[DB] Attempting to connect to database...");
      _db = drizzle(process.env.DATABASE_URL);
      console.log("[DB] Connected successfully");
    } catch (error) {
      console.warn("[DB] Failed to connect:", error);
      _db = null;
    }
  } else if (!_db) {
    console.log("[DB] DATABASE_URL not configured, _db is null");
  }
  return _db;
}

function extractInsertId(result: unknown): number | null {
  if (typeof result === "object" && result !== null && "insertId" in result) {
    const value = Number((result as any).insertId);
    if (Number.isFinite(value) && value > 0) {
      return value;
    }
  }
  return null;
}

/**
 * 代码段作用：更新或插入用户信息（upsert 操作）
 * 调用方法：upsertUser({ openId: "用户ID", email: "邮箱", name: "用户名" ... })
 * 参数说明：user 对象包含用户的各项信息，openId 是必需的唯一标识
 */
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = {
    openId: user.openId,
  };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];

  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };

  textFields.forEach(assignNullable);

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) {
    values.lastSignedIn = new Date();
  }

  if (Object.keys(updateSet).length === 0) {
    updateSet.lastSignedIn = new Date();
  }

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "admin" | "user") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where(eq(users.id, userId));
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0] ?? null;
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(users).where(eq(users.id, userId));
  return { success: true } as const;
}

export async function listCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(asc(categories.level), asc(categories.sortOrder), asc(categories.id));
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createCategory(input: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(input);
  const insertId = extractInsertId(result);
  return insertId ? getCategoryById(insertId) : null;
}

export async function updateCategory(id: number, input: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set(input).where(eq(categories.id, id));
  return getCategoryById(id);
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(categories).where(eq(categories.id, id));
  return { success: true } as const;
}

export async function listApplicationScenes(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const whereClause = activeOnly ? eq(applicationScenes.isActive, true) : undefined;
  return db
    .select()
    .from(applicationScenes)
    .where(whereClause)
    .orderBy(asc(applicationScenes.sortOrder), desc(applicationScenes.id));
}

export async function getApplicationSceneById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(applicationScenes).where(eq(applicationScenes.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createApplicationScene(input: InsertApplicationScene) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(applicationScenes).values(input);
  const insertId = extractInsertId(result);
  return insertId ? getApplicationSceneById(insertId) : null;
}

export async function updateApplicationScene(id: number, input: Partial<InsertApplicationScene>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(applicationScenes).set(input).where(eq(applicationScenes.id, id));
  return getApplicationSceneById(id);
}

export async function deleteApplicationScene(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(applicationScenes).where(eq(applicationScenes.id, id));
  return { success: true } as const;
}

export async function countApplicationScenes() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(applicationScenes);
  return Number(result[0]?.count ?? 0);
}

export async function listProducts(filters?: { categoryId?: number; publishedOnly?: boolean; search?: string }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [] as Array<ReturnType<typeof eq>>;
  if (filters?.categoryId) {
    conditions.push(eq(products.categoryId, filters.categoryId));
  }
  if (filters?.publishedOnly) {
    conditions.push(eq(products.isPublished, true));
  }
  if (filters?.search) {
    conditions.push(like(products.name, `%${filters.search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  return db
    .select({
      id: products.id,
      categoryId: products.categoryId,
      name: products.name,
      slug: products.slug,
      excerpt: products.excerpt,
      description: products.description,
      parameters: products.parameters,
      coverImage: products.coverImage,
      gallery: products.gallery,
      isFeatured: products.isFeatured,
      isPublished: products.isPublished,
      sortOrder: products.sortOrder,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(whereClause)
    .orderBy(asc(products.sortOrder), desc(products.createdAt));
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select({
      id: products.id,
      categoryId: products.categoryId,
      name: products.name,
      slug: products.slug,
      excerpt: products.excerpt,
      description: products.description,
      parameters: products.parameters,
      coverImage: products.coverImage,
      gallery: products.gallery,
      isFeatured: products.isFeatured,
      isPublished: products.isPublished,
      sortOrder: products.sortOrder,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);
  return result[0] ?? null;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createProduct(input: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(input);
  const insertId = extractInsertId(result);
  if (insertId) {
    return getProductById(insertId);
  }
  return getProductBySlug(input.slug);
}

export async function updateProduct(id: number, input: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(input).where(eq(products.id, id));
  return getProductById(id);
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
  return { success: true } as const;
}

export async function countProducts() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(products);
  return Number(result[0]?.count ?? 0);
}

export async function listNews(options?: { page?: number; pageSize?: number; publishedOnly?: boolean }) {
  const db = await getDb();
  if (!db) return { items: [], total: 0, page: 1, pageSize: options?.pageSize ?? 6 };

  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.max(1, Math.min(24, options?.pageSize ?? 6));
  const conditions = options?.publishedOnly ? [eq(news.isPublished, true)] : [];
  const whereClause = conditions.length ? and(...conditions) : undefined;

  const totalRows = await db.select({ count: sql<number>`count(*)` }).from(news).where(whereClause);
  const total = Number(totalRows[0]?.count ?? 0);
  const items = await db
    .select({
      id: news.id,
      title: news.title,
      slug: news.slug,
      summary: news.summary,
      content: news.content,
      coverImage: news.coverImage,
      isPublished: news.isPublished,
      publishedAt: news.publishedAt,
      authorId: news.authorId,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
      authorName: users.name,
    })
    .from(news)
    .leftJoin(users, eq(news.authorId, users.id))
    .where(whereClause)
    .orderBy(desc(news.publishedAt), desc(news.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, total, page, pageSize };
}

export async function getNewsBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select({
      id: news.id,
      title: news.title,
      slug: news.slug,
      summary: news.summary,
      content: news.content,
      coverImage: news.coverImage,
      isPublished: news.isPublished,
      publishedAt: news.publishedAt,
      authorId: news.authorId,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
      authorName: users.name,
    })
    .from(news)
    .leftJoin(users, eq(news.authorId, users.id))
    .where(eq(news.slug, slug))
    .limit(1);
  return result[0] ?? null;
}

export async function getNewsById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(news).where(eq(news.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createNews(input: InsertNewsItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(news).values(input);
  const insertId = extractInsertId(result);
  return insertId ? getNewsById(insertId) : getNewsBySlug(input.slug);
}

export async function updateNews(id: number, input: Partial<InsertNewsItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(news).set(input).where(eq(news.id, id));
  return getNewsById(id);
}

export async function deleteNews(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(news).where(eq(news.id, id));
  return { success: true } as const;
}

export async function countNews() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(news);
  return Number(result[0]?.count ?? 0);
}

export async function listBanners(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const whereClause = activeOnly ? eq(banners.isActive, true) : undefined;
  return db.select().from(banners).where(whereClause).orderBy(asc(banners.sortOrder), desc(banners.id));
}

export async function getBannerById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(banners).where(eq(banners.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createBanner(input: InsertBanner) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(banners).values(input);
  const insertId = extractInsertId(result);
  return insertId ? getBannerById(insertId) : null;
}

export async function updateBanner(id: number, input: Partial<InsertBanner>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(banners).set(input).where(eq(banners.id, id));
  return getBannerById(id);
}

export async function deleteBanner(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(banners).where(eq(banners.id, id));
  return { success: true } as const;
}

export async function countBanners() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(banners);
  return Number(result[0]?.count ?? 0);
}

export async function getHomepageData() {
  const [bannerList, categoryList, productList, newsList, applicationList] = await Promise.all([
    listBanners(true),
    listCategories(),
    listProducts({ publishedOnly: true }),
    listNews({ page: 1, pageSize: 3, publishedOnly: true }),
    listApplicationScenes(true),
  ]);

  const topLevelCategories = categoryList.filter(item => item.parentId === null || item.parentId === undefined);
  const featuredProducts = productList.filter(item => item.isFeatured).slice(0, 4);

  return {
    banners: bannerList,
    categories: topLevelCategories,
    featuredProducts,
    latestNews: newsList.items,
    applications: applicationList,
    stats: {
      foundedYear: 2008,
      partners: 1008,
      annualCapacity: 15000,
      serviceCases: 10000,
    },
  };
}

// ============================================================================
// Local Authentication Functions
// ============================================================================

/**
 * Get user by email for local authentication
 */
export async function getUserByEmail(email: string) {
  console.log("[DB] getUserByEmail called with:", email);
  
  const db = await getDb();
  if (!db) {
    console.log("[DB] Database not available");
    return undefined;
  }
  
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  console.log("[DB] getUserByEmail result:", result.length > 0 ? { id: result[0].id, email: result[0].email } : null);
  
  return result[0];
}

/**
 * Create a local user with password
 */
export async function createLocalUser(
  email: string,
  name: string,
  passwordHash: string,
  role: "admin" | "user" = "user"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Generate a unique openId for local users
  const openId = `local_${email}_${Date.now()}`;

  const result = await db.insert(users).values({
    openId,
    email,
    name,
    passwordHash,
    loginMethod: "local",
    isLocalAuthEnabled: true,
    role,
    lastSignedIn: new Date(),
  });

  return getUserByOpenId(openId);
}

/**
 * Update user password
 */
export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      passwordHash,
      isLocalAuthEnabled: true,
      loginMethod: "local",
    })
    .where(eq(users.id, userId));

  return db.select().from(users).where(eq(users.id, userId)).limit(1).then(r => r[0] ?? null);
}

/**
 * Enable local auth for an existing user
 */
export async function enableLocalAuthForUser(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      passwordHash,
      isLocalAuthEnabled: true,
    })
    .where(eq(users.id, userId));

  return db.select().from(users).where(eq(users.id, userId)).limit(1).then(r => r[0] ?? null);
}

/**
 * List all local auth enabled users
 */
export async function listLocalAuthUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.isLocalAuthEnabled, true)).orderBy(desc(users.createdAt));
}

// ============================================================================
// Company Settings Functions - 企业信息管理
// ============================================================================

/**
 * 获取企业信息（所有设置）
 */
export async function getCompanySettings() {
  const db = await getDb();
  if (!db) return {};

  const settings = await db.select().from(companySettings);
  const result: Record<string, string> = {};
  
  for (const setting of settings) {
    result[setting.key] = setting.value || "";
  }
  
  return result;
}

/**
 * 获取单个企业设置值
 */
export async function getCompanySetting(key: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(companySettings)
    .where(eq(companySettings.key, key))
    .limit(1);

  return result[0]?.value || null;
}

/**
 * 创建或更新企业设置
 */
export async function upsertCompanySetting(key: string, value: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(companySettings)
    .where(eq(companySettings.key, key))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(companySettings)
      .set({ value, description, updatedAt: new Date() })
      .where(eq(companySettings.key, key));
  } else {
    await db.insert(companySettings).values({
      key,
      value,
      description,
    });
  }

  return getCompanySetting(key);
}
