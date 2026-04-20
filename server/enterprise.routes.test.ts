import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  countBanners: vi.fn(async () => 2),
  countNews: vi.fn(async () => 3),
  countProducts: vi.fn(async () => 4),
  createBanner: vi.fn(),
  createCategory: vi.fn(),
  createNews: vi.fn(async input => ({ id: 99, ...input })),
  createProduct: vi.fn(),
  deleteBanner: vi.fn(),
  deleteCategory: vi.fn(),
  deleteNews: vi.fn(),
  deleteProduct: vi.fn(),
  getHomepageData: vi.fn(async () => ({ banners: [], categories: [], featuredProducts: [], latestNews: [], stats: {} })),
  getNewsBySlug: vi.fn(async () => null),
  getProductBySlug: vi.fn(async () => null),
  listBanners: vi.fn(async () => []),
  listCategories: vi.fn(async () => []),
  listNews: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 10 })),
  listProducts: vi.fn(async () => []),
  listUsers: vi.fn(async () => [{ id: 1, name: "Admin", role: "admin" }]),
  updateBanner: vi.fn(),
  updateCategory: vi.fn(),
  updateNews: vi.fn(),
  updateProduct: vi.fn(),
  updateUserRole: vi.fn(async (userId, role) => ({ id: userId, role })),
}));

const storageMocks = vi.hoisted(() => ({
  storagePut: vi.fn(async () => ({ key: "enterprise-site/demo.png", url: "https://cdn.example.com/demo.png" })),
}));

vi.mock("./db", () => dbMocks);
vi.mock("./storage", () => storageMocks);

import { appRouter } from "./routers";

type Role = "admin" | "user";

function createContext(role: Role | null): TrpcContext {
  return {
    user: role
      ? {
          id: role === "admin" ? 1 : 2,
          openId: `${role}-openid`,
          email: `${role}@example.com`,
          name: `${role}-user`,
          loginMethod: "manus",
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        }
      : null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("enterprise routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the static about payload for the public site", async () => {
    const caller = appRouter.createCaller(createContext(null));
    const result = await caller.site.about();

    expect(result.companyName).toBe("绍兴市辰晟聚氨酯有限公司");
    expect(result.timeline.length).toBeGreaterThan(0);
    expect(result.contacts.phone).toContain("0575");
  });

  it("rejects admin user listing for non-admin accounts", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.admin.users()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("allows admin dashboard access and aggregates key metrics", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.admin.dashboard();

    expect(result.metrics).toEqual({
      products: 4,
      news: 3,
      banners: 2,
    });
  });

  it("creates news with the current admin as author", async () => {
    const caller = appRouter.createCaller(createContext("admin"));

    await caller.admin.createNews({
      title: "测试新闻",
      slug: "test-news",
      summary: "摘要",
      content: "<p>正文</p>",
      coverImage: "https://cdn.example.com/news.jpg",
      isPublished: true,
      publishedAt: Date.now(),
    });

    expect(dbMocks.createNews).toHaveBeenCalledTimes(1);
    expect(dbMocks.createNews.mock.calls[0]?.[0]).toMatchObject({
      title: "测试新闻",
      slug: "test-news",
      authorId: 1,
      isPublished: true,
    });
  });

  it("uploads images through storage and returns CDN url", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.admin.uploadImage({
      fileName: "banner.png",
      contentType: "image/png",
      base64Data: Buffer.from("demo-image").toString("base64"),
    });

    expect(storageMocks.storagePut).toHaveBeenCalledTimes(1);
    expect(result.url).toBe("https://cdn.example.com/demo.png");
  });

  it("updates user role when requested by an admin", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.admin.updateUserRole({ userId: 2, role: "admin" });

    expect(dbMocks.updateUserRole).toHaveBeenCalledWith(2, "admin");
    expect(result).toMatchObject({ id: 2, role: "admin" });
  });

  it("forwards pagination options for news listing", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await caller.site.news({ page: 2, pageSize: 6, publishedOnly: true });

    expect(dbMocks.listNews).toHaveBeenCalledWith({ page: 2, pageSize: 6, publishedOnly: true });
  });

  it("allows admin banner updates and category deletions", async () => {
    const caller = appRouter.createCaller(createContext("admin"));

    await caller.admin.updateBanner({
      id: 8,
      title: "新版 Banner",
      subtitle: "副标题",
      imageUrl: "https://cdn.example.com/banner.png",
      ctaLabel: "查看",
      ctaLink: "/products",
      isActive: true,
      sortOrder: 2,
    });
    await caller.admin.deleteCategory({ id: 11 });

    expect(dbMocks.updateBanner).toHaveBeenCalledTimes(1);
    expect(dbMocks.deleteCategory).toHaveBeenCalledWith(11);
  });

  it("returns not found when querying a missing news slug", async () => {
    const caller = appRouter.createCaller(createContext(null));

    await expect(caller.site.newsBySlug({ slug: "missing-news" })).rejects.toBeInstanceOf(TRPCError);
  });
});
