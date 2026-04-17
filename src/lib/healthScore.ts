import { Metrics } from "./types";

export interface HealthScore {
  score: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  label: string;
  tone: "success" | "warning" | "danger";
  breakdown: { label: string; value: number; max: number }[];
}

/**
 * Composite financial health score (0-100), weighted across 5 pillars:
 * - Savings rate (25)
 * - Emergency fund (25)
 * - Debt health (20)
 * - Net worth posture (15)
 * - Investing readiness (15)
 */
export function calculateHealthScore(m: Metrics): HealthScore {
  // Savings rate: 25 pts max at 25%+
  const savings = Math.max(0, Math.min(25, (m.savingsRate / 25) * 25));

  // Emergency fund: 25 pts max at 6 months
  const emergency = Math.max(0, Math.min(25, (m.emergencyFundMonths / 6) * 25));

  // Debt: 20 pts. Full pts if no debt or weighted rate < 5%, scales down.
  let debt = 20;
  if (m.totalDebt > 0) {
    if (m.weightedDebtRate > 10) debt = 5;
    else if (m.weightedDebtRate >= 6) debt = 12;
    else debt = 18;
    if (m.highInterestDebt > 0) debt = Math.min(debt, 8);
  }

  // Net worth: 15 pts. Negative = 0, 0-10k = 7, >10k = 15.
  const networth = m.netWorth < 0 ? 0 : m.netWorth < 10000 ? 7 : 15;

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
      { label: "Savings rate", value: Math.round(savings), max: 25 },
      { label: "Emergency fund", value: Math.round(emergency), max: 25 },
      { label: "Debt health", value: Math.round(debt), max: 20 },
      { label: "Net worth", value: Math.round(networth), max: 15 },
      { label: "Investing readiness", value: Math.round(investing), max: 15 },
    ],
  };
}
