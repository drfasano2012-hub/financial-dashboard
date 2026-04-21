import { ReactNode } from "react";

// Auth temporarily disabled for testing — all routes are open.
// To re-enable, restore the previous version that checked `useAuth()`
// and redirected unauthenticated users to /auth.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
