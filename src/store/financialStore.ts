import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FinancialInputs } from "@/lib/types";

interface FinancialState {
  inputs: FinancialInputs | null;
  setInputs: (inputs: FinancialInputs) => void;
  reset: () => void;
}

export const useFinancialStore = create<FinancialState>()(
  persist(
    (set) => ({
      inputs: null,
      setInputs: (inputs) => set({ inputs }),
      reset: () => set({ inputs: null }),
    }),
    { name: "financial-health-os" },
  ),
);
