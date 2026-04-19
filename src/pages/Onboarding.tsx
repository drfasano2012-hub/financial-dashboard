import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Plus, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppHeader } from "@/components/AppHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { CurrencyInput } from "@/components/CurrencyInput";
import { useFinancialStore } from "@/store/financialStore";
import { DebtItem, FinancialInputs, Goal, RiskTolerance } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TOTAL_STEPS = 5;
const uid = () => Math.random().toString(36).slice(2, 9);

const SAMPLE: FinancialInputs = {
  annualIncome: 75000,
  monthlyTakeHome: 4800,
  monthlySpending: 3900,
  cashSavings: 6000,
  investments: 0,
  retirementAccounts: 9000,
  brokerageAccounts: 2500,
  hsaAccounts: 500,
  debts: [
    { id: uid(), name: "Credit Card", balance: 4200, rate: 22 },
    { id: uid(), name: "Student Loan", balance: 18000, rate: 5.5 },
  ],
  goals: [{ id: uid(), label: "Build emergency fund", horizon: "short" }],
  riskTolerance: "moderate",
};

export default function Onboarding() {
  const navigate = useNavigate();
  const setInputs = useFinancialStore((s) => s.setInputs);
  const existing = useFinancialStore((s) => s.inputs);

  const [step, setStep] = useState(1);
  const [data, setData] = useState<FinancialInputs>(
    existing ?? {
      annualIncome: 0,
      monthlyTakeHome: 0,
      monthlySpending: 0,
      cashSavings: 0,
      investments: 0,
      retirementAccounts: 0,
      brokerageAccounts: 0,
      hsaAccounts: 0,
      debts: [],
      goals: [],
      riskTolerance: "moderate",
    },
  );

  const update = <K extends keyof FinancialInputs>(k: K, v: FinancialInputs[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const next = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else finish();
  };
  const back = () => (step > 1 ? setStep(step - 1) : navigate("/"));

  const finish = () => {
    setInputs(data);
    toast.success("Checkup complete! Generating your dashboard...");
    navigate("/dashboard");
  };

  const loadSample = () => {
    setData(SAMPLE);
    toast.info("Sample data loaded — feel free to adjust.");
  };

  const canProceed = () => {
    if (step === 1) return data.annualIncome > 0 && data.monthlyTakeHome > 0;
    if (step === 2) return data.monthlySpending > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container max-w-2xl py-10 md:py-14">
        <div className="mb-8">
          <ProgressBar current={step} total={TOTAL_STEPS} />
        </div>

        <div className="rounded-2xl border border-border bg-gradient-card p-6 md:p-10 shadow-md-soft animate-scale-in" key={step}>
          {step === 1 && <StepIncome data={data} update={update} />}
          {step === 2 && <StepSpendingSavings data={data} update={update} />}
          {step === 3 && <StepDebt data={data} update={update} />}
          {step === 4 && <StepGoals data={data} update={update} />}
          {step === 5 && <StepRisk data={data} update={update} />}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={back}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            {step === 1 && (
              <Button variant="outline" size="sm" onClick={loadSample}>
                <Sparkles className="h-3.5 w-3.5" /> Try sample data
              </Button>
            )}
            <Button onClick={next} variant="accent" size="lg" disabled={!canProceed()}>
              {step === TOTAL_STEPS ? "See my dashboard" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

// ---------- Step components ----------

interface StepProps {
  data: FinancialInputs;
  update: <K extends keyof FinancialInputs>(k: K, v: FinancialInputs[K]) => void;
}

function StepHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">{eyebrow}</p>
      <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function NumberField({ label, value, onChange, prefix = "$", helper }: { label: string; value: number; onChange: (n: number) => void; prefix?: string; helper?: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <CurrencyInput value={value} onChange={onChange} prefix={prefix} />
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

function StepIncome({ data, update }: StepProps) {
  return (
    <div>
      <StepHeading
        eyebrow="Step 1 · Income"
        title="What lands in your account?"
        subtitle="Lead with take-home — that's the money that actually drives your savings rate. Annual gross is optional context."
      />
      <div className="grid sm:grid-cols-2 gap-5">
        <NumberField
          label="Monthly take-home pay"
          value={data.monthlyTakeHome}
          onChange={(v) => update("monthlyTakeHome", v)}
          helper="After tax, 401k, insurance — what hits the bank"
        />
        <NumberField
          label="Annual income (gross)"
          value={data.annualIncome}
          onChange={(v) => update("annualIncome", v)}
          helper="Optional — pre-tax, for context"
        />
      </div>
    </div>
  );
}

function StepSpendingSavings({ data, update }: StepProps) {
  return (
    <div>
      <StepHeading
        eyebrow="Step 2 · Spending, cash & investments"
        title="Where does it go and what's invested?"
        subtitle="Approximate is fine. Splitting investment buckets helps us tailor recommendations."
      />
      <div className="grid sm:grid-cols-2 gap-5">
        <NumberField label="Monthly spending" value={data.monthlySpending} onChange={(v) => update("monthlySpending", v)} helper="All-in: rent, food, etc." />
        <NumberField label="Cash & savings" value={data.cashSavings} onChange={(v) => update("cashSavings", v)} helper="Checking + HYSA" />
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Investment accounts
        </p>
        <div className="grid sm:grid-cols-3 gap-5">
          <NumberField
            label="Retirement"
            value={data.retirementAccounts}
            onChange={(v) => update("retirementAccounts", v)}
            helper="401k, IRA, Roth"
          />
          <NumberField
            label="Brokerage"
            value={data.brokerageAccounts}
            onChange={(v) => update("brokerageAccounts", v)}
            helper="Taxable accounts"
          />
          <NumberField
            label="HSA"
            value={data.hsaAccounts}
            onChange={(v) => update("hsaAccounts", v)}
            helper="Health Savings Account"
          />
        </div>
      </div>
    </div>
  );
}

function StepDebt({ data, update }: StepProps) {
  const addDebt = () => update("debts", [...data.debts, { id: uid(), name: "", balance: 0, rate: 0 }]);
  const removeDebt = (id: string) => update("debts", data.debts.filter((d) => d.id !== id));
  const updateDebt = (id: string, patch: Partial<DebtItem>) =>
    update("debts", data.debts.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  return (
    <div>
      <StepHeading eyebrow="Step 3 · Debt" title="List your debts" subtitle="Skip this if you have none. Otherwise, add each balance and APR." />
      <div className="space-y-3">
        {data.debts.map((d) => (
          <div key={d.id} className="grid grid-cols-12 gap-2 items-end p-3 rounded-lg border border-border bg-secondary/40">
            <div className="col-span-12 sm:col-span-5 space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input value={d.name} onChange={(e) => updateDebt(d.id, { name: e.target.value })} placeholder="Credit card" className="h-10" />
            </div>
            <div className="col-span-6 sm:col-span-3 space-y-1.5">
              <Label className="text-xs">Balance</Label>
              <Input type="number" value={d.balance || ""} onChange={(e) => updateDebt(d.id, { balance: Number(e.target.value) || 0 })} placeholder="0" className="h-10" />
            </div>
            <div className="col-span-5 sm:col-span-3 space-y-1.5">
              <Label className="text-xs">APR %</Label>
              <Input type="number" value={d.rate || ""} onChange={(e) => updateDebt(d.id, { rate: Number(e.target.value) || 0 })} placeholder="0" className="h-10" />
            </div>
            <div className="col-span-1">
              <Button size="icon" variant="ghost" onClick={() => removeDebt(d.id)} className="h-10 w-10 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={addDebt} className="w-full">
          <Plus className="h-4 w-4" /> Add debt
        </Button>
        {data.debts.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">No debts? Skip ahead — you're ahead of the game.</p>
        )}
      </div>
    </div>
  );
}

const GOAL_OPTIONS: { label: string; horizon: Goal["horizon"] }[] = [
  { label: "Build emergency fund", horizon: "short" },
  { label: "Pay off debt", horizon: "short" },
  { label: "Save for vacation", horizon: "short" },
  { label: "Buy a home", horizon: "mid" },
  { label: "Start a business", horizon: "mid" },
  { label: "Save for kids' education", horizon: "mid" },
  { label: "Retire comfortably", horizon: "long" },
  { label: "Achieve financial independence", horizon: "long" },
];

function StepGoals({ data, update }: StepProps) {
  const isSelected = (label: string) => data.goals.some((g) => g.label === label);
  const toggle = (opt: { label: string; horizon: Goal["horizon"] }) => {
    if (isSelected(opt.label)) update("goals", data.goals.filter((g) => g.label !== opt.label));
    else update("goals", [...data.goals, { id: uid(), label: opt.label, horizon: opt.horizon }]);
  };

  const horizonLabel = { short: "Short-term (< 2 yr)", mid: "Mid-term (2–7 yr)", long: "Long-term (7+ yr)" };

  return (
    <div>
      <StepHeading eyebrow="Step 4 · Goals" title="What are you working toward?" subtitle="Pick all that apply. We'll prioritize advice around these." />
      {(["short", "mid", "long"] as const).map((h) => (
        <div key={h} className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{horizonLabel[h]}</p>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.filter((o) => o.horizon === h).map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => toggle(opt)}
                className={cn(
                  "px-3.5 py-2 rounded-full text-sm font-medium border transition-smooth",
                  isSelected(opt.label)
                    ? "bg-accent text-accent-foreground border-accent shadow-sm-soft"
                    : "bg-card border-border text-foreground hover:border-accent/40 hover:bg-accent-soft",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StepRisk({ data, update }: StepProps) {
  const options: { value: RiskTolerance; title: string; desc: string }[] = [
    { value: "conservative", title: "Conservative", desc: "I prefer stability. Losses keep me up at night." },
    { value: "moderate", title: "Moderate", desc: "I can handle some ups and downs for better long-term returns." },
    { value: "aggressive", title: "Aggressive", desc: "I'm in for the long haul. Volatility is the price of growth." },
  ];

  return (
    <div>
      <StepHeading eyebrow="Step 5 · Risk" title="How do you feel about market swings?" subtitle="Be honest — this guides your investment recommendations." />
      <div className="space-y-3">
        {options.map((o) => {
          const selected = data.riskTolerance === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => update("riskTolerance", o.value)}
              className={cn(
                "w-full text-left p-5 rounded-lg border-2 transition-smooth",
                selected
                  ? "border-accent bg-accent-soft shadow-sm-soft"
                  : "border-border bg-card hover:border-accent/40",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">{o.title}</p>
                <div className={cn("h-4 w-4 rounded-full border-2", selected ? "border-accent bg-accent" : "border-muted-foreground/30")} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{o.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
