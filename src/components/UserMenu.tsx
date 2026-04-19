import { LogOut, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Button asChild size="sm" variant="accent">
        <a href="/auth">Sign in</a>
      </Button>
    );
  }

  const initial =
    (user.user_metadata?.name as string | undefined)?.[0]?.toUpperCase() ??
    user.email?.[0]?.toUpperCase() ??
    "?";
  const display =
    (user.user_metadata?.name as string | undefined) ?? user.email ?? "Account";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-sm font-semibold text-foreground hover:border-accent transition-smooth overflow-hidden"
          aria-label="Account menu"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="text-sm font-medium text-foreground truncate">{display}</p>
          {user.email && (
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
          <UserIcon className="h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
