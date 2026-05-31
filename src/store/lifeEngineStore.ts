import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LifeModel, Decision, SimulationResult } from '@/lib/lifeEngine/types';

interface LifeEngineState {
  model: LifeModel | null;
  lastResult: SimulationResult | null;
  setModel: (model: LifeModel) => void;
  setResult: (result: SimulationResult) => void;
  reset: () => void;
}

export const useLifeEngineStore = create<LifeEngineState>()(
  persist(
    (set) => ({
      model: null,
      lastResult: null,
      setModel: (model) => set({ model }),
      setResult: (result) => set({ lastResult: result }),
      reset: () => set({ model: null, lastResult: null }),
    }),
    { name: 'life-engine-v1' },
  ),
);
