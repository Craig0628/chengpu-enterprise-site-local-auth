import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoginScreen } from "@/components/LoginForm";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { BarChart3, LogOut, ShieldCheck } from "lucide-react";
import { ReactNode } from "react";

export type DashboardMenuItem = {
  key: string;
  label: string;
  icon: ReactNode;
};

export default function DashboardLayout({
  title,
  description,
  menuItems,
  activeKey,
  onSelect,
  children,
}: {
  title: string;
  description: string;
  menuItems: DashboardMenuItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  children: ReactNode;
}) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  if (!user) {
    return (
      <LoginScreen
        onLoginSuccess={() => {
          // Refresh user info after login
          window.location.href = "/admin";
        }}
      />
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-200 px-5 py-6">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-sky-600 to-blue-900 text-white shadow-lg shadow-sky-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Admin Panel</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-3 py-4">
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={activeKey === item.key}
                    onClick={() => onSelect(item.key)}
                    className="h-11 rounded-xl px-4 text-sm"
                    tooltip={item.label}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-slate-200 p-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border border-slate-200">
                  <AvatarFallback className="bg-sky-100 text-sky-700">{user.name?.slice(0, 1) || "U"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">{user.name || "未命名用户"}</p>
                  <p className="truncate text-xs text-slate-500">{user.email || "暂无邮箱"}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2"><BarChart3 className="h-4 w-4 text-sky-700" /> 当前角色</span>
                <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">{user.role}</span>
              </div>
              <Button variant="outline" className="mt-4 w-full rounded-xl border-slate-200 bg-white" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> 退出登录
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <main className="min-h-screen p-4 lg:p-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
