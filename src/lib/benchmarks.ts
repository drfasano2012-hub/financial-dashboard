import { Benchmark, Metrics } from "./types";
import { formatCurrency, formatPercent } from "./calculations";

export function savingsRateBenchmark(rate: number): Benchmark {
  let label: string, tone: Benchmark["tone"], explanation: string;
  if (rate < 10) {
    label = "Behind";
    tone = "danger";
    explanation = "Most experts recommend saving at least 10–15% of take-home pay. Look for spending categories to trim.";
  } else if (rate < 15) {
    label = "Baseline";
    tone = "warning";
    explanation = "You're on the recommended track. Push toward 15–20% to accelerate goals.";
  } else if (rate < 25) {
    label = "Strong";
    tone = "success";
    explanation = "Excellent rate — you're building real momentum toward financial independence.";
  } else {
    label = "Wealth Builder";
    tone = "success";
    explanation = "Outstanding. You're saving at a rate that compounds dramatically over time.";
  }
  return {
    value: rate,
    display: formatPercent(rate),
    label,
    tone,
    explanation,
    range: "Target: 15–25%+",
  };
}

export function emergencyFundBenchmark(months: number): Benchmark {
  let label: string, tone: Benchmark["tone"], explanation: string;
  if (months < 1) {
    label = "High Risk";
    tone = "danger";
    explanation = "Less than 1 month of expenses leaves you vulnerable to any income shock. Prioritize building this.";
  } else if (months < 3) {
    label = "Needs Work";
    tone = "warning";
    explanation = "You have a starter buffer — aim for 3 months of essential expenses next.";
  } else if (months < 6) {
    label = "Healthy";
    tone = "success";
    explanation = "Solid emergency cushion. Consider 6 months if your income is variable.";
  } else {
    label = "Strong";
    tone = "success";
    explanation = "Excellent runway. Excess cash beyond 6 months may be better invested.";
  }
  return {
    value: months,
    display: `${months.toFixed(1)} mo`,
    label,
    tone,
    explanation,
    range: "Target: 3–6 months",
  };
}

export function debtBenchmark(weightedRate: number, totalDebt: number): Benchmark {
  if (totalDebt === 0) {
    return {
      value: 0,
      display: "Debt-free",
      label: "None",
      tone: "success",
      explanation: "No debt — you have full flexibility to invest and save aggressively.",
      range: "0% interest",
    };
  }
  let label: string, tone: Benchmark["tone"], explanation: string;
  if (weightedRate > 10) {
    label = "Urgent";
    tone = "danger";
    explanation = "High-interest debt erodes wealth fast. Pay this down before investing aggressively.";
  } else if (weightedRate >= 6) {
    label = "Moderate";
    tone = "warning";
    explanation = "Mid-rate debt — balance paydown with continued investing.";
  } else {
    label = "Manageable";
    tone = "success";
    explanation = "Low-rate debt. Continue minimum payments and prioritize investing.";
  }
  return {
    value: weightedRate,
    display: formatPercent(weightedRate),
    label,
    tone,
    explanation,
    range: "Target: < 6% weighted",
  };
}

export function netWorthBenchmark(netWorth: number): Benchmark {
  const tone: Benchmark["tone"] =
    netWorth < 0 ? "danger" : netWorth < 10000 ? "warning" : "success";
  const label = netWorth < 0 ? "Negative" : netWorth < 10000 ? "Building" : "Growing";
  const explanation =
    netWorth < 0
      ? "Liabilities exceed assets. Focus on debt paydown to flip this."
      : "Track this monthly — consistent growth is the single best signal of progress.";
  return {
    value: netWorth,
    display: formatCurrency(netWorth),
    label,
    tone,
    explanation,
    range: "Goal: grow monthly",
  };
}

export function surplusBenchmark(surplus: number): Benchmark {
  const tone: Benchmark["tone"] = surplus < 0 ? "danger" : surplus < 200 ? "warning" : "success";
  const label = surplus < 0 ? "Deficit" : surplus < 200 ? "Tight" : "Surplus";
  const explanation =
    surplus < 0
      ? "You're spending more than you earn each month. This must be reversed first."
      : "Positive cash flow is the engine of every financial goal.";
  return {
    value: surplus,
    display: formatCurrency(surplus) + "/mo",
    label,
    tone,
    explanation,
    range: "Always positive",
  };
}

export function investingReadinessBenchmark(metrics: Metrics): Benchmark {
  const r = metrics.investingReadiness;
  const tone: Benchmark["tone"] = r === "Strong" ? "success" : r === "Moderate" ? "warning" : "danger";
  const explanation =
    r === "Strong"
      ? "Foundation is set — emergency fund and high-interest debt under control. Maximize tax-advantaged accounts."
      : r === "Moderate"
      ? "Partial foundation. Shore up emergency fund and high-interest debt before increasing investments."
      : "Build the foundation first: emergency fund, eliminate high-interest debt, then invest.";
  return {
    value: r === "Strong" ? 3 : r === "Moderate" ? 2 : 1,
    display: r,
    label: r,
    tone,
    explanation,
    range: "Foundation → Invest",
  };
}
