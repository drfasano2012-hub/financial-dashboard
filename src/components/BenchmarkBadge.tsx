import { cn } from "@/lib/utils";
import { Benchmark, BenchmarkTone } from "@/lib/types";

const toneStyles: Record<BenchmarkTone, string> = {
  danger: "bg-destructive-soft text-destructive border-destructive/20",
  warning: "bg-warning-soft text-warning-foreground border-warning/30",
  success: "bg-success-soft text-success border-success/20",
  info: "bg-info-soft text-info border-info/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function BenchmarkBadge({ benchmark, className }: { benchmark: Benchmark; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneStyles[benchmark.tone],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", {
        "bg-destructive": benchmark.tone === "danger",
        "bg-warning": benchmark.tone === "warning",
        "bg-success": benchmark.tone === "success",
        "bg-info": benchmark.tone === "info",
        "bg-muted-foreground": benchmark.tone === "neutral",
      })} />
      {benchmark.label}
    </span>
  );
}
