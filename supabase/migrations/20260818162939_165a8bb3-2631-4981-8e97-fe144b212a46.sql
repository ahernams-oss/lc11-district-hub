CREATE TABLE public.campanhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  slug text NOT NULL UNIQUE,
  descricao text,
  conteudo text,
  imagem_url text,
  meta_cents bigint NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campanhas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campanhas TO authenticated;
GRANT ALL ON public.campanhas TO service_role;
ALTER TABLE public.campanhas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campanhas_public_read" ON public.campanhas FOR SELECT USING (ativo = true);
CREATE POLICY "campanhas_editors_manage" ON public.campanhas FOR ALL TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));
CREATE TRIGGER campanhas_touch BEFORE UPDATE ON public.campanhas FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS inscricao_valor_cents bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inscricao_ativa boolean NOT NULL DEFAULT false;

ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'doacao_unica',
  ADD COLUMN IF NOT EXISTS reference_id uuid,
  ADD COLUMN IF NOT EXISTS reference_label text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

CREATE TABLE public.event_inscricoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  event_titulo text NOT NULL,
  nome text,
  email text,
  telefone text,
  clube text,
  valor_cents bigint NOT NULL DEFAULT 0,
  quantidade integer NOT NULL DEFAULT 1,
  stripe_session_id text NOT NULL UNIQUE,
  payment_status text NOT NULL DEFAULT 'pending',
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.event_inscricoes TO authenticated;
GRANT ALL ON public.event_inscricoes TO service_role;
ALTER TABLE public.event_inscricoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event_inscricoes_panel_read" ON public.event_inscricoes FOR SELECT TO authenticated
  USING (public.has_panel_access(auth.uid()));
CREATE TRIGGER event_inscricoes_touch BEFORE UPDATE ON public.event_inscricoes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.donation_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_customer_id text,
  price_id text,
  customer_email text,
  customer_name text,
  amount_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL DEFAULT 'active',
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.donation_subscriptions TO authenticated;
GRANT ALL ON public.donation_subscriptions TO service_role;
ALTER TABLE public.donation_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "donation_subscriptions_panel_read" ON public.donation_subscriptions FOR SELECT TO authenticated
  USING (public.has_panel_access(auth.uid()));
CREATE TRIGGER donation_subscriptions_touch BEFORE UPDATE ON public.donation_subscriptions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();