import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialStore } from "@/store/financialStore";

/**
 * Bridges auth state to the financial store:
 *  - On sign-in, load checkup from cloud (or push local data up if cloud is empty).
 *  - On sign-out, clear in-memory checkup so the next user doesn't see it.
 */
export function AuthSync() {
  const { user, loading } = useAuth();
  const lastUserId = useRef<string | null>(null);
  const loadFromCloud = useFinancialStore((s) => s.loadFromCloud);
  const clearLocal = useFinancialStore((s) => s.clearLocal);

  useEffect(() => {
    if (loading) return;

    if (user && user.id !== lastUserId.current) {
      lastUserId.current = user.id;
      loadFromCloud(user.id);
    } else if (!user && lastUserId.current) {
      lastUserId.current = null;
      clearLocal();
    }
  }, [user, loading, loadFromCloud, clearLocal]);

  return null;
}
