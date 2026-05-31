import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Home, Briefcase, Baby, PiggyBank, ArrowLeft, Play,
  TrendingUp, TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AppHeader } from '@/components/AppHeader';
import { cn } from '@/lib/utils';
import { useLifeEngineStore } from '@/store/lifeEngineStore';
import { simulate } from '@/lib/lifeEngine/engine';
import type { DecisionType, Decision } from '@/lib/lifeEngine/types';

const DECISION_META = {
  buy_home: {
    icon: Home,
    label: 'Buy a Home',
    desc: 'Model the impact of purchasing a home on your financial freedom timeline.',
    color: 'text-info',
    bg: 'bg-info-soft',
    border: 'border-info/30',
  },
  change_jobs: {
    icon: Briefcase,
    label: 'Change Jobs',
    desc: 'See how a raise, promotion, or career change reshapes your future.',
    color: 'text-success',
    bg: 'bg-success-soft',
    border: 'border-success/30',
  },
  have_child: {
    icon: Baby,
    label: 'Have a Child',
    desc: 'Understand the real financial trade-offs of starting or growing a family.',
    color: 'text-warning',
    bg: 'bg-warning-soft',
    border: 'border-warning/30',
  },
  change_savings_rate: {
    icon: PiggyBank,
    label: 'Change Savings Rate',
    desc: 'Your most direct lever — dial your savings rate up or down and see what changes.',
    color: 'text-accent',
    bg: 'bg-accent-soft',
    border: 'border-accent/30',
  },
} as const;

