/**
 * 文件名：routers.ts
 * 文件描述：tRPC API 路由定义模块
 * 功能：定义所有后端 API 接口，包括认证、产品、新闻、Banner、分类等管理接口
 * 调用方式：客户端通过 trpc.auth.localLogin()、trpc.products.list() 等调用
 * 特点：使用 Zod 进行请求数据验证，分为公开、受保护和管理员权限三个级别的过程
 */

import { COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  countBanners,
  countNews,
  countProducts,
  createBanner,
  createCategory,
  createLocalUser,
  createNews,
  createApplicationScene,
  deleteApplicationScene,
  createProduct,
  deleteBanner,
  deleteCategory,
  deleteNews,
  deleteProduct,
  getCompanySettings,
  getCompanySetting,
  getHomepageData,
  getNewsBySlug,
  getProductBySlug,
  getUserByEmail,
  listApplicationScenes,
  listBanners,
  listCategories,
  listLocalAuthUsers,
  listNews,
  listProducts,
  listUsers,
  updateApplicationScene,
  updateBanner,
  updateCategory,
  updateNews,
  updateProduct,
  updateUserPassword,
  updateUserRole,
  upsertCompanySetting,
} from "./db";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { sdk } from "./_core/sdk";
import { hashPassword, verifyPassword } from "./_core/password";

const categoryInputSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  parentId: z.number().nullable().optional(),
  level: z.number().int().min(1).default(1),
  sortOrder: z.number().int().default(0),
  coverImage: z.union([
    z.string().url(),
    z.string().regex(/^\/images\/.+/, "Invalid image path"),
    z.literal("")
  ]).nullable().optional(),
  isActive: z.boolean().default(true),
});

const productInputSchema = z.object({
  categoryId: z.number().int(),
  name: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  parameters: z.string().nullable().optional(),
  coverImage: z.union([
    z.string().url(),
    z.string().regex(/^\/images\/.+/, "Invalid image path"),
    z.literal("")
  ]).nullable().optional(),
  gallery: z.string().nullable().optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

const newsInputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  coverImage: z.union([
    z.string().url(),
    z.string().regex(/^\/images\/.+/, "Invalid image path"),
    z.literal("")
  ]).nullable().optional(),
  isPublished: z.boolean().default(true),
  publishedAt: z.number().optional(),
});

const bannerInputSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  imageUrl: z.union([z.string().url(), z.string().regex(/^\/images\/.+/, "Invalid image path")]),
  ctaLabel: z.string().nullable().optional(),
  ctaLink: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

const applicationSceneInputSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.union([
    z.string().url(),
    z.string().regex(/^\/images\/.+/, "Invalid image path"),
    z.literal("")
  ]).nullable().optional(),
  icon: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

const uploadInputSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  base64Data: z.string().min(1),
});

