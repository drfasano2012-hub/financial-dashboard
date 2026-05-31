import type { LifeModel, Decision, TimelineScenario, SimulationResult } from './types';

const INCOME_TAX_RATE = 0.28;
const ANNUAL_CHILD_COST = 15_000;
const DOWN_PAYMENT_PCT = 0.20;
const MORTGAGE_RATE_ANNUAL = 0.065;
const MORTGAGE_TERM_MONTHS = 360;
const GROWTH_BASE = 0.06;
const GROWTH_BEST = 0.08;
const GROWTH_WORST = 0.04;

function calcMonthlyMortgage(loan: number): number {
  const r = MORTGAGE_RATE_ANNUAL / 12;
  return (loan * r * Math.pow(1 + r, MORTGAGE_TERM_MONTHS)) / (Math.pow(1 + r, MORTGAGE_TERM_MONTHS) - 1);
}

function monthlyTakeHome(annual_income: number): number {
  return (annual_income * (1 - INCOME_TAX_RATE)) / 12;
}

export function calcMonthlyNet(model: LifeModel): number {
  return monthlyTakeHome(model.income) - model.monthly_spend;
}

export function calcPortfolio(model: LifeModel): number {
  return model.savings + model.investments - model.debt;
}

export function calcFINumber(monthly_spend: number): number {
  return monthly_spend * 12 * 25;
}

export function projectFreedom(
  age: number,
  portfolio: number,
  monthly_contribution: number,
  fi_number: number,
  annual_growth: number,
): { freedom_age: number | null; years: number | null } {
  if (portfolio >= fi_number) return { freedom_age: age, years: 0 };
  if (monthly_contribution <= 0) return { freedom_age: null, years: null };

  const r = Math.pow(1 + annual_growth, 1 / 12) - 1;
  let balance = portfolio;

  for (let m = 1; m <= 600; m++) {
    balance = balance * (1 + r) + monthly_contribution;
    if (balance >= fi_number) {
      const years = m / 12;
      return { freedom_age: age + years, years };
    }
  }

  return { freedom_age: null, years: null };
}

function projectNetWorth10yr(portfolio: number, monthly_net: number, annual_growth: number): number {
  const r = Math.pow(1 + annual_growth, 1 / 12) - 1;
  let balance = portfolio;
  for (let m = 0; m < 120; m++) {
    balance = balance * (1 + r) + Math.max(0, monthly_net);
  }
  return balance;
}

function buildScenario(
  model: LifeModel,
  portfolio: number,
  monthly_net: number,
  monthly_spend: number,
  annual_growth: number,
): TimelineScenario {
  const fi_number = calcFINumber(monthly_spend);
  const { freedom_age, years } = projectFreedom(model.age, portfolio, Math.max(0, monthly_net), fi_number, annual_growth);
  return {
    freedom_age,
    years_to_freedom: years,
    monthly_net,
    freedom_number: fi_number,
    net_worth_10yr: projectNetWorth10yr(portfolio, monthly_net, annual_growth),
  };
}

interface AppliedDecision {
  portfolio: number;
  monthly_net: number;
  monthly_spend: number;
  monthly_delta: number;
}

function applyDecision(model: LifeModel, decision: Decision): AppliedDecision {
  const portfolio = calcPortfolio(model);
  const base_net = calcMonthlyNet(model);
  let new_portfolio = portfolio;
  let new_monthly_net = base_net;
  let new_monthly_spend = model.monthly_spend;

  switch (decision.type) {
    case 'buy_home': {
      const price = decision.params.home_price ?? 400_000;
      const down = price * DOWN_PAYMENT_PCT;
      const mortgage = calcMonthlyMortgage(price * (1 - DOWN_PAYMENT_PCT));
      const housing_delta = mortgage - model.housing_cost;
      new_portfolio = Math.max(0, portfolio - down);
      new_monthly_spend = model.monthly_spend + housing_delta;
      new_monthly_net = base_net - housing_delta;
      break;
    }
    case 'change_jobs': {
      const pct = decision.params.income_change_pct ?? 20;
      new_monthly_net = monthlyTakeHome(model.income * (1 + pct / 100)) - model.monthly_spend;
      break;
    }
    case 'have_child': {
      const monthly_child = ANNUAL_CHILD_COST / 12;
      new_monthly_spend = model.monthly_spend + monthly_child;
      new_monthly_net = base_net - monthly_child;
      break;
    }
    case 'change_savings_rate': {
      const rate_pct = decision.params.new_savings_rate_pct ?? 20;
      const th = monthlyTakeHome(model.income);
      new_monthly_net = th * (rate_pct / 100);
      new_monthly_spend = th - new_monthly_net;
      break;
    }
  }

  return {
    portfolio: new_portfolio,
    monthly_net: new_monthly_net,
    monthly_spend: new_monthly_spend,
    monthly_delta: new_monthly_net - base_net,
  };
}

