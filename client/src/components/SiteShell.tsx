import { Button } from "@/components/ui/button";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { Menu, Phone, X } from "lucide-react";
import { PropsWithChildren, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";

const navItems = [
  { label: "首页", path: "/" },
  { label: "产品中心", path: "/products" },
  { label: "产品应用", path: "/applications" },
  { label: "新闻资讯", path: "/news" },
  { label: "关于我们", path: "/about" },
  { label: "后台管理", path: "/admin" },
];

export function SiteShell({ children }: PropsWithChildren) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { settings } = useCompanySettings();
  
  const currentLabel = useMemo(
    () => navItems.find(item => item.path === location)?.label ?? "顺丰聚氨酯",
    [location],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
        <div className="container flex h-18 items-center justify-between gap-6 py-3">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-sky-200 shadow-lg shadow-sky-200/70">
              <img 
                src="/images/logo.png" 
                alt="Shunfeng Logo" 
                className="h-10 w-10 object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold tracking-[0.18em] text-slate-900">顺丰聚氨酯</p>
              <p className="truncate text-xs uppercase tracking-[0.36em] text-sky-700">SHUN FENG POLYURETHANE</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map(item => {
              const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? "bg-sky-600 text-white shadow-md shadow-sky-200" : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Phone className="h-4 w-4 text-sky-700" />
              <span>{settings.phone || "13567550208"}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="border-sky-200 bg-white lg:hidden"
            onClick={() => setMenuOpen(current => !current)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        {menuOpen ? (
          <div className="border-t border-blue-100 bg-white lg:hidden">
            <div className="container flex flex-col gap-2 py-4">
              <p className="text-xs uppercase tracking-[0.28em] text-sky-700">当前页面 · {currentLabel}</p>
              {navItems.map(item => {
                const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive ? "bg-sky-600 text-white" : "bg-slate-50 text-slate-700"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </header>

      <main>{children}</main>

      <footer className="relative overflow-hidden bg-linear-to-r from-slate-100 via-slate-200 to-slate-300 text-slate-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.1),transparent_35%)]" />
        <div className="container relative grid gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Chengsheng Polyurethane</p>
            <h2 className="max-w-md text-3xl font-semibold leading-tight">绍兴市顺丰聚氨酯有限公司</h2>
            <p className="max-w-xl text-sm leading-7 text-sky-700/80">
              硬质聚氨酯泡沫塑料产品的研制、开发、生产、进出口贸易为一体的现代化企业。
            </p>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">公司信息</p>
            <div className="space-y-3 text-sm text-slate-600">
              <p>地址：{settings.address || "浙江省绍兴市越城区孙端街道许家桥村7幢1楼"}</p>
              <p>电话：{settings.phone || "13567550208"}</p>
              <p>邮箱：{settings.email || "sxsfjaz@126.com"}</p>
            </div>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">快速导航</p>
            <div className="space-y-3 text-sm text-slate-600">
              <Link href="/products" className="block transition hover:text-sky-700">产品中心</Link>
              <Link href="/applications" className="block transition hover:text-sky-700">产品应用</Link>
              <Link href="/news" className="block transition hover:text-sky-700">新闻资讯</Link>
              <Link href="/about" className="block transition hover:text-sky-700">关于我们</Link>
            </div>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">后台入口</p>
            <div className="space-y-3 text-sm text-slate-600">
              <p>支持登录校验、角色管理与内容发布。</p>
              <Link href="/admin" className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-100">
                进入后台管理
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-linear-to-r from-slate-100 via-slate-200 to-slate-300 py-4 text-sm text-slate-600">
          <div className="flex justify-between items-center max-w-6xl mx-auto px-4">
            <p>版权所有 © 绍兴市顺丰聚氨酯有限公司</p>
            <p>浙ICP备2026019323号-1</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-700">{eyebrow}</p>
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-slate-950 sm:text-4xl">{title}</h2>
        {description ? <p className="max-w-3xl text-base leading-8 text-slate-600">{description}</p> : null}
      </div>
    </div>
  );
}
