export type RiskTolerance = "conservative" | "moderate" | "aggressive";

export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  rate: number; // APR percent
}

export interface Goal {
  id: string;
  label: string;
  horizon: "short" | "mid" | "long";
}

export interface FinancialInputs {
  annualIncome: number;
  monthlyTakeHome: number;
  monthlySpending: number;
  cashSavings: number;
  /** Total invested across all buckets — derived from retirement + brokerage + hsa. Kept for back-compat. */
  investments: number;
  retirementAccounts: number; // 401k, IRA, Roth
  brokerageAccounts: number;  // taxable
  hsaAccounts: number;        // HSA
  debts: DebtItem[];
  goals: Goal[];
  riskTolerance: RiskTolerance;
}

export type BenchmarkLabel =
  | "Behind"
  | "Baseline"
  | "Strong"
  | "Wealth Builder"
  | "High Risk"
  | "Needs Work"
  | "Healthy"
  | "Urgent"
  | "Moderate"
  | "Manageable"
  | "None"
  | "Low"
  | "Strong Ready";

export type BenchmarkTone = "danger" | "warning" | "success" | "info" | "neutral";

export interface Benchmark {
  value: number;
  display: string;
  label: BenchmarkLabel | string;
  tone: BenchmarkTone;
  explanation: string;
  range: string;
}

export interface Metrics {
  savingsRate: number; // % of take-home saved each month
  monthlySurplus: number;
  emergencyFundMonths: number;
  netWorth: number;
  totalInvestments: number;
  totalDebt: number;
  weightedDebtRate: number; // %
  highInterestDebt: number;
  investingReadiness: "Low" | "Moderate" | "Strong";
}
