import { useSearchParams } from "react-router-dom";
import { Sliders, LineChart, Flame } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SavingsScaleSimulator } from "@/components/SavingsScaleSimulator";
import { CompoundInterestCalculator } from "@/components/CompoundInterestCalculator";
import { CoastFireCalculator } from "@/components/CoastFireCalculator";

const TABS = [
  { value: "savings", label: "Savings scale", icon: Sliders, desc: "How much faster you'd hit a 3-month emergency fund." },
  { value: "compound", label: "Compound interest", icon: LineChart, desc: "Project the long-term growth of your investments." },
  { value: "coast-fire", label: "Coast FIRE", icon: Flame, desc: "Coast FIRE is the moment your investments can grow to fund retirement on their own — even if you never save another dollar. See when you'll hit it and the earliest you could retire." },
] as const;

export default function Tools() {
  const [params, setParams] = useSearchParams();
  const active = (params.get("tab") as (typeof TABS)[number]["value"]) ?? "savings";
  const meta = TABS.find((t) => t.value === active) ?? TABS[0];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8 md:py-12">
        <div className="mb-8 animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
            Tools · Interactive calculators
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Run the numbers on your future
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">{meta.desc}</p>
        </div>

        <Tabs
          value={active}
          onValueChange={(v) => {
            const next = new URLSearchParams(params);
            next.set("tab", v);
            setParams(next, { replace: true });
          }}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full max-w-2xl h-auto bg-secondary/60 p-1">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-2 py-2.5">
                <t.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden text-xs">{t.label.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="savings" className="mt-8 animate-fade-in">
            <SavingsScaleSimulator />
          </TabsContent>
          <TabsContent value="compound" className="mt-8 animate-fade-in">
            <CompoundInterestCalculator />
          </TabsContent>
          <TabsContent value="coast-fire" className="mt-8 animate-fade-in">
            <CoastFireCalculator />
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-muted-foreground mt-12">
          Educational projections — assumes constant returns, ignores taxes and fees. Actual results vary.
        </p>
      </main>
    </div>
  );
}
