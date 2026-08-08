import { createFileRoute, Link, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard, HandMetal, UserCheck, ShieldPlus,
  LogOut, Menu, X, ChevronRight, Stethoscope,
} from "lucide-react";
import { checkSession, logout, type AdminUser } from "@/lib/admin-api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Panel | Monitoring Kepatuhan Klinis" }],
  }),
  beforeLoad: async () => {
    try {
      const res = await checkSession();
      return { adminUser: res.user };
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminLayout,
});

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/kkt", label: "Data KKT", icon: HandMetal },
  { to: "/admin/identifikasi", label: "Data Identifikasi", icon: UserCheck },
  { to: "/admin/apd", label: "Data APD", icon: ShieldPlus },
] as const;

function AdminLayout() {
  const { adminUser } = Route.useRouteContext() as { adminUser: AdminUser };
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout berhasil.");
      router.navigate({ to: "/login" });
    } catch {
      toast.error("Gagal logout.");
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — Desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <SidebarContent user={adminUser} onLogout={handleLogout} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 flex w-72 flex-col bg-card shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent user={adminUser} onLogout={handleLogout} onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar — mobile */}
        <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold text-foreground">Admin Panel</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  user,
  onLogout,
  onNavigate,
}: {
  user: AdminUser;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      {/* Brand */}
      <div className="border-b border-border p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-hero text-white">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">Admin Panel</p>
            <p className="truncate text-xs text-muted-foreground">Kepatuhan Klinis</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            activeOptions={{ exact: "exact" in item ? item.exact : false }}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            <span className="flex-1">{item.label}</span>
            <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {user.nama.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{user.nama}</p>
            <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </div>
    </>
  );
}
