import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { HealthScore } from "@/lib/healthScore";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

interface HealthScoreCardProps {
  score: HealthScore;
}

export function HealthScoreCard({ score }: HealthScoreCardProps) {
  const animatedScore = useCountUp(score.score, 1100);
  const displayScore = Math.round(animatedScore);

  const ringColor = useMemo(() => {
    if (score.tone === "success") return "hsl(var(--success))";
    if (score.tone === "warning") return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  }, [score.tone]);

  // SVG ring math
  const size = 140;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-6 md:p-8 shadow-md-soft">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
        {/* Ring */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="hsl(var(--secondary))"
              strokeWidth={stroke}
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={ringColor}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke 0.4s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold tracking-tight text-foreground tabular-nums">
              {displayScore}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              / 100
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Overall Financial Health
            </p>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            {score.label}
            <span
              className={cn(
                "ml-3 inline-flex items-center justify-center rounded-md px-2.5 py-1 text-base font-bold",
                score.tone === "success" && "bg-success-soft text-success",
                score.tone === "warning" && "bg-warning-soft text-warning",
                score.tone === "danger" && "bg-destructive-soft text-destructive",
              )}
            >
              Grade {score.grade}
            </span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A composite score across savings, emergency fund, debt, net worth, and investing readiness.
          </p>

          {/* Breakdown */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-3">
            {score.breakdown.map((b) => (
              <div key={b.label} className="rounded-md border border-border bg-card/60 p-2.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide truncate">
                  {b.label}
                </p>
                <p className="text-sm font-bold text-foreground mt-1 tabular-nums">
                  {b.value}
                  <span className="text-muted-foreground font-normal">/{b.max}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
