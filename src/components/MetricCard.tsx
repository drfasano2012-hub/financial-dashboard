import { Benchmark } from "@/lib/types";
import { BenchmarkBadge } from "./BenchmarkBadge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  benchmark: Benchmark;
  className?: string;
}

/**
 * Renders an animated version of benchmark.display by counting `benchmark.value`
 * up to its target and re-applying the same prefix/suffix the static display used.
 */
function useAnimatedDisplay(value: number, display: string): string {
  const animated = useCountUp(value, 1000);

  // Money like "$48,200" or "-$48,200" or "$1,200/mo"
  const moneyMatch = display.match(/^(-?)\$([\d,]+(?:\.\d+)?)(.*)$/);
  if (moneyMatch) {
    const [, sign, , suffix] = moneyMatch;
    const abs = Math.abs(animated);
    const formatted = abs.toLocaleString("en-US", { maximumFractionDigits: 0 });
    return `${sign}$${formatted}${suffix}`;
  }

  // Percent like "18.0%"
  const pctMatch = display.match(/^(-?\d+(?:\.\d+)?)%$/);
  if (pctMatch) {
    return `${animated.toFixed(1)}%`;
  }

  // "4.2 mo"
  const moMatch = display.match(/^(-?\d+(?:\.\d+)?)\s*mo$/);
  if (moMatch) {
    return `${animated.toFixed(1)} mo`;
  }

  // Fallback: leave as-is (e.g. "Strong", "Debt-free").
  return display;
}

export function MetricCard({ icon: Icon, label, benchmark, className }: MetricCardProps) {
  const animatedDisplay = useAnimatedDisplay(benchmark.value, benchmark.display);

  return (
    <div
      className={cn(
        "group relative rounded-lg border border-border bg-gradient-card p-6 shadow-sm-soft transition-smooth hover:shadow-md-soft hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-secondary p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <BenchmarkBadge benchmark={benchmark} />
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {animatedDisplay}
        </p>
        <p className="text-xs text-muted-foreground font-medium">{benchmark.range}</p>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground border-t border-border pt-3">
        {benchmark.explanation}
      </p>
    </div>
  );
}
