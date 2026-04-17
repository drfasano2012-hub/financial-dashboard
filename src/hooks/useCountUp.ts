import { useEffect, useRef, useState } from "react";

/**
 * Animates a numeric value from 0 (or `from`) up to `target` over `duration` ms.
 * Uses easeOutCubic for a polished feel. Re-runs whenever `target` changes.
 */
export function useCountUp(target: number, duration = 900, from = 0): number {
  const [value, setValue] = useState(from);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!Number.isFinite(target)) {
      setValue(target);
      return;
    }
    startRef.current = null;
    const startValue = from;
    const delta = target - startValue;

    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(startValue + delta * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}