function fmt(n: number): string {
  return `$${Math.round(Math.abs(n)).toLocaleString()}`;
}

function fmtAge(a: number | null): string {
  return a === null ? 'more than 50 years away' : `age ${Math.round(a)}`;
}

function buildTradeoffs(
  decision: Decision,
  applied: AppliedDecision,
  delta_years: number | null,
): { money: string; time: string; risk: string } {
  const diff = applied.monthly_delta;

  const money = diff >= 50
    ? `Frees up ${fmt(diff)}/month for investing`
    : diff <= -50
    ? `Costs ${fmt(diff)}/month from your investable cash`
    : 'Minimal change to monthly cash flow';

  let time: string;
  if (delta_years === null) {
    time = 'Financial freedom becomes very hard to reach at current pace';
  } else if (Math.abs(delta_years) < 0.4) {
    time = 'Minimal impact on your freedom timeline';
  } else if (delta_years > 0) {
    time = `Pulls freedom ${delta_years.toFixed(1)} years closer`;
  } else {
    time = `Pushes freedom ${Math.abs(delta_years).toFixed(1)} years further out`;
  }

  let risk: string;
  switch (decision.type) {
    case 'buy_home':
      risk = 'Moderate — illiquid asset, market-dependent, but builds equity over time';
      break;
    case 'change_jobs':
      risk = (decision.params.income_change_pct ?? 0) >= 0
        ? 'Low to moderate — job transitions carry short-term uncertainty'
        : 'High — lower income is the hardest thing to recover from';
      break;
    case 'have_child':
      risk = 'High cash-flow impact for 18+ years; deeply personal trade-off';
      break;
    case 'change_savings_rate':
      risk = (decision.params.new_savings_rate_pct ?? 20) >= 20
        ? 'Low — consistent investing is the most reliable lever you have'
        : "Moderate — lower savings meaningfully extends your timeline";
      break;
    default:
      risk = 'Varies by outcome';
  }

  return { money, time, risk };
}

function buildExplanation(
  model: LifeModel,
  decision: Decision,
  baseline: TimelineScenario,
  after: TimelineScenario,
  applied: AppliedDecision,
  delta_years: number | null,
): string {
  let context = '';

  switch (decision.type) {
    case 'buy_home': {
      const price = decision.params.home_price ?? 400_000;
      const down = price * DOWN_PAYMENT_PCT;
      const mortgage = calcMonthlyMortgage(price * (1 - DOWN_PAYMENT_PCT));
      const diff = mortgage - model.housing_cost;
      context = `A ${fmt(price)} home requires a ${fmt(down)} down payment — cash that leaves your portfolio today and can no longer compound. Your monthly housing cost moves from ${fmt(model.housing_cost)} to roughly ${fmt(mortgage)}, a ${diff >= 0 ? 'net increase' : 'net decrease'} of ${fmt(Math.abs(diff))}/month. The home does build equity as you pay down the mortgage and (ideally) as prices appreciate — but that equity isn't investable until you sell. In the short-to-medium term, your freedom fund grows more slowly.`;
      break;
    }
    case 'change_jobs': {
      const pct = decision.params.income_change_pct ?? 20;
      const new_income = model.income * (1 + pct / 100);
      const dir = pct >= 0 ? 'raise' : 'pay cut';
      context = `A ${Math.abs(pct)}% ${dir} moves your annual income from ${fmt(model.income)} to ${fmt(new_income)}. Income is your most powerful lever. A raise that stays invested — rather than inflating your lifestyle — compounds dramatically over 10–20 years. ${pct < 0 ? `A pay cut reduces your monthly surplus by ${fmt(Math.abs(applied.monthly_delta))}/month — that's real time added to your freedom clock.` : `If you invest the full after-tax difference rather than spending it, you can buy years back.`}`;
      break;
    }
    case 'have_child': {
      context = `Having a child adds roughly $15,000/year in costs ($1,250/month) in the early years — covering childcare, healthcare, and essentials. This comes directly off your monthly surplus. Costs evolve over time: childcare gives way to school activities, then education. The financial commitment is real and long-lasting. This isn't a purely financial calculation, but knowing the trade-off helps you plan around it.`;
      break;
    }
    case 'change_savings_rate': {
      const rate = decision.params.new_savings_rate_pct ?? 20;
      const new_monthly = monthlyTakeHome(model.income) * (rate / 100);
      context = `Setting a ${rate}% savings rate means investing ${fmt(new_monthly)}/month. Savings rate is the single most controllable variable in your freedom timeline — more impactful than market returns, and more reliable than chasing income. ${rate >= 25 ? `At ${rate}%, you're in the fast lane toward financial freedom.` : rate >= 15 ? `At ${rate}%, you're building solid momentum.` : `Even at ${rate}%, consistent investing beats doing nothing.`}`;
      break;
    }
  }

  const impact =
    delta_years === null
      ? `At this pace, reaching financial freedom within a 50-year horizon is difficult. Increasing your monthly surplus is the priority.`
      : Math.abs(delta_years) < 0.4
      ? `Your freedom timeline stays roughly the same — around ${fmtAge(baseline.freedom_age)}.`
      : delta_years > 0
      ? `This moves your freedom age from ${fmtAge(baseline.freedom_age)} to about ${fmtAge(after.freedom_age)} — ${delta_years.toFixed(1)} years closer.`
      : `This pushes your freedom age from ${fmtAge(baseline.freedom_age)} to about ${fmtAge(after.freedom_age)} — ${Math.abs(delta_years).toFixed(1)} years further out.`;

  return `${context}\n\n${impact}`;
}

