import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminPage from "./pages/AdminPage";
import { AboutPage, ApplicationsPage, NewsDetailPage, NewsPage, ProductDetailPage, ProductsPage } from "./pages/SitePages";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:slug">{params => <ProductDetailPage params={params as { slug: string }} />}</Route>
      <Route path="/applications" component={ApplicationsPage} />
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
