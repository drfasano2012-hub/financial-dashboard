import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft, RotateCcw, TrendingUp, TrendingDown, Minus,
  DollarSign, Clock, AlertTriangle, Lightbulb, ChevronDown, ChevronUp,
  Home, Briefcase, Baby, PiggyBank,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/AppHeader';
import { cn } from '@/lib/utils';
import { useLifeEngineStore } from '@/store/lifeEngineStore';
import type { TimelineScenario } from '@/lib/lifeEngine/types';

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(Math.round(n / 100) / 10).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}

function fmtAge(a: number | null): string {
  return a === null ? '50+ yrs' : `Age ${Math.round(a)}`;
}

const DECISION_ICONS = {
  buy_home: Home,
  change_jobs: Briefcase,
  have_child: Baby,
  change_savings_rate: PiggyBank,
};

function ScenarioCard({
  label,
  scenario,
  highlight,
  tone,
  growth,
}: {
  label: string;
  scenario: TimelineScenario;
  highlight?: boolean;
  tone: 'success' | 'warning' | 'neutral';
  growth: string;
}) {
  const toneMap = {
    success: { border: 'border-success/30', bg: 'bg-success-soft/50', badge: 'bg-success text-white' },
    warning: { border: 'border-warning/30', bg: 'bg-warning-soft/50', badge: 'bg-warning text-white' },
    neutral: { border: 'border-border', bg: 'bg-card', badge: 'bg-secondary text-foreground' },
  };
  const t = toneMap[tone];

  return (
    <div className={cn('rounded-xl border p-4 md:p-5 flex flex-col gap-3', t.border, t.bg, highlight && 'shadow-md-soft')}>
      <div className="flex items-center justify-between">
        <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', t.badge)}>
          {label}
        </span>
        <span className="text-[10px] text-muted-foreground">{growth} returns</span>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Freedom age</p>
        <p className="text-2xl font-bold text-foreground tabular-nums">{fmtAge(scenario.freedom_age)}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-[10px] text-muted-foreground">Years away</p>
          <p className="font-semibold text-foreground">
            {scenario.years_to_freedom === null ? '50+' : scenario.years_to_freedom < 0.5 ? '<1' : scenario.years_to_freedom.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Net worth 10yr</p>
          <p className="font-semibold text-foreground">{fmt(scenario.net_worth_10yr)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] text-muted-foreground">Monthly net</p>
          <p className={cn('font-semibold', scenario.monthly_net >= 0 ? 'text-success' : 'text-destructive')}>
            {scenario.monthly_net >= 0 ? '+' : ''}{fmt(scenario.monthly_net)}/mo
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LifeEngineResults() {
  const { lastResult, model } = useLifeEngineStore();
  const [showFull, setShowFull] = useState(false);

  if (!lastResult || !model) return <Navigate to="/life-engine/dashboard" replace />;

  const { decision, baseline, base_case, best_case, worst_case, delta_years, tradeoffs, explanation, recommendation } = lastResult;

  const DecisionIcon = DECISION_ICONS[decision.type];

  const isPositive = delta_years !== null && delta_years > 0.4;
  const isNegative = delta_years !== null && delta_years < -0.4;
  const isNeutral = !isPositive && !isNegative;

  const impactLabel = isPositive
    ? `${delta_years!.toFixed(1)} years faster`
    : isNegative
    ? `${Math.abs(delta_years!).toFixed(1)} years slower`
    : 'Minimal impact';

  const impactColor = isPositive
    ? 'text-success'
    : isNegative
    ? 'text-destructive'
    : 'text-muted-foreground';

  const ImpactIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  const baselineAgeStr = fmtAge(baseline.freedom_age);
  const afterAgeStr = fmtAge(base_case.freedom_age);

  const [explanationPara1, explanationPara2] = explanation.split('\n\n');

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container max-w-2xl py-8 md:py-12">

        {/* Back nav */}
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
          <Link to="/life-engine/simulate"><ArrowLeft className="h-4 w-4" /> Back to decisions</Link>
        </Button>

        {/* Decision label */}
        <div className="flex items-center gap-2 mb-6 animate-fade-in">
          <div className="rounded-lg bg-secondary p-2">
            <DecisionIcon className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Simulation result</p>
            <p className="font-semibold text-foreground">{decision.label}</p>
          </div>
        </div>

        {/* Hero impact banner */}
        <div className={cn(
          'rounded-2xl p-6 md:p-8 mb-6 shadow-md-soft animate-fade-in',
          isPositive ? 'bg-success-soft border border-success/20' :
          isNegative ? 'bg-destructive-soft border border-destructive/20' :
          'bg-secondary border border-border',
        )}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Freedom timeline impact
          </p>
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <p className="text-sm text-muted-foreground">Before</p>
              <p className="text-3xl font-bold text-foreground tabular-nums">{baselineAgeStr}</p>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-sm', impactColor,
                isPositive ? 'bg-success/10' : isNegative ? 'bg-destructive/10' : 'bg-secondary')}>
                <ImpactIcon className="h-4 w-4" />
                {impactLabel}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">After</p>
              <p className="text-3xl font-bold text-foreground tabular-nums">{afterAgeStr}</p>
            </div>
          </div>

          {delta_years !== null && Math.abs(delta_years) >= 0.4 && (
            <p className={cn('mt-3 text-sm font-medium leading-relaxed', impactColor)}>
              {isPositive
                ? `This decision moves you ${delta_years.toFixed(1)} years closer to financial freedom.`
                : `This decision pushes your freedom age back by ${Math.abs(delta_years).toFixed(1)} years.`}
            </p>
          )}
          {isNeutral && (
            <p className="mt-3 text-sm text-muted-foreground">
              This decision has minimal impact on your freedom timeline.
            </p>
          )}
        </div>

        {/* Scenarios */}
        <div className="mb-6 animate-fade-in">
          <h2 className="text-base font-semibold text-foreground mb-3">Scenario range</h2>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <ScenarioCard label="Worst" scenario={worst_case} tone="warning" growth="4%" />
            <ScenarioCard label="Base" scenario={base_case} highlight tone="neutral" growth="6%" />
            <ScenarioCard label="Best" scenario={best_case} tone="success" growth="8%" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Best/worst vary ±15% monthly surplus and investment returns of 8%/4%.
          </p>
        </div>

        {/* Tradeoffs */}
        <div className="mb-6 animate-fade-in">
          <h2 className="text-base font-semibold text-foreground mb-3">Trade-offs at a glance</h2>
          <div className="space-y-2">
            <TradeoffRow icon={DollarSign} label="Money" value={tradeoffs.money} />
            <TradeoffRow icon={Clock} label="Time" value={tradeoffs.time} />
            <TradeoffRow icon={AlertTriangle} label="Risk" value={tradeoffs.risk} />
          </div>
        </div>

        {/* Explanation */}
        <div className="rounded-xl border border-border bg-gradient-card p-5 mb-4 animate-fade-in">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="text-base">📖</span> Why this happens
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{explanationPara1}</p>
          {explanationPara2 && (
            <p className={cn('text-sm text-foreground/80 leading-relaxed mt-3 font-medium', impactColor)}>
              {explanationPara2}
            </p>
          )}
        </div>

        {/* Recommendation */}
        <div className="rounded-xl border border-accent/20 bg-accent-soft p-5 mb-8 animate-fade-in">
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-accent" />
            Based on your priorities
          </h2>
          {model.priorities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {model.priorities.map((p) => (
                <span key={p} className="text-[10px] font-semibold uppercase tracking-wider bg-accent text-accent-foreground rounded-full px-2 py-0.5">
                  {p}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-foreground/80 leading-relaxed">{recommendation}</p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
          <Button variant="accent" size="lg" asChild className="flex-1">
            <Link to="/life-engine/simulate">
              <RotateCcw className="h-4 w-4" /> Try another decision
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/life-engine/dashboard">Back to dashboard</Link>
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Simplified projections for decision clarity — not financial advice. Real outcomes will vary.
        </p>
      </main>
    </div>
  );
}

function TradeoffRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex gap-3 p-3.5 rounded-lg border border-border bg-card">
      <div className="rounded-md bg-secondary p-1.5 shrink-0 h-fit">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground mt-0.5 leading-snug">{value}</p>
      </div>
    </div>
  );
}
