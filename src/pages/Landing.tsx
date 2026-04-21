import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp, Compass, Plane, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { BenchmarkBadge } from "@/components/BenchmarkBadge";

const previewMetrics = [
  { label: "Savings rate", value: "22%", tone: "success" as const, badge: "Strong" },
  { label: "Monthly surplus", value: "$1,840", tone: "success" as const, badge: "Healthy" },
  { label: "Emergency fund", value: "5.2 mo", tone: "success" as const, badge: "Healthy" },
  { label: "Net worth", value: "$148,200", tone: "success" as const, badge: "Growing" },
];

const features = [
  { icon: Clock, title: "Buy back your time", desc: "See exactly how many years stand between you and the freedom to choose how you spend your days." },
  { icon: Compass, title: "Know your numbers", desc: "Your savings rate, Coast FIRE age, and runway — measured against what actually leads to freedom." },
  { icon: Plane, title: "Live now, not just later", desc: "A clear plan so you can take the sabbatical, the trip, the leap — without blowing up your future." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_30%,hsl(158_64%_42%/0.4),transparent_50%),radial-gradient(circle_at_80%_70%,hsl(173_80%_40%/0.3),transparent_50%)]" />
        <div className="container relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-4 py-1.5 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>Money is a tool. Freedom is the goal.</span>
            </div>
            <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
              Don't wait <br />
              <span className="bg-gradient-accent bg-clip-text text-transparent">to start living</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed font-medium">
              Time is the one thing you can't earn back. Plan for it.
            </p>
            <p className="mt-4 text-base md:text-lg text-primary-foreground/60 max-w-2xl mx-auto leading-relaxed">
              When you know your numbers, you stop trading years for a paycheck you don't need. See your path to financial freedom — and the flexibility to take the trip, switch careers, or work less, sooner than you think.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button asChild size="xl" variant="hero">
                <Link to="/checkup">
                  Map your path to freedom
                  <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <ShieldCheck className="h-4 w-4" />
                <span>Sign up to save your plan. Your data stays yours.</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 md:mt-20 mx-auto max-w-5xl animate-slide-up">
            <div className="rounded-2xl border border-primary-foreground/10 bg-background/95 p-6 md:p-8 shadow-lg-soft backdrop-blur">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your freedom plan</p>
                  <p className="text-lg font-semibold text-foreground mt-1">Sample dashboard preview</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  Live calculation
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {previewMetrics.map((m) => (
                  <div key={m.label} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground font-medium">{m.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground mb-2">{m.value}</p>
                    <BenchmarkBadge benchmark={{ value: 0, display: "", label: m.badge, tone: m.tone, explanation: "", range: "" }} />
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg bg-secondary p-4 border border-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Your next move</p>
                <p className="text-sm font-medium text-foreground">→ Bump savings to 25% and you hit Coast FIRE 3 years sooner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Retirement isn't the prize. <br />Optionality is.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Most people grind for 40 years hoping to enjoy the last few. There's a better way — and it starts with knowing where you actually stand.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={f.title} className="rounded-xl border border-border bg-gradient-card p-8 shadow-sm-soft hover:shadow-md-soft transition-smooth animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent mb-5">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-2xl bg-gradient-hero p-10 md:p-14 text-center text-primary-foreground shadow-lg-soft">
          <TrendingUp className="h-8 w-8 mx-auto mb-4 text-accent" />
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">How many years until you're free?</h3>
          <p className="mt-3 text-primary-foreground/70 max-w-md mx-auto">Find out in under 5 minutes. Create a free account to save your plan and track progress.</p>
          <Button asChild size="lg" variant="hero" className="mt-6">
            <Link to="/checkup">
              Map your path to freedom <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Freedomly · Educational tool, not financial advice.
      </footer>
    </div>
  );
}
