import { useLocation } from "react-router-dom";
import { Bell, Search, Menu } from "lucide-react";
import { useEffect, useState } from "react";

const pageTitles: Record<string, string> = {
  "/": "Ana Səhifə",
  "/workers": "İşçilər",
  "/attendance": "Davamiyyət",
  "/reports": "Hesabatlar",
};

export function AppHeader() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "ShiftCore";
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (d: Date) => {
    const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${d.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-6 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2 rounded-lg hover:bg-card">
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground hidden sm:block">{formatDate(time)}</span>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Axtar..."
            className="h-9 w-48 rounded-lg bg-card border border-border pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-ring"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-card">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
        </button>
      </div>
    </header>
  );
}
