import { FinancialInputs, Metrics } from "./types";
import { formatCurrency } from "./calculations";

export interface Recommendation {
  title: string;
  detail: string;
  priority: number;
  impact: "high" | "medium" | "low";
}

export interface RecommendationOutput {
  goingWell: string[];
  needsAttention: string[];
  topActions: Recommendation[];
}

export function generateRecommendations(
  input: FinancialInputs,
  metrics: Metrics,
): RecommendationOutput {
  const goingWell: string[] = [];
  const needsAttention: string[] = [];
  const candidates: Recommendation[] = [];

  // ----- What's going well -----
  if (metrics.savingsRate >= 15) goingWell.push(`Saving ${metrics.savingsRate.toFixed(0)}% of take-home — strong discipline.`);
  if (metrics.emergencyFundMonths >= 3) goingWell.push(`Emergency fund covers ${metrics.emergencyFundMonths.toFixed(1)} months — you're protected from shocks.`);
  if (metrics.highInterestDebt === 0 && metrics.totalDebt > 0) goingWell.push(`No high-interest debt — your debt mix is healthy.`);
  if (metrics.totalDebt === 0) goingWell.push(`Completely debt-free — full flexibility to build wealth.`);
  if (metrics.monthlySurplus > 0) goingWell.push(`Positive monthly cash flow of ${formatCurrency(metrics.monthlySurplus)}.`);
  if (metrics.netWorth > 0) goingWell.push(`Positive net worth of ${formatCurrency(metrics.netWorth)} — assets outweigh liabilities.`);
  if (input.investments > 0) goingWell.push(`You're invested — time in market is your biggest ally.`);

  // ----- What needs attention -----
  if (metrics.monthlySurplus < 0) needsAttention.push(`Monthly deficit of ${formatCurrency(Math.abs(metrics.monthlySurplus))} — spending exceeds income.`);
  if (metrics.savingsRate < 10) needsAttention.push(`Savings rate below 10% — limits long-term wealth building.`);
  if (metrics.emergencyFundMonths < 3) needsAttention.push(`Emergency fund only ${metrics.emergencyFundMonths.toFixed(1)} months — vulnerable to income disruption.`);
  if (metrics.highInterestDebt > 0) needsAttention.push(`${formatCurrency(metrics.highInterestDebt)} in high-interest debt is silently eroding wealth.`);
  if (metrics.netWorth < 0) needsAttention.push(`Net worth is negative — liabilities exceed assets.`);
  if (input.investments === 0 && metrics.investingReadiness !== "Low") needsAttention.push(`No investments yet — you're missing compounding growth.`);

  // ----- Priority actions (in order) -----
  // 1. Fix deficit
  if (metrics.monthlySurplus < 0) {
    candidates.push({
      priority: 1,
      impact: "high",
      title: "Eliminate your monthly deficit",
      detail: `Cut ${formatCurrency(Math.abs(metrics.monthlySurplus))}/mo of spending or grow income. Nothing else matters until cash flow turns positive.`,
    });
  }

  // 2. Starter emergency fund
  if (metrics.emergencyFundMonths < 1 && input.monthlySpending > 0) {
    candidates.push({
      priority: 2,
      impact: "high",
      title: "Build a starter emergency fund",
      detail: `Save ${formatCurrency(input.monthlySpending)} (1 month of expenses) in a high-yield savings account before tackling debt aggressively.`,
    });
  }

  // 3. Crush high-interest debt
  if (metrics.highInterestDebt > 0) {
    const top = [...input.debts].filter((d) => d.rate > 10).sort((a, b) => b.rate - a.rate)[0];
    candidates.push({
      priority: 3,
      impact: "high",
      title: `Pay off high-interest debt`,
      detail: top
        ? `Attack "${top.name}" first (${top.rate}% APR, ${formatCurrency(top.balance)}). Avalanche method saves the most interest.`
        : `Direct surplus toward highest-rate balances first.`,
    });
  }

  // 4. Full emergency fund
  if (metrics.emergencyFundMonths >= 1 && metrics.emergencyFundMonths < 3 && metrics.highInterestDebt === 0) {
    candidates.push({
      priority: 4,
      impact: "medium",
      title: "Grow emergency fund to 3 months",
      detail: `Target ${formatCurrency(input.monthlySpending * 3)} total. This is your shield against job loss or unexpected costs.`,
    });
  }

  // 5. Increase savings rate
  if (metrics.savingsRate < 15 && metrics.monthlySurplus >= 0) {
    candidates.push({
      priority: 5,
      impact: "medium",
      title: "Push savings rate above 15%",
      detail: `Currently ${metrics.savingsRate.toFixed(0)}%. Automate transfers on payday — pay yourself first.`,
    });
  }

  // 6. Start/increase investing
  if (metrics.investingReadiness !== "Low") {
    if (input.investments === 0) {
      candidates.push({
        priority: 6,
        impact: "high",
        title: "Open a retirement account",
        detail: `Start with employer 401(k) match (free money) or a Roth IRA. Even $200/mo compounds significantly over decades.`,
      });
    } else if (metrics.savingsRate >= 15) {
      candidates.push({
        priority: 7,
        impact: "medium",
        title: "Increase tax-advantaged contributions",
        detail: `You have the foundation — push 401(k)/IRA contributions toward annual maximums.`,
      });
    }
  }

  // 7. Net worth tracking
  if (candidates.length < 3) {
    candidates.push({
      priority: 8,
      impact: "low",
      title: "Track net worth monthly",
      detail: `The single best long-term signal of progress. Re-run this checkup every 30 days.`,
    });
  }

  // Defaults if nothing else
  if (goingWell.length === 0) goingWell.push("You took the first step — measuring your finances. That's how every wealth journey starts.");
  if (needsAttention.length === 0) needsAttention.push("No major red flags — keep optimizing the margins.");

  const topActions = candidates.sort((a, b) => a.priority - b.priority).slice(0, 3);

  return { goingWell, needsAttention, topActions };
}
