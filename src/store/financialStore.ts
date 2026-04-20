import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FinancialInputs } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { calculateMetrics } from "@/lib/calculations";
import { calculateHealthScore } from "@/lib/healthScore";

async function recordSnapshot(userId: string, inputs: FinancialInputs) {
  const metrics = calculateMetrics(inputs);
  const health = calculateHealthScore(metrics);
  const { error } = await supabase.from("financial_snapshots").insert({
    user_id: userId,
    inputs: inputs as never,
    net_worth: metrics.netWorth,
    savings_rate: metrics.savingsRate,
    health_score: health.score,
    cash_savings: inputs.cashSavings,
    total_investments: metrics.totalInvestments,
    total_debt: metrics.totalDebt,
    monthly_take_home: inputs.monthlyTakeHome,
  });
  if (error) console.error("Snapshot insert failed:", error);
}

interface FinancialState {
  inputs: FinancialInputs | null;
  hydrated: boolean;
  setInputs: (inputs: FinancialInputs) => Promise<void>;
  reset: () => Promise<void>;
  loadFromCloud: (userId: string) => Promise<void>;
  clearLocal: () => void;
}

export const useFinancialStore = create<FinancialState>()(
  persist(
    (set, get) => ({
      inputs: null,
      hydrated: false,

      setInputs: async (inputs) => {
        set({ inputs });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from("financial_checkups")
            .upsert(
              { user_id: user.id, inputs: inputs as never },
              { onConflict: "user_id" },
            );
          if (error) console.error("Cloud sync failed:", error);
          // Append a historical snapshot every time the user saves their checkup.
          await recordSnapshot(user.id, inputs);
        }
      },

      reset: async () => {
        set({ inputs: null });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("financial_checkups").delete().eq("user_id", user.id);
        }
      },

      loadFromCloud: async (userId: string) => {
        const { data, error } = await supabase
          .from("financial_checkups")
          .select("inputs")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          console.error("Failed to load checkup:", error);
          set({ hydrated: true });
          return;
        }

        if (data?.inputs) {
          // Cloud wins
          set({ inputs: data.inputs as unknown as FinancialInputs, hydrated: true });
        } else {
          // No cloud data — if we have local from a guest session, push it up
          const local = get().inputs;
          if (local) {
            await supabase
              .from("financial_checkups")
              .upsert(
                { user_id: userId, inputs: local as never },
                { onConflict: "user_id" },
              );
            await recordSnapshot(userId, local);
          }
          set({ hydrated: true });
        }
      },

      clearLocal: () => set({ inputs: null, hydrated: false }),
    }),
    { name: "financial-health-os", partialize: (s) => ({ inputs: s.inputs }) },
  ),
);
