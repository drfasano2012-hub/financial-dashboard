import { useMemo, useState } from "react";
import { TrendingUp, LineChart as LineChartIcon } from "lucide-react";
import {
  Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { CurrencyInput } from "@/components/CurrencyInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/calculations";

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(20);

  const { data, finalBalance, totalContributed, totalGrowth } = useMemo(() => {
    const r = rate / 100 / 12;
    const months = years * 12;
    const series: { year: number; balance: number; contributed: number }[] = [];
    let balance = principal;
    let contributed = principal;
    series.push({ year: 0, balance, contributed });
    for (let m = 1; m <= months; m++) {
      balance = balance * (1 + r) + monthly;
      contributed += monthly;
      if (m % 12 === 0) {
        series.push({
          year: m / 12,
          balance: Math.round(balance),
          contributed: Math.round(contributed),
        });
      }
    }
    return {
      data: series,
      finalBalance: Math.round(balance),
      totalContributed: Math.round(contributed),
      totalGrowth: Math.round(balance - contributed),
    };
  }, [principal, monthly, rate, years]);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Inputs */}
      <div className="lg:col-span-2 space-y-5 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="rounded-md bg-secondary p-1.5 text-primary">
            <LineChartIcon className="h-3.5 w-3.5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Inputs
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Starting amount</Label>
          <CurrencyInput value={principal} onChange={setPrincipal} />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Monthly contribution</Label>
          <CurrencyInput value={monthly} onChange={setMonthly} />
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <Label className="text-sm font-medium">Annual return</Label>
            <span className="text-base font-bold text-foreground tabular-nums">
              {rate.toFixed(1)}%
            </span>
          </div>
          <Slider
            value={[rate]}
            onValueChange={(v) => setRate(v[0])}
            min={0}
            max={15}
            step={0.5}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span>S&amp;P avg ~10%</span>
            <span>15%</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <Label className="text-sm font-medium">Years</Label>
            <span className="text-base font-bold text-foreground tabular-nums">{years}</span>
          </div>
          <Slider
            value={[years]}
            onValueChange={(v) => setYears(v[0])}
            min={1}
            max={50}
            step={1}
          />
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-3 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <ResultStat label="Final balance" value={formatCurrency(finalBalance)} tone="success" />
          <ResultStat label="You contributed" value={formatCurrency(totalContributed)} tone="info" />
          <ResultStat label="Investment growth" value={formatCurrency(totalGrowth)} tone="accent" />
        </div>

        <div className="rounded-xl border border-border bg-gradient-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-accent" />
            <p className="text-sm font-semibold text-foreground">Growth over time</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  label={{ value: "Years", position: "insideBottom", offset: -2, fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Line
                  type="monotone"
                  dataKey="contributed"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Contributed"
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2.5}
                  dot={false}
                  name="Balance"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultStat({ label, value, tone }: { label: string; value: string; tone: "success" | "info" | "accent" }) {
  const toneClass =
    tone === "success"
      ? "bg-success-soft text-success border-success/20"
      : tone === "accent"
      ? "bg-accent-soft text-accent border-accent/20"
      : "bg-secondary text-foreground border-border";
  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-lg md:text-xl font-bold mt-1 tabular-nums">{value}</p>
    </div>
  );
}
