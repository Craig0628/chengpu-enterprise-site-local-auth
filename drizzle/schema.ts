/**
 * 文件名：schema.ts
 * 文件描述：Drizzle ORM 数据库模式定义
 * 功能：定义数据库中所有的表结构，包括用户、产品、分类、新闻、Banner 等
 * 特点：使用 Drizzle ORM 提供类型安全的数据库操作
 */

import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * 代码段作用：定义 users 用户表
 * 包含字段：
 *   - id: 主键，自动递增
 *   - openId: 用户唯一标识，支持 OAuth 和本地认证
 *   - email: 邮箱（本地认证必需）
 *   - passwordHash: 密码哈希（本地认证存储）
 *   - isLocalAuthEnabled: 是否启用本地认证
 *   - role: 用户角色（user 或 admin）
 *   - loginMethod: 登录方式（local、oauth 等）
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  isLocalAuthEnabled: boolean("isLocalAuthEnabled").default(false).notNull(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  description: text("description"),
  parentId: int("parentId"),
  level: int("level").default(1).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  coverImage: text("coverImage"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  excerpt: text("excerpt"),
  description: text("description"),
  parameters: text("parameters"),
  coverImage: text("coverImage"),
  gallery: text("gallery"),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  isPublished: boolean("isPublished").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const news = mysqlTable("news", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 220 }).notNull(),
  slug: varchar("slug", { length: 240 }).notNull().unique(),
  summary: text("summary"),
  content: text("content"),
  coverImage: text("coverImage"),
  isPublished: boolean("isPublished").default(true).notNull(),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  authorId: int("authorId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const banners = mysqlTable("banners", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("imageUrl").notNull(),
  ctaLabel: varchar("ctaLabel", { length: 80 }),
  ctaLink: varchar("ctaLink", { length: 255 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const applicationScenes = mysqlTable("application_scenes", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  imageUrl: text("imageUrl"),
  icon: varchar("icon", { length: 32 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * 代码段作用：定义 company_settings 企业信息表
 * 包含字段：企业名称、地址、电话、邮箱、传真、网站等
 * 用途：存储企业的联系信息和基本设置，可通过管理后台修改
 */
export const companySettings = mysqlTable("company_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(), // 如：name, address, phone, email 等
  value: text("value"), // 配置值
  description: text("description"), // 配置描述
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type NewsItem = typeof news.$inferSelect;
export type InsertNewsItem = typeof news.$inferInsert;

export type Banner = typeof banners.$inferSelect;
export type InsertBanner = typeof banners.$inferInsert;export type ApplicationScene = typeof applicationScenes.$inferSelect;
export type InsertApplicationScene = typeof applicationScenes.$inferInsert;
export type CompanySetting = typeof companySettings.$inferSelect;
export type InsertCompanySetting = typeof companySettings.$inferInsert;
