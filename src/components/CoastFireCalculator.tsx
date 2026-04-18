import { useMemo, useState } from "react";
import { Flame, Coffee, Calendar } from "lucide-react";
import { CurrencyInput } from "@/components/CurrencyInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/calculations";

export function CoastFireCalculator() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retireAge, setRetireAge] = useState(65);
  const [annualSpending, setAnnualSpending] = useState(50000);
  const [currentInvested, setCurrentInvested] = useState(25000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [realReturn, setRealReturn] = useState(7);
  const [withdrawalRate, setWithdrawalRate] = useState(4);

  const result = useMemo(() => {
    const fireNumber = annualSpending / (withdrawalRate / 100);
    const yearsToRetire = Math.max(0, retireAge - currentAge);
    const r = realReturn / 100;

    // Coast FIRE: amount needed today to grow to FIRE number with NO more contributions
    const coastFireNumber = fireNumber / Math.pow(1 + r, yearsToRetire);

    // Project balance with current contributions
    const m = r / 12;
    const months = yearsToRetire * 12;
    let balance = currentInvested;
    let coastReachedAge: number | null = null;
    for (let i = 1; i <= months; i++) {
      balance = balance * (1 + m) + monthlyContribution;
      // Check coast at this age
      const ageAtMonth = currentAge + i / 12;
      const yearsLeft = retireAge - ageAtMonth;
      const coastNeeded = fireNumber / Math.pow(1 + r, yearsLeft);
      if (coastReachedAge === null && balance >= coastNeeded) {
        coastReachedAge = ageAtMonth;
      }
    }
    const projectedAtRetirement = balance;

    // Already coasting?
    const alreadyCoasting = currentInvested >= coastFireNumber;

    // Earliest retirement age (4% rule) at current contribution pace
    let earliestRetireAge: number | null = null;
    let bal = currentInvested;
    for (let i = 1; i <= 50 * 12; i++) {
      bal = bal * (1 + m) + monthlyContribution;
      if (bal >= fireNumber) {
        earliestRetireAge = currentAge + i / 12;
        break;
      }
    }

    return {
      fireNumber,
      coastFireNumber,
      coastReachedAge,
      projectedAtRetirement,
      alreadyCoasting,
      earliestRetireAge,
      gapToCoast: Math.max(0, coastFireNumber - currentInvested),
    };
  }, [currentAge, retireAge, annualSpending, currentInvested, monthlyContribution, realReturn, withdrawalRate]);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Inputs */}
      <div className="lg:col-span-2 space-y-5 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="rounded-md bg-secondary p-1.5 text-primary">
            <Flame className="h-3.5 w-3.5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your situation
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current age</Label>
            <Input type="number" value={currentAge} onChange={(e) => setCurrentAge(Number(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Retire at</Label>
            <Input type="number" value={retireAge} onChange={(e) => setRetireAge(Number(e.target.value) || 0)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Annual spending in retirement</Label>
          <CurrencyInput value={annualSpending} onChange={setAnnualSpending} />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Currently invested</Label>
          <CurrencyInput value={currentInvested} onChange={setCurrentInvested} />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Monthly contribution</Label>
          <CurrencyInput value={monthlyContribution} onChange={setMonthlyContribution} />
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <Label className="text-sm font-medium">Real return (after inflation)</Label>
            <span className="text-base font-bold text-foreground tabular-nums">{realReturn.toFixed(1)}%</span>
          </div>
          <Slider value={[realReturn]} onValueChange={(v) => setRealReturn(v[0])} min={2} max={10} step={0.5} />
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <Label className="text-sm font-medium">Withdrawal rate</Label>
            <span className="text-base font-bold text-foreground tabular-nums">{withdrawalRate.toFixed(1)}%</span>
          </div>
          <Slider value={[withdrawalRate]} onValueChange={(v) => setWithdrawalRate(v[0])} min={2.5} max={6} step={0.25} />
          <p className="text-[10px] text-muted-foreground">
            4% is the classic "safe withdrawal rate."
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-3 space-y-4">
        <BigStat
          icon={Flame}
          eyebrow="Your FIRE number"
          value={formatCurrency(result.fireNumber)}
          subtitle={`Annual spending ÷ ${withdrawalRate}% withdrawal rate`}
          tone="accent"
        />

        <BigStat
          icon={Coffee}
          eyebrow="Coast FIRE number (today)"
          value={formatCurrency(result.coastFireNumber)}
          subtitle={
            result.alreadyCoasting
              ? "✓ You're already coasting — even with no more contributions, you'll hit your FIRE number."
              : `You need ${formatCurrency(result.gapToCoast)} more invested today to coast to retirement.`
          }
          tone={result.alreadyCoasting ? "success" : "info"}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SmallStat
            icon={Coffee}
            label="You'll hit Coast FIRE at age"
            value={
              result.alreadyCoasting
                ? "Now ✓"
                : result.coastReachedAge
                ? result.coastReachedAge.toFixed(1)
                : "After retirement"
            }
            tone={result.alreadyCoasting || result.coastReachedAge ? "success" : "warning"}
          />
          <SmallStat
            icon={Calendar}
            label="Earliest you could retire"
            value={result.earliestRetireAge ? `Age ${result.earliestRetireAge.toFixed(1)}` : "Not in 50 yr"}
            tone={result.earliestRetireAge && result.earliestRetireAge <= retireAge ? "success" : "info"}
          />
        </div>

        <div className="rounded-xl border border-border bg-secondary/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            What is Coast FIRE?
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            <strong>Coast FIRE</strong> is the point where your invested money is enough that —
            even if you never contributed another dollar — it would grow to fund your retirement.
            You still need income to cover today's expenses, but you can stop saving for retirement
            and "coast" to the finish line.
          </p>
        </div>
      </div>
    </div>
  );
}

function BigStat({
  icon: Icon,
  eyebrow,
  value,
  subtitle,
  tone,
}: {
  icon: React.ElementType;
  eyebrow: string;
  value: string;
  subtitle: string;
  tone: "accent" | "success" | "info";
}) {
  const toneClass =
    tone === "success"
      ? "bg-success-soft border-success/20 text-success"
      : tone === "accent"
      ? "bg-accent-soft border-accent/20 text-accent"
      : "bg-secondary border-border text-foreground";
  return (
    <div className={`rounded-xl border p-5 ${toneClass}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{eyebrow}</p>
      </div>
      <p className="text-3xl font-bold tabular-nums">{value}</p>
      <p className="text-xs mt-2 opacity-80 leading-relaxed">{subtitle}</p>
    </div>
  );
}

function SmallStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
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
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3.5 w-3.5" />
        <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</p>
      </div>
      <p className="text-lg font-bold tabular-nums mt-1">{value}</p>
    </div>
  );
}
