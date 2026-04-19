import { Metrics } from "./types";

export interface HealthScore {
  score: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  label: string;
  tone: "success" | "warning" | "danger";
  breakdown: { label: string; value: number; max: number }[];
}

/**
 * Composite financial health score (0-100), weighted across 5 pillars.
 * Take-home pay drives the savings-rate pillar, which is now the heaviest.
 * - Savings rate (% of take-home saved)  35
 * - Emergency fund                       25
 * - Debt health                          15
 * - Net worth posture                    10
 * - Investing readiness                  15
 */
export function calculateHealthScore(m: Metrics): HealthScore {
  // Savings rate: 35 pts max at 25%+ of take-home
  const savings = Math.max(0, Math.min(35, (m.savingsRate / 25) * 35));

  // Emergency fund: 25 pts max at 6 months
  const emergency = Math.max(0, Math.min(25, (m.emergencyFundMonths / 6) * 25));

  // Debt: 15 pts. Full pts if no debt or weighted rate < 5%, scales down.
  let debt = 15;
  if (m.totalDebt > 0) {
    if (m.weightedDebtRate > 10) debt = 4;
    else if (m.weightedDebtRate >= 6) debt = 9;
    else debt = 13;
    if (m.highInterestDebt > 0) debt = Math.min(debt, 6);
  }

  // Net worth: 10 pts. Negative = 0, 0-10k = 5, >10k = 10.
  const networth = m.netWorth < 0 ? 0 : m.netWorth < 10000 ? 5 : 10;

  // Investing readiness: 15 pts.
  const investing =
    m.investingReadiness === "Strong" ? 15 : m.investingReadiness === "Moderate" ? 9 : 3;

  const score = Math.round(savings + emergency + debt + networth + investing);

  const grade: HealthScore["grade"] =
    score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : score >= 40 ? "D" : "F";

  const label =
    score >= 85
      ? "Excellent"
      : score >= 70
      ? "Strong"
      : score >= 55
      ? "Fair"
      : score >= 40
      ? "Needs Work"
      : "At Risk";

  const tone: HealthScore["tone"] = score >= 70 ? "success" : score >= 40 ? "warning" : "danger";

  return {
    score,
    grade,
    label,
    tone,
    breakdown: [
      { label: "Savings rate (of take-home)", value: Math.round(savings), max: 35 },
      { label: "Emergency fund", value: Math.round(emergency), max: 25 },
      { label: "Debt health", value: Math.round(debt), max: 15 },
      { label: "Net worth", value: Math.round(networth), max: 10 },
      { label: "Investing readiness", value: Math.round(investing), max: 15 },
    ],
  };
}