function buildRecommendation(model: LifeModel, decision: Decision, delta_years: number | null): string {
  const p = model.priorities;

  switch (decision.type) {
    case 'buy_home': {
      if (p.includes('freedom') && delta_years !== null && delta_years < -3) {
        return `Freedom is your top priority, and this home adds 3+ years to your timeline. Consider: a lower price point, a larger down payment to reduce the monthly mortgage, or waiting 1–2 years to grow income and savings first.`;
      }
      if (p.includes('family')) {
        return `Homeownership aligns with family stability. Keep at least 3–6 months of expenses liquid after closing. Budget 1–2% of the home's value annually for maintenance — it adds up.`;
      }
      return `Run the 28% rule: your monthly mortgage should ideally stay under 28% of your gross monthly income. That leaves room for investing alongside ownership.`;
    }
    case 'change_jobs': {
      const pct = decision.params.income_change_pct ?? 20;
      if (pct > 0) {
        if (p.includes('freedom')) {
          return `A raise is one of the most powerful moves you can make. Resist lifestyle inflation. Automate the extra income straight into investments the moment it hits your account — you'll never miss what you don't see.`;
        }
        return `Negotiate hard, then immediately increase your monthly automatic investments by the full after-tax raise amount. That single habit change is worth years of your time.`;
      } else {
        if (p.includes('career') || p.includes('health')) {
          return `A pay cut for career growth or wellbeing is a legitimate trade. Set a clear timeline (12–24 months) and a return trigger ($X salary again). Have 6+ months of runway before you jump.`;
        }
        return `Before taking a pay cut, make sure you have at least 6 months of expenses saved. Define exactly what you're getting in return — and have a plan to recover your income level.`;
      }
    }
    case 'have_child': {
      if (p.includes('family')) {
        return `This aligns with your family priority. Financially: aim for 6 months of expenses saved before birth, max out your dependent care FSA to reduce childcare costs, and start a 529 early — even $50/month compounds meaningfully.`;
      }
      return `Start building a dedicated child buffer 12–18 months before the expected date. Look into dependent care FSA, childcare subsidies, and 529 plans. The first 5 years are the most cash-intensive.`;
    }
    case 'change_savings_rate': {
      const rate = decision.params.new_savings_rate_pct ?? 20;
      if (rate >= 30) {
        return `Aggressive savings is the fastest path to freedom. Make sure your spending still covers genuine needs — burn-out from extreme frugality is real. Automate everything; use 401k and IRA first, then brokerage.`;
      }
      if (rate >= 20) {
        return `20%+ puts you in the top tier. Automate it, prioritize tax-advantaged accounts, and invest in low-cost index funds. Stay consistent through market dips — that's when the gains compound most.`;
      }
      return `A solid starting point. Try increasing by 1% every 3–6 months. It's barely noticeable in your budget but compounds dramatically over time. Automation removes the temptation to spend it.`;
    }
  }
}

export function simulate(model: LifeModel, decision: Decision): SimulationResult {
  const portfolio = calcPortfolio(model);
  const monthly_net = calcMonthlyNet(model);

  const baseline = buildScenario(model, portfolio, monthly_net, model.monthly_spend, GROWTH_BASE);

  const applied = applyDecision(model, decision);
  const base_case = buildScenario(model, applied.portfolio, applied.monthly_net, applied.monthly_spend, GROWTH_BASE);
  const best_case = buildScenario(model, applied.portfolio, applied.monthly_net * 1.15, applied.monthly_spend, GROWTH_BEST);
  const worst_case = buildScenario(model, applied.portfolio, applied.monthly_net * 0.85, applied.monthly_spend, GROWTH_WORST);

  let delta_years: number | null = null;
  if (baseline.years_to_freedom !== null && base_case.years_to_freedom !== null) {
    delta_years = baseline.years_to_freedom - base_case.years_to_freedom;
  }

  const tradeoffs = buildTradeoffs(decision, applied, delta_years);
  const explanation = buildExplanation(model, decision, baseline, base_case, applied, delta_years);
  const recommendation = buildRecommendation(model, decision, delta_years);

  return {
    model,
    decision,
    baseline,
    base_case,
    best_case,
    worst_case,
    delta_years,
    tradeoffs,
    explanation,
    recommendation,
  };
}
