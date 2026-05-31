export type Priority = 'freedom' | 'family' | 'career' | 'health';

export interface LifeModel {
  age: number;
  income: number;           // annual gross
  monthly_spend: number;    // all monthly expenses
  savings: number;          // liquid cash
  investments: number;      // invested assets
  debt: number;             // total non-mortgage debt
  housing_cost: number;     // current monthly rent or mortgage
  retirement_goal_age: number;
  priorities: Priority[];
}

export type DecisionType = 'buy_home' | 'change_jobs' | 'have_child' | 'change_savings_rate';

export interface Decision {
  type: DecisionType;
  label: string;
  params: Record<string, number>;
}

export interface TimelineScenario {
  freedom_age: number | null;
  years_to_freedom: number | null;
  monthly_net: number;
  freedom_number: number;
  net_worth_10yr: number;
}

export interface SimulationResult {
  model: LifeModel;
  decision: Decision;
  baseline: TimelineScenario;
  base_case: TimelineScenario;
  best_case: TimelineScenario;
  worst_case: TimelineScenario;
  delta_years: number | null;
  tradeoffs: {
    money: string;
    time: string;
    risk: string;
  };
  explanation: string;
  recommendation: string;
}
