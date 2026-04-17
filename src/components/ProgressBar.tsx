import { cn } from "@/lib/utils";

export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2 text-xs font-medium">
        <span className="text-muted-foreground">Step {current} of {total}</span>
        <span className="text-accent">{Math.round(pct)}% complete</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full bg-gradient-accent transition-all duration-500 ease-out rounded-full")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
