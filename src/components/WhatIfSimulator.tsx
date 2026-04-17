import { useMemo, useState } from "react";
import { Sliders, TrendingUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/calculations";
import { Metrics } from "@/lib/types";

interface WhatIfSimulatorProps {
  monthlySpending: number;
  cashSavings: number;
  currentSurplus: number;
  metrics: Metrics;
}

export function WhatIfSimulator({
  monthlySpending,
  cashSavings,
  currentSurplus,
  metrics,
}: WhatIfSimulatorProps) {
  // Extra savings per month above current surplus.
  const [extra, setExtra] = useState(200);

  const projection = useMemo(() => {
    const targetMonths = 3;
    const targetCash = monthlySpending * targetMonths;
    const gap = Math.max(0, targetCash - cashSavings);
    const monthlyContribution = Math.max(0, currentSurplus) + extra;
    const monthsToTarget =
      monthlyContribution > 0 ? Math.ceil(gap / monthlyContribution) : Infinity;

    const oneYearAdded = extra * 12;
    const fiveYearCompound = extra * 12 * 5 * 1.07; // rough 7% annualized blended

    return { targetCash, gap, monthsToTarget, oneYearAdded, fiveYearCompound };
  }, [extra, monthlySpending, cashSavings, currentSurplus]);

  const alreadyThere = metrics.emergencyFundMonths >= 3;

  return (
    <div className="rounded-xl border border-border bg-gradient-card p-6 shadow-sm-soft">
      <div className="flex items-center gap-2 mb-1">
        <div className="rounded-md bg-secondary p-1.5 text-primary">
          <Sliders className="h-3.5 w-3.5" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          What if · Simulator
        </p>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-5">
        See the impact of saving more
      </h3>

      <div className="space-y-5">
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <label className="text-sm text-muted-foreground">Extra saved per month</label>
            <span className="text-2xl font-bold text-foreground tabular-nums">
              {formatCurrency(extra)}
            </span>
          </div>
          <Slider
            value={[extra]}
            onValueChange={(v) => setExtra(v[0])}
            min={0}
            max={2000}
            step={25}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
            <span>$0</span>
            <span>$1,000</span>
            <span>$2,000</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Stat
            label="3-month emergency fund in"
            value={
              alreadyThere
                ? "Done ✓"
                : projection.monthsToTarget === Infinity
                ? "Never at this rate"
                : `${projection.monthsToTarget} mo`
            }
            tone={alreadyThere || projection.monthsToTarget < 24 ? "success" : "warning"}
          />
          <Stat
            label="Saved over 1 year"
            value={formatCurrency(projection.oneYearAdded)}
            tone="info"
          />
          <Stat
            label="Invested over 5 yr (~7%)"
            value={formatCurrency(projection.fiveYearCompound)}
            tone="info"
          />
        </div>

        <p className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
          <TrendingUp className="h-3.5 w-3.5 mt-0.5 text-accent shrink-0" />
          <span>
            Small, consistent increases compound. Try cutting one $50/week expense — that alone is
            ~$200/month.
          </span>
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "warning" | "info";
}) {
  const toneClass =
    tone === "success"
      ? "bg-success-soft text-success border-success/20"
      : tone === "warning"
      ? "bg-warning-soft text-warning border-warning/20"
      : "bg-secondary text-foreground border-border";

  return (
    <div className={`rounded-lg border p-3 ${toneClass}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-base font-bold mt-1 tabular-nums">{value}</p>
    </div>
  );
}
