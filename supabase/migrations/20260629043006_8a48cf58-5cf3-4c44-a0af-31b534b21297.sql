
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  status TEXT NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  description TEXT,
  receipt_number TEXT NOT NULL,
  environment TEXT NOT NULL,
  raw_event JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_donations_session ON public.donations(stripe_session_id);
CREATE INDEX idx_donations_email ON public.donations(customer_email);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view donations"
  ON public.donations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages donations"
  ON public.donations FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
