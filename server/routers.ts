import { COOKIE_NAME } from "@shared/const";
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
  createProduct,
  deleteBanner,
  deleteCategory,
  deleteNews,
  deleteProduct,
  getHomepageData,
  getNewsBySlug,
  getProductBySlug,
  getUserByEmail,
  listBanners,
  listCategories,
  listLocalAuthUsers,
  listNews,
  listProducts,
  listUsers,
  updateBanner,
  updateCategory,
  updateNews,
  updateProduct,
  updateUserPassword,
  updateUserRole,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
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
  coverImage: z.string().url().nullable().optional(),
  isActive: z.boolean().default(true),
});

const productInputSchema = z.object({
  categoryId: z.number().int(),
  name: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  parameters: z.string().nullable().optional(),
  coverImage: z.string().url().nullable().optional(),
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
  coverImage: z.string().url().nullable().optional(),
  isPublished: z.boolean().default(true),
  publishedAt: z.number().optional(),
});

const bannerInputSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  imageUrl: z.string().url(),
  ctaLabel: z.string().nullable().optional(),
  ctaLink: z.string().nullable().optional(),
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
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
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
    about: publicProcedure.query(() => ({
      companyName: "绍兴市辰晟聚氨酯有限公司",
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
        phone: "0575-00000000",
        email: "info@chengshengpu.com",
        address: "浙江省绍兴市柯桥区示例工业园区",
      },
    })),
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
    uploadImage: adminProcedure.input(uploadInputSchema).mutation(async ({ input }) => {
      const buffer = Buffer.from(input.base64Data, "base64");
      const uploaded = await storagePut(buildUploadKey(input.fileName), buffer, input.contentType);
      return uploaded;
    }),
  }),
});

export type AppRouter = typeof appRouter;
