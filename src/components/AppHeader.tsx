import { Menu, TrendingUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV = [
  { to: "/checkup", label: "Checkup" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/history", label: "History" },
  { to: "/tools", label: "Tools" },
  { to: "/learn", label: "Learn" },
];

export function AppHeader() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-foreground shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-accent text-accent-foreground">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="text-base tracking-tight whitespace-nowrap">
            Freedom<span className="text-accent">ly</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3 min-w-0">
          <nav className="flex items-center gap-0.5 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "px-3 py-2 rounded-md transition-smooth whitespace-nowrap",
                  isActive(item.to)
                    ? "text-foreground bg-secondary font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary text-foreground hover:border-accent transition-smooth"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">
                  Freedom<span className="text-accent">ly</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-3 py-3 rounded-md text-base transition-smooth",
                      isActive(item.to)
                        ? "text-foreground bg-secondary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
