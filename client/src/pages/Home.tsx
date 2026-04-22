import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { applicationScenes, fallbackBanners, fallbackNews, fallbackProducts, formatDate } from "@/lib/site-data";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { ArrowRight, Building2, Factory, Medal, Newspaper, Phone, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { SectionHeading, SiteShell } from "@/components/SiteShell";

const stats = [
  { label: "公司成立时间", value: "2008 年" },
  { label: "注册资本", value: "1008 万" },
  { label: "年产组合聚醚", value: "15000 吨" },
  { label: "服务案例规模", value: "10000+" },
];

const quickCards = [
  { title: "生产基地", subtitle: "Manufacturing Base", icon: Factory },
  { title: "荣誉资质", subtitle: "Qualification", icon: Medal },
  { title: "质量标准", subtitle: "Quality Control", icon: ShieldCheck },
];

export default function Home() {
  const homeQuery = trpc.site.home.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  
  const { settings } = useCompanySettings();

  const banners = (homeQuery.data?.banners?.length ? homeQuery.data.banners : fallbackBanners) as typeof fallbackBanners;
  const featuredProducts = (homeQuery.data?.featuredProducts?.length ? homeQuery.data.featuredProducts : fallbackProducts).slice(0, 4);
  const latestNews = (homeQuery.data?.latestNews?.length ? homeQuery.data.latestNews : fallbackNews).slice(0, 3);
  const appScenes = useMemo(() => applicationScenes, []);
  const [activeScene, setActiveScene] = useState(0);

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <img src={banners[0]?.imageUrl ?? "/images/header.png"} alt={banners[0]?.title ?? "Banner"} className="h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-linear-to-r from-slate-950/90 via-slate-950/50 to-sky-950/50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(56,189,248,0.25),transparent_22%),radial-gradient(circle_at_20%_80%,rgba(37,99,235,0.28),transparent_20%)]" />
        </div>
        <div className="container relative grid min-h-[78vh] items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.38em] text-sky-300">Polyurethane Enterprise Portal</p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                {banners[0]?.title ?? "聚氨酯材料服务国内外工业客户"}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-sky-50/82 sm:text-lg">
                {banners[0]?.subtitle ?? "围绕保温、冷链、建筑和工业构件场景，提供聚氨酯材料产品、技术支持与持续化内容发布能力。"}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href={banners[0]?.ctaLink || "/products"}>
                <Button size="lg" className="rounded-full bg-sky-500 px-8 text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400">
                  {banners[0]?.ctaLabel || "进入产品中心"}
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="rounded-full border-white/25 bg-white/8 px-8 text-white hover:bg-white/12">
                  了解企业概况
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/8 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur">
            {banners.map((banner, index) => (
              <div
                key={banner.id ?? index}
                className={`rounded-[1.5rem] border p-5 transition ${index === 0 ? "border-sky-300/40 bg-white/12" : "border-white/8 bg-black/15"}`}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-sky-200">0{index + 1}</p>
                <h3 className="mt-3 text-xl font-semibold text-white">{banner.title}</h3>
                <p className="mt-2 text-sm leading-7 text-sky-50/75">{banner.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-8">
            <SectionHeading eyebrow="ABOUT US" title="聚焦聚氨酯材料研发、生产与交付" description="延续参考站首页的信息节奏，以更清晰的蓝白视觉系统呈现企业介绍、产品能力和专业资质。" />
            <div className="grid gap-4 sm:grid-cols-3">
              {quickCards.map(item => (
                <Card key={item.title} className="rounded-[1.5rem] border-sky-100 bg-sky-50/60 shadow-none">
                  <CardContent className="space-y-3 p-5">
                    <item.icon className="h-8 w-8 text-sky-700" />
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs uppercase tracking-[0.24em] text-sky-700">{item.subtitle}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-700">Company Profile</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-950">绍兴市顺丰聚氨酯有限公司</h3>
              <p className="mt-4 text-base leading-8 text-slate-600">
                公司围绕聚氨酯保温与工业材料应用场景构建产品体系，覆盖组合聚醚、冷库板、复合板、工程喷涂和构件配套等方向。前台官网用于专业展示品牌与产品，后台管理系统用于统一维护新闻、产品、Banner 与管理员权限。
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="overflow-hidden rounded-[1.5rem] border border-sky-100 md:col-span-2">
                <img
                  src="/images/建筑外墙保温1.png"
                  alt="企业基地"
                  className="h-56 w-full object-cover"
                />
              </div>
              <div className="grid gap-4">
                <div className="rounded-[1.5rem] bg-linear-to-br from-sky-600 to-blue-800 p-5 text-white">
                  <p className="text-xs uppercase tracking-[0.24em] text-sky-100">World-Class Manufacturing</p>
                  <p className="mt-3 text-lg font-semibold">标准化制造能力</p>
                </div>
                <div className="rounded-[1.5rem] bg-linear-to-br from-sky-100 to-blue-50 p-5 text-slate-900">
                  <p className="text-xs uppercase tracking-[0.24em] text-sky-700">Research & Quality</p>
                  <p className="mt-3 text-lg font-semibold">面向工业客户的稳定交付</p>
                </div>
              </div>
            </div>
            <div>
              <Link href="/about">
                <Button className="rounded-full bg-sky-700 px-7 hover:bg-sky-800">查看更多</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-12 text-white">
        <div className="container grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 lg:grid-cols-4">
          {stats.map(item => (
            <div key={item.label} className="bg-white/4 px-8 py-10 backdrop-blur-sm">
              <p className="text-4xl font-semibold text-white">{item.value}</p>
              <p className="mt-2 text-sm text-sky-100/75">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container space-y-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow="Product Center" title="产品中心" description="支持多级分类展示和产品详情页，后台可对产品、分类和图片进行统一管理。" />
            <Link href="/products">
              <Button variant="outline" className="rounded-full border-sky-200 bg-white px-6 text-sky-700 hover:bg-sky-50">
                查看全部产品
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map(product => (
              <Link key={product.slug} href={`/products/${product.slug}`}>
                <Card className="group h-full overflow-hidden rounded-[1.8rem] border-slate-200 bg-white shadow-none transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(2,132,199,0.12)]">
                  <div className="aspect-[5/4] overflow-hidden bg-slate-100">
                    <img
                      src={product.coverImage || "/images/组合聚醚.png"}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="space-y-3 p-6">
                    <p className="text-xs uppercase tracking-[0.28em] text-sky-700">{(product as any).categoryName || "Product"}</p>
                    <h3 className="text-xl font-semibold text-slate-950">{product.name}</h3>
                    <p className="line-clamp-3 text-sm leading-7 text-slate-600">{product.excerpt || product.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-sky-50 py-20">
        <div className="container grid gap-10 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
          <div className="space-y-6">
            <SectionHeading eyebrow="Product Applications" title="应用领域" description="图文并茂呈现聚氨酯在太阳能热水器、冷链设备、建筑保温与工业构件中的应用场景。" />
            <div className="grid gap-3">
              {appScenes.map((scene, index) => (
                <button
                  key={scene.title}
                  type="button"
                  onClick={() => setActiveScene(index)}
                  className={`rounded-[1.4rem] border px-5 py-4 text-left transition ${
                    index === activeScene ? "border-sky-600 bg-sky-600 text-white shadow-lg shadow-sky-200" : "border-white bg-white text-slate-900"
                  }`}
                >
                  <p className="text-lg font-semibold">{scene.title}</p>
                  <p className={`mt-1 text-xs uppercase tracking-[0.28em] ${index === activeScene ? "text-sky-100" : "text-sky-700"}`}>
                    {(scene as any).subtitle || scene.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_24px_80px_rgba(14,116,144,0.28)]">
            <img src={(appScenes[activeScene] as any)?.imageUrl || "https://d2xsxph8kpxj0f.cloudfront.net/310519663565602556/gUi327Nha93ku2F9QFqWEU/chengpu-hero_c24ceae9.svg"} alt={appScenes[activeScene]?.title} className="h-[540px] w-full object-cover opacity-75" />
            <div className="absolute inset-0 bg-linear-to-r from-slate-950/70 via-slate-950/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
              <div className="max-w-xl rounded-[1.6rem] border border-white/10 bg-white/92 p-8 text-slate-950 shadow-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">Application Scene</p>
                <h3 className="mt-3 text-3xl font-semibold">{appScenes[activeScene]?.title}</h3>
                <p className="mt-4 text-base leading-8 text-slate-600">{appScenes[activeScene]?.description}</p>
                <Link href="/applications">
                  <Button className="mt-6 rounded-full bg-sky-700 px-6 hover:bg-sky-800">查看更多应用</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container space-y-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow="News Information" title="新闻资讯" description="新闻列表与详情由后台维护，前台首页提供资讯预览并链接到分页新闻页面。" />
            <Link href="/news">
              <Button variant="outline" className="rounded-full border-sky-200 bg-white px-6 text-sky-700 hover:bg-sky-50">
                浏览全部资讯
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {latestNews.map(item => (
              <Link key={item.slug} href={`/news/${item.slug}`}>
                <Card className="group h-full rounded-[1.8rem] border-slate-200 shadow-none transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                  <CardContent className="space-y-4 p-7">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.3em] text-sky-700">News</p>
                      <Newspaper className="h-5 w-5 text-sky-700" />
                    </div>
                    <h3 className="text-xl font-semibold leading-8 text-slate-950">{item.title}</h3>
                    <p className="line-clamp-4 text-sm leading-7 text-slate-600">{item.summary || item.content?.replace(/<[^>]*>/g, "") || "暂无摘要"}</p>
                    <div className="flex items-center justify-between pt-4 text-sm text-slate-500">
                      <span>{formatDate((item as any).publishedAt || (item as any).createdAt)}</span>
                      <span className="inline-flex items-center gap-2 text-sky-700">
                        查看详情 <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="container grid gap-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-700">Contact Us</p>
            <h2 className="text-3xl font-semibold text-slate-950 sm:text-4xl">专业、清晰、可持续维护的聚氨酯企业数字门户</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.4rem] bg-sky-50 p-5">
              <Building2 className="h-6 w-6 text-sky-700" />
              <p className="mt-4 text-sm text-slate-500">地址</p>
              <p className="mt-2 font-medium text-slate-900">{settings.address || "浙江省绍兴市越城区孙端街道许家桥村7幢1楼"}</p>
            </div>
            <div className="rounded-[1.4rem] bg-sky-50 p-5">
              <Phone className="h-6 w-6 text-sky-700" />
              <p className="mt-4 text-sm text-slate-500">电话</p>
              <p className="mt-2 font-medium text-slate-900">{settings.phone || "13567550208"}</p>
            </div>
            <div className="rounded-[1.4rem] bg-sky-50 p-5">
              <Newspaper className="h-6 w-6 text-sky-700" />
              <p className="mt-4 text-sm text-slate-500">后台</p>
              <p className="mt-2 font-medium text-slate-900">支持内容发布与管理员管理</p>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