function NumField({
  label,
  value,
  onChange,
  prefix = '$',
  placeholder,
  helper,
  min = 0,
}: {
  label: string;
  value: number | '';
  onChange: (v: number) => void;
  prefix?: string;
  placeholder?: string;
  helper?: string;
  min?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          inputMode="numeric"
          min={min}
          value={value === 0 ? '' : value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          placeholder={placeholder ?? '0'}
          className={cn('h-11', prefix && 'pl-7')}
        />
      </div>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

export default function LifeEngineSimulate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { model, setResult } = useLifeEngineStore();

  const paramDecision = searchParams.get('decision') as DecisionType | null;
  const [selected, setSelected] = useState<DecisionType | null>(paramDecision);

  // Decision params state
  const [homePrice, setHomePrice] = useState(400_000);
  const [incomeChangePct, setIncomeChangePct] = useState(20);
  const [savingsRatePct, setSavingsRatePct] = useState(25);

  if (!model) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No life model found. Start from the beginning.</p>
          <Button asChild><Link to="/life-engine">Get started</Link></Button>
        </div>
      </div>
    );
  }

  const buildDecision = (): Decision | null => {
    if (!selected) return null;
    switch (selected) {
      case 'buy_home':
        return { type: 'buy_home', label: 'Buy a Home', params: { home_price: homePrice } };
      case 'change_jobs':
        return { type: 'change_jobs', label: 'Change Jobs', params: { income_change_pct: incomeChangePct } };
      case 'have_child':
        return { type: 'have_child', label: 'Have a Child', params: {} };
      case 'change_savings_rate':
        return { type: 'change_savings_rate', label: 'Change Savings Rate', params: { new_savings_rate_pct: savingsRatePct } };
    }
  };

  const runSimulation = () => {
    const decision = buildDecision();
    if (!decision) return;
    const result = simulate(model, decision);
    setResult(result);
    navigate('/life-engine/results');
  };

  const canRun = selected !== null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container max-w-2xl py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
            <Link to="/life-engine/dashboard"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
          </Button>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">Decision Simulator</p>
          <h1 className="text-3xl font-bold text-foreground">What if you…</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pick a life decision and configure it. We'll show you the impact across best, base, and worst case scenarios.
          </p>
        </div>

        {/* Decision picker */}
        <div className="grid sm:grid-cols-2 gap-3 mb-8 animate-fade-in">
          {(Object.entries(DECISION_META) as [DecisionType, typeof DECISION_META[keyof typeof DECISION_META]][]).map(([type, meta]) => {
            const isSelected = selected === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelected(type)}
                className={cn(
                  'w-full text-left p-4 rounded-xl border-2 transition-all duration-200',
                  isSelected
                    ? `border-accent ${meta.bg} shadow-sm-soft`
                    : 'border-border bg-card hover:border-accent/40 hover:bg-secondary/40',
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn('rounded-md p-1.5 bg-white/60', isSelected ? meta.color : 'text-muted-foreground')}>
                    <meta.icon className="h-4 w-4" />
                  </div>
                  <p className={cn('font-semibold text-sm', isSelected ? 'text-foreground' : 'text-foreground')}>
                    {meta.label}
                  </p>
                  <div className={cn(
                    'ml-auto h-4 w-4 rounded-full border-2 shrink-0 transition-all',
                    isSelected ? 'border-accent bg-accent' : 'border-muted-foreground/30',
                  )} />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{meta.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Params form */}
        {selected && (
          <div
            key={selected}
            className="rounded-2xl border border-border bg-gradient-card p-6 shadow-md-soft mb-8 animate-scale-in"
          >
            {selected === 'buy_home' && (
              <div>
                <h3 className="font-semibold text-foreground mb-1">Configure the home purchase</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  We'll assume a 20% down payment and a 6.5% 30-year mortgage.
                </p>
                <NumField
                  label="Home purchase price"
                  value={homePrice}
                  onChange={setHomePrice}
                  helper={`Down payment: $${Math.round(homePrice * 0.2).toLocaleString()} · Monthly mortgage: ~$${Math.round((homePrice * 0.8 * (0.065 / 12)) / (1 - Math.pow(1 + 0.065 / 12, -360))).toLocaleString()}`}
                  placeholder="400,000"
                />
              </div>
            )}

            {selected === 'change_jobs' && (
              <div>
                <h3 className="font-semibold text-foreground mb-1">Configure the career change</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Use a positive % for a raise or promotion. Use negative for a pay cut.
                </p>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Income change</Label>
                      <span className={cn(
                        'text-lg font-bold tabular-nums',
                        incomeChangePct > 0 ? 'text-success' : incomeChangePct < 0 ? 'text-destructive' : 'text-foreground',
                      )}>
                        {incomeChangePct > 0 ? '+' : ''}{incomeChangePct}%
                      </span>
                    </div>
                    <Slider
                      min={-40}
                      max={100}
                      step={5}
                      value={[incomeChangePct]}
                      onValueChange={([v]) => setIncomeChangePct(v)}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>−40% (big cut)</span>
                      <span>+100% (double salary)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border">
                    {incomeChangePct >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-success shrink-0" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <p className="text-sm text-foreground">
                      New annual income:{' '}
                      <span className="font-semibold">
                        ${Math.round(model.income * (1 + incomeChangePct / 100)).toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selected === 'have_child' && (
              <div>
                <h3 className="font-semibold text-foreground mb-1">Having a child</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We use a fixed assumption of $15,000/year ($1,250/month) covering childcare, healthcare, food, and basics. Real costs vary by location, childcare type, and lifestyle.
                </p>
                <div className="rounded-lg bg-warning-soft border border-warning/20 p-4">
                  <p className="text-sm font-semibold text-warning mb-1">What's modeled</p>
                  <ul className="text-sm text-foreground/80 space-y-1">
                    <li>• $1,250/month added to monthly expenses</li>
                    <li>• Direct reduction in your investable surplus</li>
                    <li>• Impact on time to financial independence</li>
                  </ul>
                </div>
              </div>
            )}

            {selected === 'change_savings_rate' && (
              <div>
                <h3 className="font-semibold text-foreground mb-1">Set your savings rate</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  What % of your take-home pay would you like to invest each month?
                </p>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Savings rate (% of take-home)</Label>
                      <span className={cn(
                        'text-2xl font-bold tabular-nums',
                        savingsRatePct >= 25 ? 'text-success' : savingsRatePct >= 15 ? 'text-accent' : 'text-warning',
                      )}>
                        {savingsRatePct}%
                      </span>
                    </div>
                    <Slider
                      min={5}
                      max={60}
                      step={1}
                      value={[savingsRatePct]}
                      onValueChange={([v]) => setSavingsRatePct(v)}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5% (minimal)</span>
                      <span>60% (extreme FIRE)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border">
                    <PiggyBank className="h-4 w-4 text-accent shrink-0" />
                    <p className="text-sm text-foreground">
                      Monthly investment:{' '}
                      <span className="font-semibold text-accent">
                        ${Math.round(model.income * 0.72 / 12 * savingsRatePct / 100).toLocaleString()}/month
                      </span>
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {[
                      { label: '🐢 Conservative', rate: 10 },
                      { label: '⚡ Recommended', rate: 25 },
                      { label: '🚀 Aggressive', rate: 40 },
                    ].map((preset) => (
                      <button
                        key={preset.rate}
                        type="button"
                        onClick={() => setSavingsRatePct(preset.rate)}
                        className={cn(
                          'rounded-lg border p-2 transition-all',
                          savingsRatePct === preset.rate
                            ? 'border-accent bg-accent-soft text-accent font-semibold'
                            : 'border-border bg-secondary/40 text-muted-foreground hover:border-accent/40',
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
          <Button
            size="xl"
            variant="accent"
            onClick={runSimulation}
            disabled={!canRun}
            className="flex-1 gap-2"
          >
            <Play className="h-4 w-4" />
            Run simulation
          </Button>
          {!canRun && (
            <p className="text-sm text-muted-foreground self-center">
              Pick a decision above to continue
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
