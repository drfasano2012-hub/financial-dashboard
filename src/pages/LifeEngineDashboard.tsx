import { useMemo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  Home, Briefcase, Baby, PiggyBank, ArrowRight, Pencil,
  TrendingUp, Clock, Wallet, Target, Zap, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/AppHeader';
import { useLifeEngineStore } from '@/store/lifeEngineStore';
import { calcMonthlyNet, calcPortfolio, calcFINumber, projectFreedom } from '@/lib/lifeEngine/engine';
import { cn } from '@/lib/utils';
import type { LifeModel } from '@/lib/lifeEngine/types';

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${Math.round(n)}`;
}

interface LifeSummary {
  freedom_age: number | null;
  years_to_freedom: number | null;
  monthly_net: number;
  net_worth: number;
  fi_number: number;
  savings_rate_pct: number;
  status: 'on_track' | 'tight' | 'needs_work' | 'no_surplus';
}

function computeSummary(model: LifeModel): LifeSummary {
  const portfolio = calcPortfolio(model);
  const monthly_net = calcMonthlyNet(model);
  const fi_number = calcFINumber(model.monthly_spend);
  const monthly_take_home = (model.income * 0.72) / 12;
  const savings_rate_pct = monthly_take_home > 0 ? Math.max(0, (monthly_net / monthly_take_home) * 100) : 0;
  const { freedom_age, years } = projectFreedom(
    model.age,
    portfolio,
    Math.max(0, monthly_net),
    fi_number,
    0.06,
  );

  let status: LifeSummary['status'];
  if (monthly_net <= 0) status = 'no_surplus';
  else if (freedom_age === null) status = 'needs_work';
  else if (freedom_age <= model.retirement_goal_age + 2) status = 'on_track';
  else if (freedom_age <= model.retirement_goal_age + 10) status = 'tight';
  else status = 'needs_work';

  return {
    freedom_age,
    years_to_freedom: years,
    monthly_net,
    net_worth: portfolio,
    fi_number,
    savings_rate_pct,
    status,
  };
}

const DECISIONS = [
  {
    type: 'buy_home' as const,
    icon: Home,
    label: 'Buy a Home',
    desc: 'Model a home purchase — price, down payment, and how it shifts your timeline.',
    color: 'text-info',
    bg: 'bg-info-soft',
    border: 'border-info/20',
  },
  {
    type: 'change_jobs' as const,
    icon: Briefcase,
    label: 'Change Jobs',
    desc: 'A raise or career pivot — see what a salary change does over 10, 20, 30 years.',
    color: 'text-success',
    bg: 'bg-success-soft',
    border: 'border-success/20',
  },
  {
    type: 'have_child' as const,
    icon: Baby,
    label: 'Have a Child',
    desc: 'The real cost of raising a child on your freedom clock.',
    color: 'text-warning',
    bg: 'bg-warning-soft',
    border: 'border-warning/20',
  },
  {
    type: 'change_savings_rate' as const,
    icon: PiggyBank,
    label: 'Change Savings Rate',
    desc: 'The most direct lever you have — see what happens when you save more or less.',
    color: 'text-accent',
    bg: 'bg-accent-soft',
    border: 'border-accent/20',
  },
];

const STATUS_CONFIG = {
  on_track: { label: 'On track', dot: 'bg-success', badge: 'bg-success-soft text-success border-success/20' },
  tight: { label: 'Getting there', dot: 'bg-warning', badge: 'bg-warning-soft text-warning border-warning/20' },
  needs_work: { label: 'Needs attention', dot: 'bg-destructive', badge: 'bg-destructive-soft text-destructive border-destructive/20' },
  no_surplus: { label: 'No surplus', dot: 'bg-destructive', badge: 'bg-destructive-soft text-destructive border-destructive/20' },
};

export default function LifeEngineDashboard() {
  const { model, reset } = useLifeEngineStore();
  const navigate = useNavigate();

  const summary = useMemo(() => (model ? computeSummary(model) : null), [model]);

  if (!model || !summary) return <Navigate to="/life-engine" replace />;

  const { freedom_age, years_to_freedom, monthly_net, net_worth, fi_number, savings_rate_pct, status } = summary;
  const cfg = STATUS_CONFIG[status];

  const headlineAge = freedom_age === null
    ? '50+ yrs away'
    : `Age ${Math.round(freedom_age)}`;

  const goalDelta = freedom_age !== null
    ? Math.round(freedom_age) - model.retirement_goal_age
    : null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container max-w-3xl py-8 md:py-12">

        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">Life Engine</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Your Life Model</h1>
            <p className="mt-1 text-muted-foreground text-sm">Based on where you stand today.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild>
              <Link to="/life-engine"><Pencil className="h-3.5 w-3.5" /> Edit</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { reset(); navigate('/life-engine'); }}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Freedom age hero */}
        <div className="rounded-2xl bg-gradient-hero text-primary-foreground p-6 md:p-8 shadow-lg-soft mb-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider',
                  cfg.badge,
                )}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
                  {cfg.label}
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/60 mb-1">
                Projected freedom age
              </p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight tabular-nums">
                {headlineAge}
              </h2>
              {goalDelta !== null && (
                <p className={cn('text-sm mt-2', goalDelta <= 2 ? 'text-success' : 'text-primary-foreground/70')}>
                  {goalDelta <= 0
                    ? `You're on track to beat your goal of age ${model.retirement_goal_age}!`
                    : `${goalDelta} year${goalDelta > 1 ? 's' : ''} after your goal of age ${model.retirement_goal_age}`}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 md:min-w-[260px]">
              <StatChip label="Years away" value={years_to_freedom === null ? '50+' : years_to_freedom < 0.5 ? '<1' : years_to_freedom.toFixed(1)} />
              <StatChip label="Savings rate" value={`${savings_rate_pct.toFixed(0)}%`} />
              <StatChip label="Monthly surplus" value={fmt(monthly_net)} muted={monthly_net < 0} />
              <StatChip label="FI number" value={fmt(fi_number)} />
            </div>
          </div>
          <p className="mt-5 text-xs text-primary-foreground/50 leading-relaxed">
            Based on 6% investment growth, 4% withdrawal rate, and your current surplus invested monthly. These are projections, not guarantees.
          </p>
        </div>

        {/* Snapshot cards */}
        <div className="grid grid-cols-2 gap-3 mb-8 animate-fade-in">
          <SnapshotCard icon={Wallet} label="Monthly surplus" value={fmt(monthly_net)} tone={monthly_net >= 200 ? 'success' : monthly_net >= 0 ? 'warning' : 'danger'} sub="investable each month" />
          <SnapshotCard icon={TrendingUp} label="Net worth" value={fmt(net_worth)} tone="neutral" sub="savings + investments − debt" />
          <SnapshotCard icon={Target} label="Freedom number" value={fmt(fi_number)} tone="neutral" sub="25× annual spending" />
          <SnapshotCard icon={Clock} label="Progress to FI" value={fi_number > 0 ? `${Math.min(100, Math.round((net_worth / fi_number) * 100))}%` : '—'} tone={net_worth / fi_number >= 0.5 ? 'success' : 'warning'} sub="of freedom number saved" />
        </div>

        {/* Simulate section */}
        <div className="mb-3 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-accent" />
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Decision Engine</p>
          </div>
          <h2 className="text-xl font-bold text-foreground">Simulate a life decision</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Pick a major life choice and see exactly how it changes your path to financial freedom.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 animate-fade-in">
          {DECISIONS.map((d) => (
            <Link
              key={d.type}
              to={`/life-engine/simulate?decision=${d.type}`}
              className={cn(
                'group rounded-xl border p-5 transition-all duration-200 hover:shadow-md-soft hover:-translate-y-0.5',
                d.bg,
                d.border,
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('rounded-lg p-2 bg-white/60', d.color)}>
                  <d.icon className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-foreground">{d.label}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{d.desc}</p>
              <div className={cn('flex items-center gap-1 text-sm font-semibold', d.color)}>
                Simulate <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          Life Engine is a decision simulator, not financial advice. Projections use simplified assumptions.
        </p>
      </main>
    </div>
  );
}

function StatChip({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/50">{label}</p>
      <p className={cn('text-xl font-bold tabular-nums mt-0.5', muted ? 'text-destructive' : 'text-primary-foreground')}>
        {value}
      </p>
    </div>
  );
}

function SnapshotCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
}) {
  const toneColor = {
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-destructive',
    neutral: 'text-foreground',
  }[tone];

  return (
    <div className="rounded-xl border border-border bg-gradient-card p-4 shadow-sm-soft">
      <div className="flex items-center gap-2 mb-2">
        <div className="rounded-md bg-secondary p-1.5 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className={cn('text-2xl font-bold tabular-nums', toneColor)}>{value}</p>
      <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}
