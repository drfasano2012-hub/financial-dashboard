import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useLifeEngineStore } from '@/store/lifeEngineStore';
import type { LifeModel, Priority } from '@/lib/lifeEngine/types';
import { AppHeader } from '@/components/AppHeader';

const TOTAL_STEPS = 3;

const SAMPLE: LifeModel = {
  age: 32,
  income: 95_000,
  monthly_spend: 3_800,
  savings: 18_000,
  investments: 42_000,
  debt: 8_000,
  housing_cost: 1_600,
  retirement_goal_age: 55,
  priorities: ['freedom', 'health'],
};

const PRIORITY_OPTIONS: { value: Priority; label: string; emoji: string; desc: string }[] = [
  { value: 'freedom', label: 'Financial Freedom', emoji: '🕊️', desc: 'Time and flexibility over everything' },
  { value: 'family', label: 'Family', emoji: '🏡', desc: 'Stability, space, time for people you love' },
  { value: 'career', label: 'Career', emoji: '🚀', desc: 'Growth, impact, professional fulfillment' },
  { value: 'health', label: 'Health & Wellbeing', emoji: '🌿', desc: 'Energy, longevity, low stress' },
];

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
          value={value === 0 && prefix ? '' : value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          placeholder={placeholder ?? '0'}
          className={cn('h-11', prefix && 'pl-7')}
        />
      </div>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

function StepHeading({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">Step {step} of {TOTAL_STEPS}</p>
      <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{subtitle}</p>
    </div>
  );
}

export default function LifeEngineOnboarding() {
  const navigate = useNavigate();
  const { setModel, model: existing } = useLifeEngineStore();

  const [step, setStep] = useState(1);
  const [data, setData] = useState<LifeModel>(existing ?? {
    age: 0,
    income: 0,
    monthly_spend: 0,
    savings: 0,
    investments: 0,
    debt: 0,
    housing_cost: 0,
    retirement_goal_age: 55,
    priorities: [],
  });

  const set = <K extends keyof LifeModel>(k: K, v: LifeModel[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const canProceed = () => {
    if (step === 1) return data.age > 0 && data.income > 0 && data.housing_cost >= 0;
    if (step === 2) return data.monthly_spend > 0;
    if (step === 3) return data.priorities.length > 0;
    return true;
  };

  const next = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      setModel(data);
      navigate('/life-engine/dashboard');
    }
  };

  const back = () => {
    if (step > 1) setStep((s) => s - 1);
    else navigate('/');
  };

  const loadSample = () => setData(SAMPLE);

  const togglePriority = (p: Priority) => {
    const current = data.priorities;
    if (current.includes(p)) {
      set('priorities', current.filter((x) => x !== p));
    } else {
      set('priorities', [...current, p]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container max-w-2xl py-10 md:py-16">
        {/* Progress */}
        <div className="flex gap-2 mb-10">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-300',
                i + 1 <= step ? 'bg-accent' : 'bg-border',
              )}
            />
          ))}
        </div>

        <div
          key={step}
          className="rounded-2xl border border-border bg-gradient-card p-6 md:p-10 shadow-md-soft animate-scale-in"
        >
          {step === 1 && (
            <div>
              <StepHeading
                step={1}
                title="Tell us about you"
                subtitle="A few numbers about your life right now. Approximate is fine — we're looking for direction, not perfection."
              />
              <div className="grid sm:grid-cols-2 gap-5">
                <NumField
                  label="Your current age"
                  value={data.age || ''}
                  onChange={(v) => set('age', v)}
                  prefix=""
                  placeholder="e.g. 32"
                  helper="Used to calculate your projected freedom age"
                  min={16}
                />
                <NumField
                  label="Annual income (gross)"
                  value={data.income}
                  onChange={(v) => set('income', v)}
                  helper="Pre-tax. We apply a ~28% effective rate."
                />
                <NumField
                  label="Current monthly housing"
                  value={data.housing_cost}
                  onChange={(v) => set('housing_cost', v)}
                  helper="Rent or current mortgage payment"
                />
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Target freedom age: {data.retirement_goal_age}</Label>
                  <Slider
                    min={30}
                    max={70}
                    step={1}
                    value={[data.retirement_goal_age]}
                    onValueChange={([v]) => set('retirement_goal_age', v)}
                    className="mt-3"
                  />
                  <p className="text-xs text-muted-foreground">
                    The age you want the option to stop working. Not retirement — freedom.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <StepHeading
                step={2}
                title="Your money snapshot"
                subtitle="Where things stand today. These drive your savings trajectory and freedom timeline."
              />
              <div className="grid sm:grid-cols-2 gap-5">
                <NumField
                  label="Monthly spending"
                  value={data.monthly_spend}
                  onChange={(v) => set('monthly_spend', v)}
                  helper="All expenses: rent, food, subscriptions, etc."
                />
                <NumField
                  label="Liquid savings (cash)"
                  value={data.savings}
                  onChange={(v) => set('savings', v)}
                  helper="Checking + HYSA + emergency fund"
                />
                <NumField
                  label="Investments"
                  value={data.investments}
                  onChange={(v) => set('investments', v)}
                  helper="401k + IRA + brokerage — total invested"
                />
                <NumField
                  label="Total debt (non-mortgage)"
                  value={data.debt}
                  onChange={(v) => set('debt', v)}
                  helper="Student loans, credit cards, car loans"
                />
              </div>
              <div className="mt-5 p-4 rounded-lg bg-secondary/50 border border-border">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Your investable net worth: </span>
                  ${Math.max(0, data.savings + data.investments - data.debt).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <StepHeading
                step={3}
                title="What matters most to you?"
                subtitle="Pick everything that applies. This shapes your personalized recommendations."
              />
              <div className="grid sm:grid-cols-2 gap-3">
                {PRIORITY_OPTIONS.map((opt) => {
                  const selected = data.priorities.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => togglePriority(opt.value)}
                      className={cn(
                        'w-full text-left p-5 rounded-xl border-2 transition-all duration-200',
                        selected
                          ? 'border-accent bg-accent-soft shadow-sm-soft'
                          : 'border-border bg-card hover:border-accent/40 hover:bg-secondary/40',
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">{opt.emoji}</span>
                        <div
                          className={cn(
                            'h-4 w-4 rounded-full border-2 transition-all',
                            selected ? 'border-accent bg-accent' : 'border-muted-foreground/30',
                          )}
                        />
                      </div>
                      <p className="font-semibold text-foreground mt-2">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={back}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            {step === 1 && (
              <Button variant="outline" size="sm" onClick={loadSample}>
                <Sparkles className="h-3.5 w-3.5" /> Try sample
              </Button>
            )}
            <Button
              onClick={next}
              variant="accent"
              size="lg"
              disabled={!canProceed()}
              className="gap-2"
            >
              {step === TOTAL_STEPS ? (
                <>
                  <Brain className="h-4 w-4" /> See my life model
                </>
              ) : (
                <>
                  Continue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
