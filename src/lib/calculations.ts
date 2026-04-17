import { FinancialInputs, Metrics } from "./types";

export function calculateMetrics(input: FinancialInputs): Metrics {
  const { monthlyTakeHome, monthlySpending, cashSavings, investments, debts } = input;

  const monthlySurplus = monthlyTakeHome - monthlySpending;
  const savingsRate = monthlyTakeHome > 0 ? (monthlySurplus / monthlyTakeHome) * 100 : 0;
  const emergencyFundMonths = monthlySpending > 0 ? cashSavings / monthlySpending : 0;
  const totalDebt = debts.reduce((sum, d) => sum + (d.balance || 0), 0);
  const netWorth = cashSavings + investments - totalDebt;

  const weightedDebtRate =
    totalDebt > 0
      ? debts.reduce((sum, d) => sum + (d.balance || 0) * (d.rate || 0), 0) / totalDebt
      : 0;

  const highInterestDebt = debts
    .filter((d) => (d.rate || 0) > 10)
    .reduce((sum, d) => sum + (d.balance || 0), 0);

  // Investing readiness: emergency fund covered, no high-interest debt, positive surplus
  let readinessScore = 0;
  if (emergencyFundMonths >= 3) readinessScore++;
  if (highInterestDebt === 0) readinessScore++;
  if (monthlySurplus > 0) readinessScore++;
  if (investments > 0) readinessScore++;

  const investingReadiness: Metrics["investingReadiness"] =
    readinessScore >= 3 ? "Strong" : readinessScore >= 2 ? "Moderate" : "Low";

  return {
    savingsRate,
    monthlySurplus,
    emergencyFundMonths,
    netWorth,
    totalDebt,
    weightedDebtRate,
    highInterestDebt,
    investingReadiness,
  };
}

export function formatCurrency(n: number): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return `${sign}$${abs.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}
