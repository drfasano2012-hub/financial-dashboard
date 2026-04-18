import { useMemo } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  TrendingUp, Wallet, Shield, CreditCard, PiggyBank, LineChart,
  ArrowUpRight, ArrowDownRight, RotateCcw, CheckCircle2, AlertCircle, Target, Pencil,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { MetricCard } from "@/components/MetricCard";
import { BenchmarkBadge } from "@/components/BenchmarkBadge";
import { HealthScoreCard } from "@/components/HealthScoreCard";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFinancialStore } from "@/store/financialStore";
import { calculateMetrics, formatCurrency, formatPercent } from "@/lib/calculations";
import {
  savingsRateBenchmark, emergencyFundBenchmark, debtBenchmark,
  netWorthBenchmark, surplusBenchmark, investingReadinessBenchmark,
} from "@/lib/benchmarks";
import { calculateHealthScore } from "@/lib/healthScore";
import { generateRecommendations } from "@/lib/recommendations";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const inputs = useFinancialStore((s) => s.inputs);
  const reset = useFinancialStore((s) => s.reset);
  const navigate = useNavigate();

  const result = useMemo(() => {
    if (!inputs) return null;
    const metrics = calculateMetrics(inputs);
    return {
      metrics,
      healthScore: calculateHealthScore(metrics),
      benchmarks: {
        savings: savingsRateBenchmark(metrics.savingsRate),
        emergency: emergencyFundBenchmark(metrics.emergencyFundMonths),
        debt: debtBenchmark(metrics.weightedDebtRate, metrics.totalDebt),
        netWorth: netWorthBenchmark(metrics.netWorth),
        surplus: surplusBenchmark(metrics.monthlySurplus),
        investing: investingReadinessBenchmark(metrics),
      },
      recommendations: generateRecommendations(inputs, metrics),
    };
  }, [inputs]);

  if (!inputs || !result) return <Navigate to="/checkup" replace />;

  const { metrics, benchmarks, recommendations, healthScore } = result;
  const spendingPct = inputs.monthlyTakeHome > 0 ? (inputs.monthlySpending / inputs.monthlyTakeHome) * 100 : 0;

  const handleReset = () => {
    reset();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">Your Financial Health</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">A clear view of where you are — and what to do next.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/checkup"><Pencil className="h-4 w-4" /> Edit answers</Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost">
                  <RotateCcw className="h-4 w-4" /> Start over
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all your data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will erase your saved inputs and return you to the start. This can't be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>Yes, start over</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Overall health score */}
        <div className="mb-10 animate-fade-in">
          <HealthScoreCard score={healthScore} />
        </div>

        {/* A. Snapshot — 4 cards */}
        <SectionTitle eyebrow="A · Financial Snapshot" title="The four numbers that matter" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <MetricCard icon={PiggyBank} label="Savings rate" benchmark={benchmarks.savings} />
          <MetricCard icon={Wallet} label="Monthly surplus" benchmark={benchmarks.surplus} />
          <MetricCard icon={Shield} label="Emergency fund" benchmark={benchmarks.emergency} />
          <MetricCard icon={TrendingUp} label="Net worth" benchmark={benchmarks.netWorth} />
        </div>

        {/* Pointer to Tools */}
        <div className="mb-12 rounded-xl border border-accent/20 bg-accent-soft/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Want to model different scenarios?</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Use the calculators in Tools to project savings, compound growth, and your Coast FIRE number.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/tools">Open Tools →</Link>
          </Button>
        </div>

        {/* B + C grid */}
        <div className="grid lg:grid-cols-2 gap-4 mb-12">
          {/* Cash flow */}
          <Card title="Cash Flow" eyebrow="B · Income vs spending" icon={Wallet}>
            <div className="space-y-5">
              <FlowRow label="Monthly take-home" value={inputs.monthlyTakeHome} positive />
              <FlowRow label="Monthly spending" value={-inputs.monthlySpending} />
              <div className="border-t border-border pt-4">
                <FlowRow
                  label={metrics.monthlySurplus >= 0 ? "Surplus" : "Deficit"}
                  value={metrics.monthlySurplus}
                  bold
                  positive={metrics.monthlySurplus >= 0}
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Spending vs income</span>
                  <span>{spendingPct.toFixed(0)}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      spendingPct > 100 ? "bg-destructive" : spendingPct > 85 ? "bg-warning" : "bg-success",
                    )}
                    style={{ width: `${Math.min(spendingPct, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Debt overview */}
          <Card title="Debt Overview" eyebrow="C · Liabilities" icon={CreditCard}>
            {inputs.debts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-success mb-2" />
                <p className="font-semibold text-foreground">No debt — well done.</p>
                <p className="text-sm text-muted-foreground">You have full flexibility to invest.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Total balance</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(metrics.totalDebt)}</p>
                  </div>
                  <BenchmarkBadge benchmark={benchmarks.debt} />
                </div>
                <p className="text-xs text-muted-foreground">Weighted avg rate: <span className="font-semibold text-foreground">{formatPercent(metrics.weightedDebtRate)}</span></p>
                <div className="space-y-2 mt-4">
                  {[...inputs.debts].sort((a,b)=>b.rate-a.rate).map((d) => {
                    const high = d.rate > 10;
                    return (
                      <div key={d.id} className={cn(
                        "flex items-center justify-between p-3 rounded-md border",
                        high ? "bg-destructive-soft border-destructive/20" : "bg-secondary border-border",
                      )}>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{d.name || "Unnamed debt"}</p>
                          <p className="text-xs text-muted-foreground">{d.rate}% APR {high && "· high interest"}</p>
                        </div>
                        <p className="font-semibold text-sm text-foreground">{formatCurrency(d.balance)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          {/* Savings & liquidity */}
          <Card title="Savings & Liquidity" eyebrow="D · Cash buffer" icon={Shield}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Cash on hand</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(inputs.cashSavings)}</p>
                </div>
                <BenchmarkBadge benchmark={benchmarks.emergency} />
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Months of expenses covered</span>
                  <span className="font-semibold text-foreground">{metrics.emergencyFundMonths.toFixed(1)} / 6</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      metrics.emergencyFundMonths >= 3 ? "bg-success" : metrics.emergencyFundMonths >= 1 ? "bg-warning" : "bg-destructive",
                    )}
                    style={{ width: `${Math.min((metrics.emergencyFundMonths / 6) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{benchmarks.emergency.explanation}</p>
            </div>
          </Card>

          {/* Investing readiness */}
          <Card title="Investing Overview" eyebrow="E · Readiness" icon={LineChart}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Currently invested</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(inputs.investments)}</p>
                </div>
                <BenchmarkBadge benchmark={benchmarks.investing} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <ReadinessChip active={metrics.emergencyFundMonths >= 3} label="Emergency fund" />
                <ReadinessChip active={metrics.highInterestDebt === 0} label="No high-int. debt" />
                <ReadinessChip active={metrics.monthlySurplus > 0} label="Positive surplus" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{benchmarks.investing.explanation}</p>
              <p className="text-xs text-muted-foreground">Risk profile: <span className="font-semibold text-foreground capitalize">{inputs.riskTolerance}</span></p>
            </div>
          </Card>
        </div>

        {/* Recommendations */}
        <SectionTitle eyebrow="Your action plan" title="What to do next" />
        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-success-soft/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <h3 className="font-semibold text-foreground">What's going well</h3>
            </div>
            <ul className="space-y-2.5">
              {recommendations.goingWell.map((g, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground/80">
                  <span className="text-success mt-0.5">✓</span><span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-warning-soft/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-warning" />
              <h3 className="font-semibold text-foreground">What needs attention</h3>
            </div>
            <ul className="space-y-2.5">
              {recommendations.needsAttention.map((g, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground/80">
                  <span className="text-warning mt-0.5">!</span><span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-foreground">Goals you set</h3>
            </div>
            {inputs.goals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No goals set yet.</p>
            ) : (
              <ul className="space-y-2">
                {inputs.goals.map((g) => (
                  <li key={g.id} className="text-sm text-foreground/80 flex items-center gap-2">
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      g.horizon === "short" ? "bg-info" : g.horizon === "mid" ? "bg-warning" : "bg-accent",
                    )} />
                    {g.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Top 3 actions */}
        <div className="rounded-2xl bg-gradient-hero p-6 md:p-10 text-primary-foreground shadow-lg-soft">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-accent" />
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Priority order</p>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">Your top 3 next actions</h2>
          <div className="space-y-3">
            {recommendations.topActions.map((a, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 backdrop-blur transition-smooth hover:bg-primary-foreground/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base mb-1">{a.title}</p>
                  <p className="text-sm text-primary-foreground/70 leading-relaxed">{a.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-12">
          Educational tool, not financial advice. Re-run your checkup monthly to track progress.
        </p>
      </main>
    </div>
  );
}

// ---------- Small components ----------

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">{eyebrow}</p>
      <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{title}</h2>
    </div>
  );
}

function Card({
  title, eyebrow, icon: Icon, children,
}: { title: string; eyebrow: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-gradient-card p-6 shadow-sm-soft">
      <div className="flex items-center gap-2 mb-1">
        <div className="rounded-md bg-secondary p-1.5 text-primary"><Icon className="h-3.5 w-3.5" /></div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-5">{title}</h3>
      {children}
    </div>
  );
}

function FlowRow({ label, value, positive, bold }: { label: string; value: number; positive?: boolean; bold?: boolean }) {
  const isPositive = positive ?? value >= 0;
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-sm", bold ? "font-semibold text-foreground" : "text-muted-foreground")}>{label}</span>
      <div className={cn("flex items-center gap-1.5", bold ? "text-lg font-bold" : "text-base font-semibold",
        isPositive ? "text-success" : "text-destructive")}>
        {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        {formatCurrency(Math.abs(value))}
      </div>
    </div>
  );
}

function ReadinessChip({ active, label }: { active: boolean; label: string }) {
  return (
    <div className={cn(
      "rounded-md border px-2 py-2 text-center",
      active ? "bg-success-soft border-success/30 text-success" : "bg-secondary border-border text-muted-foreground",
    )}>
      <CheckCircle2 className={cn("h-3.5 w-3.5 mx-auto mb-1", active ? "text-success" : "text-muted-foreground/40")} />
      <p className="text-[10px] font-medium leading-tight">{label}</p>
    </div>
  );
}
