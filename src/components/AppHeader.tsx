import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

export function AppHeader() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-accent text-accent-foreground">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="text-base tracking-tight">Financial Health <span className="text-accent">OS</span></span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link to="/checkup" className="px-3 py-2 text-muted-foreground hover:text-foreground transition-smooth">
            Checkup
          </Link>
          <Link to="/dashboard" className="px-3 py-2 text-muted-foreground hover:text-foreground transition-smooth">
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
