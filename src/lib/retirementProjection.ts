import type { FinancialInputs, Metrics } from "./types";

export interface RetirementProjection {
  /** Estimated age the user could stop working based on current trajectory */
  retirementAge: number | null;
  /** Years from today */
  yearsToFreedom: number | null;
  /** The portfolio target ($) using the 4% rule on current annual spending */
  freedomNumber: number;
  /** Real return assumption used (after inflation) */
  realReturn: number;
  /** Withdrawal rate used */
  withdrawalRate: number;
  /** Assumed current age (default 30 if not provided) */
  assumedAge: number;
  /** Whether the projection was capped (>= 50 years out) */
  capped: boolean;
  /** Plain-English status */
  status: "on_track" | "tight" | "needs_work" | "no_surplus";
}

const DEFAULT_AGE = 30;
const REAL_RETURN = 0.07; // 7% real
const WITHDRAWAL_RATE = 0.04; // 4% safe withdrawal rule
const MAX_YEARS = 50;

export function projectRetirement(
  inputs: FinancialInputs,
  metrics: Metrics,
  currentAge: number = DEFAULT_AGE,
): RetirementProjection {
  const annualSpending = inputs.monthlySpending * 12;
  const freedomNumber = annualSpending / WITHDRAWAL_RATE;
  const monthlyContribution = Math.max(0, metrics.monthlySurplus);
  const startingBalance = metrics.totalInvestments;
  const monthlyRate = REAL_RETURN / 12;

  // No surplus and not enough already invested → can't project a path
  if (monthlyContribution === 0 && startingBalance < freedomNumber) {
    return {
      retirementAge: null,
      yearsToFreedom: null,
      freedomNumber,
      realReturn: REAL_RETURN,
      withdrawalRate: WITHDRAWAL_RATE,
      assumedAge: currentAge,
      capped: false,
      status: "no_surplus",
    };
  }

  let balance = startingBalance;
  let yearsToFreedom: number | null = null;

  if (balance >= freedomNumber) {
    yearsToFreedom = 0;
  } else {
    for (let m = 1; m <= MAX_YEARS * 12; m++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
      if (balance >= freedomNumber) {
        yearsToFreedom = m / 12;
        break;
      }
    }
  }

  if (yearsToFreedom === null) {
    return {
      retirementAge: null,
      yearsToFreedom: null,
      freedomNumber,
      realReturn: REAL_RETURN,
      withdrawalRate: WITHDRAWAL_RATE,
      assumedAge: currentAge,
      capped: true,
      status: "needs_work",
    };
  }

  const retirementAge = currentAge + yearsToFreedom;
  let status: RetirementProjection["status"];
  if (retirementAge <= 55) status = "on_track";
  else if (retirementAge <= 65) status = "tight";
  else status = "needs_work";

  return {
    retirementAge,
    yearsToFreedom,
    freedomNumber,
    realReturn: REAL_RETURN,
    withdrawalRate: WITHDRAWAL_RATE,
    assumedAge: currentAge,
    capped: false,
    status,
  };
}
