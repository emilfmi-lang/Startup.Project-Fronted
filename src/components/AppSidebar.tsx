import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, ClipboardList, BarChart3, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Ana Səhifə", path: "/", icon: Home },
  { label: "İşçilər", path: "/workers", icon: Users },
  { label: "Davamiyyət", path: "/attendance", icon: ClipboardList },
  { label: "Hesabatlar", path: "/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-50 md:hidden rounded-lg bg-card p-2 border border-border"
      >
        {collapsed ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300",
          "w-[260px]",
          collapsed ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:relative"
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">SC</span>
          </div>
          <div>
            <h1 className="text-foreground font-semibold text-lg tracking-tight">ShiftCore</h1>
            <p className="text-xs text-muted-foreground">Davamiyyət Sistemi</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setCollapsed(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs font-semibold">A</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Admin</p>
              <p className="text-xs text-muted-foreground">Sistem admini</p>
            </div>
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {collapsed && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}
    </>
  );
}
