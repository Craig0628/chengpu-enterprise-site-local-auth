/**
 * 文件名：App.tsx
 * 文件描述：主应用组件
 * 功能：定义应用的路由结构、主题提供者、全局错误边界
 * 包含的路由：
 *   - 官网路由：首页、产品、新闻、关于、应用等
 *   - 后台路由：/admin 管理员面板
 * 调用方式：作为 React 应用的入口组件
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminPage from "./pages/AdminPage";
import { AboutPage, ApplicationsPage, HonorPage, NewsDetailPage, NewsPage, ProductDetailPage, ProductsPage, ResearchPage } from "./pages/SitePages";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:slug">{params => <ProductDetailPage params={params as { slug: string }} />}</Route>
      <Route path="/applications" component={ApplicationsPage} />
      <Route path="/honor" component={HonorPage} />
      <Route path="/workshop" component={ResearchPage} />
      <Route path="/news" component={NewsPage} />
      <Route path="/news/:slug">{params => <NewsDetailPage params={params as { slug: string }} />}</Route>
      <Route path="/about" component={AboutPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
