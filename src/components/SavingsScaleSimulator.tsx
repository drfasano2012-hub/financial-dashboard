import { useMemo, useState } from "react";
import { Sliders, TrendingUp, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { CurrencyInput } from "@/components/CurrencyInput";
import { Label } from "@/components/ui/label";
import { useFinancialStore } from "@/store/financialStore";
import { calculateMetrics, formatCurrency } from "@/lib/calculations";

export function SavingsScaleSimulator() {
  const inputs = useFinancialStore((s) => s.inputs);
  const metrics = inputs ? calculateMetrics(inputs) : null;

  const [monthlySpending, setMonthlySpending] = useState(inputs?.monthlySpending ?? 3500);
  const [cashSavings, setCashSavings] = useState(inputs?.cashSavings ?? 5000);
  const [currentSurplus, setCurrentSurplus] = useState(metrics?.monthlySurplus ?? 500);
  const [extra, setExtra] = useState(200);

  const projection = useMemo(() => {
    const targetMonths = 3;
    const targetCash = monthlySpending * targetMonths;
    const gap = Math.max(0, targetCash - cashSavings);
    const monthlyContribution = Math.max(0, currentSurplus) + extra;
    const monthsToTarget =
      monthlyContribution > 0 ? Math.ceil(gap / monthlyContribution) : Infinity;

    const oneYearAdded = extra * 12;
    const fiveYearCompound = extra * 12 * 5 * 1.07;

    return { targetCash, gap, monthsToTarget, oneYearAdded, fiveYearCompound };
  }, [extra, monthlySpending, cashSavings, currentSurplus]);

  const alreadyThere = cashSavings >= monthlySpending * 3;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Inputs */}
      <div className="lg:col-span-2 space-y-5 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="rounded-md bg-secondary p-1.5 text-primary">
            <Sliders className="h-3.5 w-3.5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your starting point
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Monthly spending</Label>
          <CurrencyInput value={monthlySpending} onChange={setMonthlySpending} />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Cash savings today</Label>
          <CurrencyInput value={cashSavings} onChange={setCashSavings} />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Current monthly surplus</Label>
          <CurrencyInput value={currentSurplus} onChange={setCurrentSurplus} />
        </div>

        {inputs && (
          <p className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>Pre-filled from your checkup. Adjust to model different scenarios.</span>
          </p>
        )}
      </div>

      {/* Slider + results */}
      <div className="lg:col-span-3 space-y-5">
        <div className="rounded-xl border border-border bg-gradient-card p-6">
          <div className="flex items-baseline justify-between mb-3">
            <Label className="text-sm text-muted-foreground">Extra saved per month</Label>
            <span className="text-3xl font-bold text-foreground tabular-nums">
              {formatCurrency(extra)}
            </span>
          </div>
          <Slider
            value={[extra]}
            onValueChange={(v) => setExtra(v[0])}
            min={0}
            max={2000}
            step={25}
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
          <Stat label="Saved over 1 year" value={formatCurrency(projection.oneYearAdded)} tone="info" />
          <Stat label="Invested over 5 yr (~7%)" value={formatCurrency(projection.fiveYearCompound)} tone="info" />
        </div>

        <p className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
          <TrendingUp className="h-3.5 w-3.5 mt-0.5 text-accent shrink-0" />
          <span>
            Small, consistent increases compound. Cutting one $50/week expense alone is ~$200/month.
          </span>
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "success" | "warning" | "info" }) {
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
