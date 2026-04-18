import { LucideIcon, Shield, PiggyBank, CreditCard, TrendingUp, Target, Brain, DollarSign, Home } from "lucide-react";

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  body: string[];
  takeaways: string[];
}

export interface LearnTopic {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  readMinutes: number;
  lessons: Lesson[];
}

export const LEARN_TOPICS: LearnTopic[] = [
  {
    id: "foundations",
    title: "The 5 Foundations",
    description: "The order of operations that solves 80% of personal finance.",
    icon: Target,
    readMinutes: 4,
    lessons: [
      {
        id: "order-of-operations",
        title: "Personal finance order of operations",
        summary: "Do these in order. Don't skip ahead.",
        body: [
          "Most people fail at money not because they don't earn enough — but because they do things in the wrong order. Investing while paying 24% on a credit card is mathematically a losing trade.",
          "Follow this sequence:",
          "1. Build a $1,000 starter emergency fund.",
          "2. Capture your full 401(k) employer match (free money).",
          "3. Pay off all debt above ~7% APR (credit cards, payday loans).",
          "4. Build a 3–6 month emergency fund in a high-yield savings account.",
          "5. Max tax-advantaged accounts (Roth IRA, HSA, 401k).",
          "6. Invest in a taxable brokerage for goals beyond retirement.",
        ],
        takeaways: [
          "Get the 401k match before paying extra on debt — the match beats every interest rate.",
          "Don't invest in a brokerage while carrying credit card debt.",
          "A real emergency fund is the difference between a setback and a spiral.",
        ],
      },
    ],
  },
  {
    id: "emergency-fund",
    title: "Emergency Fund",
    description: "Why cash matters more than returns when life punches.",
    icon: Shield,
    readMinutes: 3,
    lessons: [
      {
        id: "why-cash",
        title: "Why an emergency fund > investing returns",
        summary: "The math on avoiding one bad month.",
        body: [
          "An emergency fund isn't about earning return — it's about not destroying your wealth when life happens.",
          "Without one, a $2,000 car repair becomes credit card debt at 24% APR. That single event can erase a year of your investment gains.",
          "Where to keep it: a high-yield savings account (4–5% APY currently). Not in stocks, not in a checking account paying 0%.",
          "How much: 3 months of essential spending if your income is stable; 6+ months if you're self-employed, single-income, or in a volatile industry.",
        ],
        takeaways: [
          "$1,000 starter fund first, then build to 3–6 months.",
          "Use a separate HYSA you can't see in your daily app.",
          "Replenish immediately after using it.",
        ],
      },
    ],
  },
  {
    id: "debt",
    title: "Debt Strategy",
    description: "Avalanche vs snowball — and when high-interest debt becomes an emergency.",
    icon: CreditCard,
    readMinutes: 4,
    lessons: [
      {
        id: "avalanche-vs-snowball",
        title: "Avalanche vs snowball: which works for you",
        summary: "Math says one thing, psychology often says another.",
        body: [
          "Avalanche: pay minimums on everything, throw all extra money at the highest APR debt. Mathematically optimal — saves the most interest.",
          "Snowball: pay minimums on everything, throw extra at the smallest balance. Emotionally powerful — quick wins build momentum.",
          "Studies (e.g., HBR 2016) show people who use snowball are more likely to actually finish paying off debt. The 'best' method is the one you'll stick to.",
          "Either way: any debt above ~7-8% APR should be treated like a financial emergency. You won't reliably out-earn it in the market.",
        ],
        takeaways: [
          "Avalanche = lowest cost. Snowball = highest completion rate.",
          "Treat anything >7% APR as urgent.",
          "Don't take on new debt while paying off old debt.",
        ],
      },
    ],
  },
  {
    id: "investing",
    title: "Investing Basics",
    description: "Index funds, time horizons, and ignoring the noise.",
    icon: TrendingUp,
    readMinutes: 5,
    lessons: [
      {
        id: "index-funds",
        title: "Why low-cost index funds beat ~85% of pros",
        summary: "Boring beats brilliant over 30 years.",
        body: [
          "An index fund buys a tiny slice of every company in a market (e.g., the S&P 500). You don't pick winners — you own them all.",
          "Over 15+ year horizons, ~85% of actively managed funds underperform their index after fees (SPIVA report). The fees compound against you.",
          "A 1% annual fee on a $100k portfolio over 30 years costs ~$300k in lost growth vs a 0.04% index fund.",
          "Simple starter portfolio: 80% US/global stock index + 20% bond index, adjusted by age and risk tolerance.",
        ],
        takeaways: [
          "Lower fees = more money for you.",
          "Time in market beats timing the market.",
          "Boring index funds outperform exciting stock picks for most people.",
        ],
      },
    ],
  },
  {
    id: "savings-rate",
    title: "Savings Rate",
    description: "The single most important number in personal finance.",
    icon: PiggyBank,
    readMinutes: 3,
    lessons: [
      {
        id: "rate-not-amount",
        title: "Your savings rate, not your salary, decides when you retire",
        summary: "A 50% saver retires in ~17 years. A 10% saver, 51 years.",
        body: [
          "Your savings rate (% of take-home you save) is more important than how much you earn. Two people earning the same can retire decades apart.",
          "Mr. Money Mustache's classic table (assuming 5% real returns, 4% withdrawal):",
          "• 10% savings rate → 51 years to retirement",
          "• 25% savings rate → 32 years",
          "• 50% savings rate → 17 years",
          "• 75% savings rate → 7 years",
          "Every percentage point you save lengthens your runway and shortens your working years.",
        ],
        takeaways: [
          "Aim for 20%+ as a baseline; raise it as income grows.",
          "When you get a raise, save 50% of it.",
          "Cutting recurring expenses beats one-time wins.",
        ],
      },
    ],
  },
  {
    id: "psychology",
    title: "Money Psychology",
    description: "Why we make irrational money decisions — and how to short-circuit them.",
    icon: Brain,
    readMinutes: 4,
    lessons: [
      {
        id: "lifestyle-creep",
        title: "Lifestyle creep is the silent wealth killer",
        summary: "Every raise can become invisible if you don't catch it.",
        body: [
          "Lifestyle creep: each time your income rises, your spending quietly rises to match. Result: you're always ~1 month from broke regardless of salary.",
          "Counter it with the 50/50 raise rule: when you get a raise, immediately direct 50% to savings/investing before lifestyle adjusts.",
          "Automate the savings transfer the day after payday. If you have to decide each month, you'll lose.",
          "Audit subscriptions every 6 months. Most people pay for 2–3 services they no longer use.",
        ],
        takeaways: [
          "Save 50% of every raise.",
          "Automate so willpower isn't required.",
          "What you don't see, you don't spend.",
        ],
      },
    ],
  },
  {
    id: "retirement",
    title: "Retirement Accounts",
    description: "401k, Roth IRA, HSA — when to use which.",
    icon: DollarSign,
    readMinutes: 4,
    lessons: [
      {
        id: "account-priority",
        title: "The order to fund retirement accounts",
        summary: "Free money first, then tax-free, then tax-deferred.",
        body: [
          "1. 401(k) up to the employer match. This is a 50–100% instant return — nothing else competes.",
          "2. HSA if you have a high-deductible health plan. Triple tax-advantaged: deductible going in, tax-free growth, tax-free for medical.",
          "3. Roth IRA up to the limit ($7,000 in 2024 if under 50). Tax-free growth and withdrawals.",
          "4. Back to 401(k) up to the limit ($23,000 in 2024 if under 50).",
          "5. Taxable brokerage for everything beyond.",
          "Roth makes sense when you expect higher income/taxes in retirement than today. Traditional 401k makes sense when you expect lower.",
        ],
        takeaways: [
          "Always grab the full employer match.",
          "HSA is the best account most people ignore.",
          "Roth IRA gives you flexibility — contributions can be withdrawn penalty-free.",
        ],
      },
    ],
  },
  {
    id: "housing",
    title: "Housing Math",
    description: "Rent vs buy isn't a moral question — it's a math question.",
    icon: Home,
    readMinutes: 4,
    lessons: [
      {
        id: "true-cost",
        title: "The true cost of owning a home",
        summary: "It's not just the mortgage payment.",
        body: [
          "Renters often hear 'you're throwing money away.' The reality is more nuanced.",
          "Owners pay: mortgage interest, property tax (1–2.5%/yr), maintenance (~1%/yr), insurance, HOA, transaction costs (~10% to buy/sell). Plus opportunity cost on the down payment.",
          "Rule of thumb: only buy if you'll stay 5+ years and the monthly cost (PITI + maintenance) is within ~25% of take-home.",
          "Use a rent-vs-buy calculator (NYT has a great one) for your specific market — the answer varies dramatically by city and time horizon.",
        ],
        takeaways: [
          "Owning isn't always 'building wealth' — sometimes it's just paying interest and tax.",
          "Plan to stay 5+ years to amortize transaction costs.",
          "Your home should be a place to live, not your primary investment.",
        ],
      },
    ],
  },
];
