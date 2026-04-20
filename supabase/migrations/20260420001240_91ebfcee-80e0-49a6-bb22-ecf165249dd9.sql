CREATE TABLE public.financial_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  inputs JSONB NOT NULL,
  net_worth NUMERIC NOT NULL DEFAULT 0,
  savings_rate NUMERIC NOT NULL DEFAULT 0,
  health_score NUMERIC NOT NULL DEFAULT 0,
  cash_savings NUMERIC NOT NULL DEFAULT 0,
  total_investments NUMERIC NOT NULL DEFAULT 0,
  total_debt NUMERIC NOT NULL DEFAULT 0,
  monthly_take_home NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own snapshots"
  ON public.financial_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own snapshots"
  ON public.financial_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_financial_snapshots_user_created
  ON public.financial_snapshots (user_id, created_at DESC);