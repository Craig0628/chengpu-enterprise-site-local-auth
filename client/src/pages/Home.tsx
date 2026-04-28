import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { applicationScenes, fallbackBanners, fallbackNews, fallbackProducts, formatDate } from "@/lib/site-data";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { ArrowRight, Building2, Factory, Medal, Newspaper, Phone, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { SectionHeading, SiteShell } from "@/components/SiteShell";

// 导入 Swiper 相关组件和样式
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

const stats = [
  { label: "公司成立时间", value: "2008 年" },
  { label: "注册资本", value: "1008 万" },
  { label: "年产组合聚醚", value: "15000 吨" },
  { label: "年售异氰酸酯", value: "10000 吨" }, // 参考 HTML 中第四个数据
];

const quickCards = [
  { title: "公司简介", subtitle: "Company Profile", icon: Building2, link: "/about" },
  { title: "荣誉资质", subtitle: "Honor & Qualification", icon: Medal, link: "/honor" },
  { title: "研发中心", subtitle: "R&D Center", icon: Factory, link: "/workshop" },
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
  
  // 应用领域轮播状态
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  return (
    <SiteShell>
      {/* ===== 1. Banner 轮播 (Swiper) ===== */}
      <section className="relative w-full">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          navigation
          pagination={{ clickable: true }}
          loop
          className="h-[600px] md:h-[700px] lg:h-[80vh]"
        >
          {banners.map((banner, index) => (
            <SwiperSlide key={banner.id ?? index}>
              <div className="relative h-full w-full">
                <img
                  src={banner.imageUrl ?? "/images/banner1.jpg"}
                  alt={banner.title}
                  className="h-full w-full object-cover"
                />
                {/* 文字叠加层 - 居中 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 text-white px-4 text-center">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
                    {banner.title}
                  </h2>
                  <p className="text-lg md:text-xl lg:text-2xl max-w-4xl drop-shadow-md">
                    {banner.subtitle}
                  </p>
                  {banner.ctaLabel && (
                    <div className="mt-8">
                      <Link href={banner.ctaLink || "#"}>
                        <Button size="lg" className="rounded-full bg-primary px-8 text-white shadow-lg hover:bg-primary/90">
                          {banner.ctaLabel}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ===== 2. 关于我们区域 ===== */}
      <section className="bg-white py-16 md:py-24">
        <div className="container grid gap-10 lg:grid-cols-2 lg:items-start">
          {/* 左侧：标题 + 按钮 */}
          <div className="space-y-6">
            <p className="text-lg font-semibold text-primary">ABOUT US</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
              集聚氨酯研究、开发、生产、销售于一体的高新技术企业
            </h2>
            <Link href="/about">
              <Button variant="outline" className="mt-4 rounded-full border-primary text-primary hover:bg-primary hover:text-white">
                查看更多
              </Button>
            </Link>
          </div>
          {/* 右侧：公司简介文本 */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800">绍兴市顺丰聚氨酯有限公司</h3>
            <p className="text-gray-500">Shaoxing Chenxing Polyurethane Co., Ltd</p>
            <p className="text-gray-600 leading-relaxed">
              公司主要生产B1\B2级聚氨酯喷涂组合聚醚、聚氨酯仿木组合聚醚、聚氨酯食品灌注组合聚醚、
              聚氨酯发酵罐用灌注组合聚醚、冷库板用组合聚醚、经销异氰酸酯。产品应用和工程施工涉及建筑外墙、
              冷库、渔船、啤酒罐、食品发酵罐及管道的隔热保温等多个应用领域。
            </p>
          </div>
        </div>

        {/* 三个入口卡片 */}
        <div className="container mt-12">
          <div className="grid gap-6 md:grid-cols-3">
            {quickCards.map((item) => (
              <Link key={item.title} href={item.link}>
                <Card className="group h-full overflow-hidden rounded-[var(--radius-card)] border-0 bg-white shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-md">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                      <item.icon className="h-8 w-8" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-800">{item.title}</h4>
                    <p className="mt-2 text-sm text-primary">{item.subtitle}</p>
                    <p className="mt-4 text-sm font-medium text-primary hover:underline">
                      View More+
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. 数据统计条 (浅色背景) ===== */}
      <section className="bg-gray-50 py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
            {stats.map((item) => (
              <div key={item.label}>
                <div className="text-4xl font-bold text-primary md:text-5xl">
                  {item.value}
                </div>
                <p className="mt-2 text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. 产品中心 ===== */}
      <section className="bg-white py-16 md:py-24">
        <div className="container space-y-10">
          <div className="flex flex-col items-center text-center">
            <p className="text-lg font-semibold text-primary">Product Center</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-800">产品中心</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link key={product.slug} href={`/products/${product.slug}`}>
                <Card className="group h-full overflow-hidden rounded-[var(--radius-card)] border-0 bg-white shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-md">
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={product.coverImage || "/images/product-placeholder.jpg"}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-5 text-center">
                    <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {/* 假设 product 有英文名，若无则用固定文本 */}
                      { (product as any).enName || "Polyurethane Product" }
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link href="/products">
              <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white">
                查看更多产品
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 5. 产品应用领域 (Swiper 联动轮播) ===== */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container grid gap-10 lg:grid-cols-2 lg:items-start">
          {/* 左侧标题 */}
          <div className="space-y-6">
            <p className="text-lg font-semibold text-primary">Product Applications</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">产品应用</h2>
            <p className="text-gray-600 leading-relaxed">
              产品主要用于冰箱、冷柜、太阳能热水器、车库门、仿木材料、现场喷涂、冷库渔船、啤酒罐保温、
              以及节能环保的聚氨酯建筑外墙保温材料等。
            </p>
          </div>
          {/* 右侧轮播区 */}
          <div className="space-y-4">
            <Swiper
              modules={[Navigation, Thumbs]}
              thumbs={{ swiper: thumbsSwiper }}
              navigation
              className="rounded-2xl shadow-lg"
              onSlideChange={(swiper) => setActiveSceneIndex(swiper.realIndex)}
            >
              {appScenes.map((scene, index) => (
                <SwiperSlide key={index}>
                  <div className="relative aspect-video overflow-hidden rounded-2xl">
                    <img
                      src={(scene as any).imageUrl || "/images/application-default.jpg"}
                      alt={scene.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
                      <h4 className="text-2xl font-bold">{scene.title}</h4>
                      <p className="text-sm opacity-90">{scene.description}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            {/* 缩略图导航 */}
            <Swiper
              onSwiper={setThumbsSwiper}
              modules={[Thumbs]}
              slidesPerView={4}
              spaceBetween={10}
              watchSlidesProgress
              className="thumbs-swiper"
            >
              {appScenes.map((scene, index) => (
                <SwiperSlide key={index}>
                  <div className={`cursor-pointer overflow-hidden rounded-lg border-2 transition ${index === activeSceneIndex ? 'border-primary' : 'border-transparent'}`}>
                    <img
                      src={(scene as any).imageUrl || "/images/application-thumb.jpg"}
                      alt={scene.title}
                      className="aspect-video w-full object-cover"
                    />
                    <p className="truncate p-2 text-center text-sm font-medium">{scene.title}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* ===== 6. 新闻资讯 ===== */}
      <section className="bg-white py-16 md:py-24">
        <div className="container space-y-10">
          <div className="flex flex-col items-center text-center">
            <p className="text-lg font-semibold text-primary">News Information</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-800">新闻资讯</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestNews.map((item) => (
              <Link key={item.slug} href={`/news/${item.slug}`}>
                <Card className="group h-full overflow-hidden rounded-[var(--radius-card)] border-0 bg-white shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-md">
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    <img
                      src={item.coverImage || "/images/news-placeholder.jpg"}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-5">
                    <h3 className="line-clamp-2 text-lg font-semibold text-gray-800">{item.title}</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {formatDate((item as any).publishedAt || (item as any).createdAt)}
                    </p>
                    <hr className="my-3 border-gray-200" />
                    <p className="line-clamp-3 text-sm text-gray-600">
                      {item.summary || item.content?.replace(/<[^>]*>/g, "").slice(0, 100) || "暂无摘要"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link href="/news">
              <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white">
                浏览全部资讯
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 7. 联系我们区域 ===== */}
      <section className="bg-gray-50 py-16">
        <div className="container">
          <div className="rounded-2xl bg-white p-8 shadow-lg md:p-12">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">Contact Us</p>
                <h2 className="mt-2 text-3xl font-bold text-gray-800">联系我们</h2>
                <p className="mt-4 text-gray-600">
                  如果您有任何疑问或合作意向，欢迎通过以下方式与我们取得联系。
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-primary/5 p-5">
                  <Building2 className="h-6 w-6 text-primary" />
                  <p className="mt-3 text-sm text-gray-500">地址</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {settings.address || "浙江省绍兴市越城区孙端街道许家桥村7幢1楼"}
                  </p>
                </div>
                <div className="rounded-xl bg-primary/5 p-5">
                  <Phone className="h-6 w-6 text-primary" />
                  <p className="mt-3 text-sm text-gray-500">电话</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {settings.phone || "13567550208"}
                  </p>
                </div>
                <div className="rounded-xl bg-primary/5 p-5">
                  <Newspaper className="h-6 w-6 text-primary" />
                  <p className="mt-3 text-sm text-gray-500">邮箱</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {settings.email || "sxsfjaz@126.com"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}