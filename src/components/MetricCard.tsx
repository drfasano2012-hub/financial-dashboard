import { Benchmark } from "@/lib/types";
import { BenchmarkBadge } from "./BenchmarkBadge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  benchmark: Benchmark;
  className?: string;
}

export function MetricCard({ icon: Icon, label, benchmark, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-lg border border-border bg-gradient-card p-6 shadow-sm-soft transition-smooth hover:shadow-md-soft hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-secondary p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <BenchmarkBadge benchmark={benchmark} />
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold tracking-tight text-foreground">{benchmark.display}</p>
        <p className="text-xs text-muted-foreground font-medium">{benchmark.range}</p>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground border-t border-border pt-3">
        {benchmark.explanation}
      </p>
    </div>
  );
}