function normalizeNullableText(value?: string | null) {
  if (value === undefined) return undefined;
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeNullableNumber(value?: number | null) {
  if (value === undefined) return undefined;
  return value === null ? null : value;
}

function buildUploadKey(fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
  return `enterprise-site/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      // 登出时需要使用与登录时相同的 cookie options 才能正确删除 cookie
      ctx.res.clearCookie(COOKIE_NAME, SESSION_COOKIE_OPTIONS);
      return { success: true } as const;
    }),
    localLogin: publicProcedure
      .input(
        z.object({
          email: z.string().email("Invalid email format"),
          password: z.string().min(1, "Password is required"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        console.log("[Auth] localLogin called with:", { email: input.email, hasPassword: !!input.password });
        
        try {
          const user = await sdk.authenticateLocalUser(input.email, input.password, ctx.res);
          console.log("[Auth] localLogin successful for user:", user.id);
          
          return {
            success: true,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          };
        } catch (error) {
          console.log("[Auth] localLogin failed:", error);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: error instanceof Error ? error.message : "Authentication failed",
          });
        }
      }),
    localRegister: adminProcedure
      .input(
        z.object({
          email: z.string().email("Invalid email format"),
          name: z.string().min(1, "Name is required"),
          password: z.string().min(8, "Password must be at least 8 characters"),
          role: z.enum(["user", "admin"]).default("user"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const existingUser = await getUserByEmail(input.email);
          if (existingUser && existingUser.isLocalAuthEnabled) {
            throw new Error("Email already registered with local authentication");
          }

          const passwordHash = await hashPassword(input.password);
          const user = await createLocalUser(input.email, input.name, passwordHash, input.role);

          return {
            success: true,
            user: {
              id: user?.id,
              name: user?.name,
              email: user?.email,
              role: user?.role,
            },
          };
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Registration failed",
          });
        }
      }),
    updatePassword: protectedProcedure
      .input(
        z.object({
          oldPassword: z.string().min(1, "Old password is required"),
          newPassword: z.string().min(8, "New password must be at least 8 characters"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        try {
          // Verify old password if user has local auth enabled
          if (ctx.user.isLocalAuthEnabled && ctx.user.passwordHash) {
            const isOldPasswordValid = await verifyPassword(input.oldPassword, ctx.user.passwordHash);
            if (!isOldPasswordValid) {
              throw new Error("Old password is incorrect");
            }
          }

          const newPasswordHash = await hashPassword(input.newPassword);
          await updateUserPassword(ctx.user.id, newPasswordHash);

          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Password update failed",
          });
        }
      }),
    listLocalUsers: adminProcedure.query(async () => {
      try {
        const users = await listLocalAuthUsers();
        return users.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          loginMethod: u.loginMethod,
          lastSignedIn: u.lastSignedIn,
          createdAt: u.createdAt,
        }));
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list local users",
        });
      }
    }),
  }),
  site: router({
    home: publicProcedure.query(async () => getHomepageData()),
    categories: publicProcedure.query(async () => listCategories()),
    products: publicProcedure
      .input(
        z
          .object({
            categoryId: z.number().int().optional(),
            search: z.string().optional(),
            publishedOnly: z.boolean().optional(),
          })
          .optional(),
      )
      .query(async ({ input }) =>
        listProducts({
          categoryId: input?.categoryId,
          search: input?.search,
          publishedOnly: input?.publishedOnly ?? true,
        }),
      ),
    productBySlug: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(async ({ input }) => {
      const item = await getProductBySlug(input.slug);
      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "产品不存在" });
      }
      return item;
    }),
    news: publicProcedure
      .input(
        z
          .object({
            page: z.number().int().min(1).default(1),
            pageSize: z.number().int().min(1).max(24).default(6),
            publishedOnly: z.boolean().default(true),
          })
          .optional(),
      )
      .query(async ({ input }) =>
        listNews({
          page: input?.page ?? 1,
          pageSize: input?.pageSize ?? 6,
          publishedOnly: input?.publishedOnly ?? true,
        }),
      ),
    newsBySlug: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(async ({ input }) => {
      const item = await getNewsBySlug(input.slug);
      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "新闻不存在" });
      }
      return item;
    }),
    applications: publicProcedure.query(async () => listApplicationScenes(true)),
    about: publicProcedure.query(() => ({
      companyName: "绍兴市顺丰聚氨酯有限公司",
      slogan: "聚焦聚氨酯材料研发、生产、销售的一体化制造服务企业。",
      intro:
        "公司长期围绕聚氨酯发泡、保温与工业材料应用展开技术积累，产品覆盖冷库、太阳能热水器、管道保温及相关工业构件领域。",
      timeline: [
        { year: "2008", title: "公司成立", description: "形成聚氨酯配套产品与工程服务基础能力。" },
        { year: "2014", title: "产能扩充", description: "拓展保温材料与应用构件产品线。" },
        { year: "2020", title: "工艺升级", description: "持续完善制造、质检与客户交付流程。" },
      ],
      honors: ["质量管理规范化", "工业应用经验丰富", "多行业配套服务"],
      contacts: {
        phone: "13567550208",
        email: "sxsfjaz@126.com",
        address: "浙江省绍兴市越城区孙端街道许家桥村7幢1楼",
      },
    })),
  }),
  company: router({
    // 公开获取企业信息
    getSettings: publicProcedure.query(async () => {
      return getCompanySettings();
    }),
    // 管理员更新企业信息
    updateSettings: adminProcedure
      .input(
        z.object({
          name: z.string().optional(),
          address: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          fax: z.string().optional(),
          website: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const updates = [];
        if (input.name !== undefined) updates.push(upsertCompanySetting("name", input.name, "企业名称"));
        if (input.address !== undefined) updates.push(upsertCompanySetting("address", input.address, "企业地址"));
        if (input.phone !== undefined) updates.push(upsertCompanySetting("phone", input.phone, "企业电话"));
        if (input.email !== undefined) updates.push(upsertCompanySetting("email", input.email, "企业邮箱"));
        if (input.fax !== undefined) updates.push(upsertCompanySetting("fax", input.fax, "企业传真"));
        if (input.website !== undefined) updates.push(upsertCompanySetting("website", input.website, "企业网站"));
        
        await Promise.all(updates);
        return getCompanySettings();
      }),
  }),
  admin: router({
    dashboard: protectedProcedure.query(async ({ ctx }) => ({
      user: ctx.user,
      metrics: {
        products: await countProducts(),
        news: await countNews(),
        banners: await countBanners(),
      },
    })),
    users: adminProcedure.query(async () => listUsers()),
    updateUserRole: adminProcedure
      .input(z.object({ userId: z.number().int(), role: z.enum(["admin", "user"]) }))
      .mutation(async ({ input }) => updateUserRole(input.userId, input.role)),
    categories: adminProcedure.query(async () => listCategories()),
    createCategory: adminProcedure
      .input(categoryInputSchema)
      .mutation(async ({ input }) =>
        createCategory({
          name: input.name,
          slug: input.slug,
          description: normalizeNullableText(input.description),
          parentId: normalizeNullableNumber(input.parentId),
          level: input.level,
          sortOrder: input.sortOrder,
          coverImage: normalizeNullableText(input.coverImage),
          isActive: input.isActive,
        }),
      ),
    updateCategory: adminProcedure
      .input(categoryInputSchema.partial().extend({ id: z.number().int() }))
      .mutation(async ({ input }) =>
        updateCategory(input.id, {
          name: input.name,
          slug: input.slug,
          description: normalizeNullableText(input.description),
          parentId: normalizeNullableNumber(input.parentId),
          level: input.level,
          sortOrder: input.sortOrder,
          coverImage: normalizeNullableText(input.coverImage),
          isActive: input.isActive,
        }),
      ),
    deleteCategory: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => deleteCategory(input.id)),
    products: adminProcedure
      .input(
        z
          .object({
            categoryId: z.number().int().optional(),
            search: z.string().optional(),
          })
          .optional(),
      )
      .query(async ({ input }) =>
        listProducts({
          categoryId: input?.categoryId,
          search: input?.search,
          publishedOnly: false,
        }),
      ),
    createProduct: adminProcedure
      .input(productInputSchema)
      .mutation(async ({ input }) =>
        createProduct({
          categoryId: input.categoryId,
          name: input.name,
          slug: input.slug,
          excerpt: normalizeNullableText(input.excerpt),
          description: normalizeNullableText(input.description),
          parameters: normalizeNullableText(input.parameters),
          coverImage: normalizeNullableText(input.coverImage),
          gallery: normalizeNullableText(input.gallery),
          isFeatured: input.isFeatured,
          isPublished: input.isPublished,
          sortOrder: input.sortOrder,
        }),
      ),
    updateProduct: adminProcedure
      .input(productInputSchema.partial().extend({ id: z.number().int() }))
      .mutation(async ({ input }) =>
        updateProduct(input.id, {
          categoryId: input.categoryId,
          name: input.name,
          slug: input.slug,
          excerpt: normalizeNullableText(input.excerpt),
          description: normalizeNullableText(input.description),
          parameters: normalizeNullableText(input.parameters),
          coverImage: normalizeNullableText(input.coverImage),
          gallery: normalizeNullableText(input.gallery),
          isFeatured: input.isFeatured,
          isPublished: input.isPublished,
          sortOrder: input.sortOrder,
        }),
      ),
    deleteProduct: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => deleteProduct(input.id)),
    news: adminProcedure
      .input(
        z
          .object({
            page: z.number().int().min(1).default(1),
            pageSize: z.number().int().min(1).max(24).default(10),
          })
          .optional(),
      )
      .query(async ({ input }) => listNews({ page: input?.page ?? 1, pageSize: input?.pageSize ?? 10, publishedOnly: false })),
    createNews: adminProcedure
      .input(newsInputSchema)
      .mutation(async ({ ctx, input }) =>
        createNews({
          title: input.title,
          slug: input.slug,
          summary: normalizeNullableText(input.summary),
          content: normalizeNullableText(input.content),
          coverImage: normalizeNullableText(input.coverImage),
          isPublished: input.isPublished,
          publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date(),
          authorId: ctx.user.id,
        }),
      ),
    updateNews: adminProcedure
      .input(newsInputSchema.partial().extend({ id: z.number().int() }))
      .mutation(async ({ input }) =>
        updateNews(input.id, {
          title: input.title,
          slug: input.slug,
          summary: normalizeNullableText(input.summary),
          content: normalizeNullableText(input.content),
          coverImage: normalizeNullableText(input.coverImage),
          isPublished: input.isPublished,
          publishedAt: input.publishedAt ? new Date(input.publishedAt) : undefined,
        }),
      ),
    deleteNews: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => deleteNews(input.id)),
    banners: adminProcedure.query(async () => listBanners(false)),
    createBanner: adminProcedure
      .input(bannerInputSchema)
      .mutation(async ({ input }) =>
        createBanner({
          title: input.title,
          subtitle: normalizeNullableText(input.subtitle),
          imageUrl: input.imageUrl,
          ctaLabel: normalizeNullableText(input.ctaLabel),
          ctaLink: normalizeNullableText(input.ctaLink),
          sortOrder: input.sortOrder,
          isActive: input.isActive,
        }),
      ),
    updateBanner: adminProcedure
      .input(bannerInputSchema.partial().extend({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        if (input.imageUrl !== undefined && !input.imageUrl) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Banner 图片不能为空" });
        }
        return updateBanner(input.id, {
          title: input.title,
          subtitle: normalizeNullableText(input.subtitle),
          imageUrl: input.imageUrl,
          ctaLabel: normalizeNullableText(input.ctaLabel),
          ctaLink: normalizeNullableText(input.ctaLink),
          sortOrder: input.sortOrder,
          isActive: input.isActive,
        });
      }),
    deleteBanner: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => deleteBanner(input.id)),
    applications: adminProcedure.query(async () => listApplicationScenes(false)),
    createApplication: adminProcedure
      .input(applicationSceneInputSchema)
      .mutation(async ({ input }) => createApplicationScene(input)),
    updateApplication: adminProcedure
      .input(applicationSceneInputSchema.partial().extend({ id: z.number().int() }))
      .mutation(async ({ input }) =>
        updateApplicationScene(input.id, {
          title: input.title,
          subtitle: input.subtitle,
          description: input.description,
          imageUrl: input.imageUrl,
          icon: input.icon,
          sortOrder: input.sortOrder,
          isActive: input.isActive,
        }),
      ),
    deleteApplication: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => deleteApplicationScene(input.id)),
    uploadImage: adminProcedure.input(uploadInputSchema).mutation(async ({ input }) => {
      const buffer = Buffer.from(input.base64Data, "base64");
      const uploaded = await storagePut(buildUploadKey(input.fileName), buffer, input.contentType);
      return uploaded;
    }),
  }),
});

export type AppRouter = typeof appRouter;
