
-- Monthly emission summaries: stores per-category breakdown for each user/month
CREATE TABLE public.monthly_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year integer NOT NULL CHECK (year >= 2020),
  transport_kg numeric NOT NULL DEFAULT 0,
  electricity_kg numeric NOT NULL DEFAULT 0,
  cooking_kg numeric NOT NULL DEFAULT 0,
  food_kg numeric NOT NULL DEFAULT 0,
  water_kg numeric NOT NULL DEFAULT 0,
  waste_kg numeric NOT NULL DEFAULT 0,
  total_kg numeric NOT NULL DEFAULT 0,
  carbon_credits numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, month, year)
);

-- Indexes for fast lookups
CREATE INDEX idx_monthly_summaries_user_id ON public.monthly_summaries (user_id);
CREATE INDEX idx_monthly_summaries_year_month ON public.monthly_summaries (year, month);

-- Enable RLS
ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own summaries"
  ON public.monthly_summaries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own summaries"
  ON public.monthly_summaries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own summaries"
  ON public.monthly_summaries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE TRIGGER update_monthly_summaries_updated_at
  BEFORE UPDATE ON public.monthly_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
