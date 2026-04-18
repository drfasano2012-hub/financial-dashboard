import { TrendingUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/checkup", label: "Checkup" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/tools", label: "Tools" },
  { to: "/learn", label: "Learn" },
];

export function AppHeader() {
  const { pathname } = useLocation();
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-foreground shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-accent text-accent-foreground">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="text-base tracking-tight whitespace-nowrap">
            Financial Health <span className="text-accent">OS</span>
          </span>
        </Link>
        <nav className="flex items-center gap-0.5 text-sm overflow-x-auto -mx-2 px-2">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "px-3 py-2 rounded-md transition-smooth whitespace-nowrap",
                  active
                    ? "text-foreground bg-secondary font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
