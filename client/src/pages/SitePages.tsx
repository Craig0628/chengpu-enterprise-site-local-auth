import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  aboutPageData,
  applicationScenes,
  fallbackCategories,
  fallbackNews,
  fallbackProducts,
  formatDate,
  parseJsonList,
  parseParameters,
} from "@/lib/site-data";
import { ChevronLeft, ChevronRight, Mail, MapPin, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { SectionHeading, SiteShell } from "@/components/SiteShell";

export function ProductsPage() {
  const categoryQuery = trpc.site.categories.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const productQuery = trpc.site.products.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const categories = categoryQuery.data?.length ? categoryQuery.data : fallbackCategories;
  const products = productQuery.data?.length ? productQuery.data : fallbackProducts;
  const [selectedSlug, setSelectedSlug] = useState<string>("all");

  const visibleProducts = useMemo(() => {
    if (selectedSlug === "all") return products;
    const category = categories.find((item: any) => item.slug === selectedSlug);
    if (!category) return products;
    const childIds = categories.filter((item: any) => item.parentId === category.id).map((item: any) => item.id);
    return products.filter((item: any) => item.categoryId === category.id || childIds.includes(item.categoryId));
  }, [categories, products, selectedSlug]);

  return (
    <SiteShell>
      <section className="bg-linear-to-b from-sky-950 via-blue-950 to-slate-950 py-20 text-white">
        <div className="container grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <SectionHeading eyebrow="Products" title="产品中心" description="支持多级分类展示、详情页访问以及后台可维护的产品信息体系。" />
          <div className="rounded-[2rem] border border-white/10 bg-white/8 p-6 text-sm leading-7 text-white/80 backdrop-blur">
            当前页面以类目切换方式承接多级分类结构，分类与产品数据由后台统一维护，并可通过产品详情页呈现图片、描述与参数信息。
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container space-y-8">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSelectedSlug("all")}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                selectedSlug === "all" ? "bg-sky-700 text-white" : "bg-sky-50 text-sky-700"
              }`}
            >
              全部产品
            </button>
            {categories
              .filter((item: any) => !item.parentId)
              .map((category: any) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => setSelectedSlug(category.slug)}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                    selectedSlug === category.slug ? "bg-sky-700 text-white" : "bg-sky-50 text-sky-700"
                  }`}
                >
                  {category.name}
                </button>
              ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product: any) => (
              <Link key={product.slug} href={`/products/${product.slug}`}>
                <Card className="group overflow-hidden rounded-[1.75rem] border-slate-200 shadow-none transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(14,116,144,0.12)]">
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={product.coverImage || "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80"}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="space-y-3 p-6">
                    <p className="text-xs uppercase tracking-[0.28em] text-sky-700">产品分类</p>
                    <h3 className="text-2xl font-semibold text-slate-950">{product.name}</h3>
                    <p className="line-clamp-3 text-sm leading-7 text-slate-600">{product.excerpt || product.description}</p>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-sky-700">
                      查看详情 <ChevronRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

export function ProductDetailPage({ params }: { params: { slug: string } }) {
  const query = trpc.site.productBySlug.useQuery({ slug: params.slug }, { retry: false, refetchOnWindowFocus: false });
  const fallback = fallbackProducts.find((item: any) => item.slug === params.slug) || fallbackProducts[0];
  const product = query.data || fallback;
  const gallery = parseJsonList(product.gallery);
  const parameters = parseParameters(product.parameters);

  return (
    <SiteShell>
      <section className="bg-linear-to-r from-sky-950 via-blue-900 to-slate-900 py-18 text-white">
        <div className="container space-y-4">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-sky-200 transition hover:text-white">
            <ChevronLeft className="h-4 w-4" /> 返回产品中心
          </Link>
          <p className="text-sm uppercase tracking-[0.28em] text-sky-200">产品详情</p>
          <h1 className="text-4xl font-semibold">{product.name}</h1>
          <p className="max-w-3xl text-base leading-8 text-white/80">{product.excerpt || product.description}</p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50">
              <img
                src={product.coverImage || "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80"}
                alt={product.name}
                className="h-[460px] w-full object-cover"
              />
            </div>
            {gallery.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {gallery.map((image: any) => (
                  <div key={image} className="overflow-hidden rounded-[1.5rem] border border-slate-200">
                    <img src={image} alt={product.name} className="h-48 w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
            <SectionHeading eyebrow="Product Overview" title="产品介绍" description={product.description || "后台支持为每个产品维护详细的应用、特性和参数信息。"} />
            <div className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4 text-sm font-semibold text-slate-900">参数信息</div>
              <div className="divide-y divide-slate-100">
                {parameters.length ? (
                  parameters.map((item: any) => (
                    <div key={`${item.label}-${item.value}`} className="grid gap-2 px-5 py-4 sm:grid-cols-[160px_1fr]">
                      <p className="text-sm font-medium text-slate-500">{item.label}</p>
                      <p className="text-sm leading-7 text-slate-700">{item.value}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-4 text-sm text-slate-500">暂无参数信息，可在后台补充维护。</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

export function ApplicationsPage() {
  return (
    <SiteShell>
      <section className="bg-linear-to-r from-sky-950 via-blue-950 to-slate-950 py-20 text-white">
        <div className="container space-y-5">
          <SectionHeading eyebrow="Applications" title="应用领域" description="聚氨酯材料在冷链设备、建筑保温、太阳能热水器和工业构件中的典型应用。" />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container grid gap-8">
          {applicationScenes.map((scene: any, index: number) => (
            <div
              key={scene.title}
              className={`grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-none lg:grid-cols-[0.55fr_0.45fr] ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <div className="min-h-[320px] overflow-hidden">
                <img src={scene.imageUrl} alt={scene.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-10">
                <p className="text-xs uppercase tracking-[0.3em] text-sky-700">{scene.subtitle}</p>
                <h2 className="mt-4 text-3xl font-semibold text-slate-950">{scene.title}</h2>
                <p className="mt-4 text-base leading-8 text-slate-600">{scene.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

export function NewsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const query = trpc.site.news.useQuery({ page, pageSize }, { retry: false, refetchOnWindowFocus: false });
  const fallbackTotal = fallbackNews.length;
  const items = query.data?.items?.length ? query.data.items : fallbackNews.slice((page - 1) * pageSize, page * pageSize);
  const total = query.data?.total ?? fallbackTotal;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <SiteShell>
      <section className="bg-linear-to-r from-sky-950 via-blue-950 to-slate-950 py-20 text-white">
        <div className="container space-y-5">
          <SectionHeading eyebrow="News" title="新闻资讯" description="支持新闻列表、分页浏览与新闻详情页，内容可由后台统一增删改查。" />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container space-y-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {items.map((item: any) => (
              <Link key={item.slug} href={`/news/${item.slug}`}>
                <Card className="h-full rounded-[1.8rem] border-slate-200 shadow-none transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                  <CardContent className="space-y-5 p-7">
                    <p className="text-sm text-slate-500">新闻资讯</p>
                    <h3 className="text-2xl font-semibold leading-9 text-slate-950">{item.title}</h3>
                    <p className="line-clamp-4 text-sm leading-7 text-slate-600">{item.summary || item.content?.replace(/<[^>]*>/g, "") || "暂无摘要"}</p>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-sky-700">
                      查看详情 <ChevronRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" className="rounded-full" disabled={page <= 1} onClick={() => setPage(current => Math.max(1, current - 1))}>
              上一页
            </Button>
            <div className="rounded-full bg-sky-50 px-5 py-2 text-sm text-sky-800">
              第 {page} / {totalPages} 页
            </div>
            <Button variant="outline" className="rounded-full" disabled={page >= totalPages} onClick={() => setPage(current => Math.min(totalPages, current + 1))}>
              下一页
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

export function NewsDetailPage({ params }: { params: { slug: string } }) {
  const query = trpc.site.newsBySlug.useQuery({ slug: params.slug }, { retry: false, refetchOnWindowFocus: false });
  const item = query.data || fallbackNews.find((newsItem: any) => newsItem.slug === params.slug) || fallbackNews[0];

  return (
    <SiteShell>
      <section className="bg-linear-to-r from-sky-950 via-blue-900 to-slate-900 py-18 text-white">
        <div className="container space-y-4">
          <Link href="/news" className="inline-flex items-center gap-2 text-sm text-sky-200 transition hover:text-white">
            <ChevronLeft className="h-4 w-4" /> 返回新闻列表
          </Link>
          <p className="text-sm uppercase tracking-[0.28em] text-sky-200">News Detail</p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight">{item.title}</h1>
          <p className="text-sm text-white/70">发布时间：{formatDate((item as any).publishedAt || (item as any).createdAt)}</p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container grid gap-8 lg:grid-cols-[0.75fr_0.25fr]">
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-none">
            {item.coverImage ? <img src={item.coverImage} alt={item.title} className="h-[360px] w-full object-cover" /> : null}
            <div className="prose prose-slate max-w-none p-8 lg:p-10" dangerouslySetInnerHTML={{ __html: item.content || `<p>${item.summary || "暂无正文内容。"}</p>` }} />
          </article>
          <aside className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">更多入口</p>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <Link href="/news" className="block rounded-2xl bg-white px-4 py-3 transition hover:bg-sky-50 hover:text-sky-700">返回新闻列表</Link>
              <Link href="/products" className="block rounded-2xl bg-white px-4 py-3 transition hover:bg-sky-50 hover:text-sky-700">查看产品中心</Link>
              <Link href="/about" className="block rounded-2xl bg-white px-4 py-3 transition hover:bg-sky-50 hover:text-sky-700">了解企业信息</Link>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}

export function AboutPage() {
  return (
    <SiteShell>
      <section className="bg-linear-to-r from-sky-950 via-blue-950 to-slate-950 py-20 text-white">
        <div className="container space-y-5">
          <SectionHeading eyebrow="About Us" title="关于我们" description="展示企业介绍、发展历程、资质荣誉与联系方式，延续制造业官网的专业调性。" />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
              <p className="text-sm uppercase tracking-[0.28em] text-sky-700">Company Intro</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">绍兴市辰晟聚氨酯有限公司</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">{aboutPageData.summary}</p>
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80"
                alt="企业展示"
                className="h-[340px] w-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8">
              <p className="text-sm uppercase tracking-[0.28em] text-sky-700">Timeline</p>
              <div className="mt-6 space-y-5">
                {aboutPageData.timeline.map((item: any) => (
                  <div key={item.year} className="grid gap-3 sm:grid-cols-[110px_1fr]">
                    <div className="text-2xl font-semibold text-sky-700">{item.year}</div>
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm leading-7 text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
                <p className="text-sm uppercase tracking-[0.28em] text-sky-700">Honors</p>
                <div className="mt-5 space-y-3">
                  {aboutPageData.qualifications.map((item: any) => (
                    <div key={item} className="rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
                <p className="text-sm uppercase tracking-[0.28em] text-sky-700">Contact</p>
                <div className="mt-5 space-y-4 text-sm leading-7 text-slate-700">
                  <p className="flex items-start gap-3"><MapPin className="mt-1 h-4 w-4 text-sky-700" /> {aboutPageData.contacts.address}</p>
                  <p className="flex items-start gap-3"><Phone className="mt-1 h-4 w-4 text-sky-700" /> {aboutPageData.contacts.phone}</p>
                  <p className="flex items-start gap-3"><Mail className="mt-1 h-4 w-4 text-sky-700" /> {aboutPageData.contacts.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
