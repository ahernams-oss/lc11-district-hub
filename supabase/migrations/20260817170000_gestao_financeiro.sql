
-- ================================================================
-- Módulo Financeiro — Gestão Distrital LC-11
-- ================================================================

-- ========================
-- CATEGORIAS FINANCEIRAS
-- ========================
CREATE TABLE public.fin_categorias (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        text NOT NULL,
  tipo        text NOT NULL CHECK (tipo IN ('receita','despesa')),
  cor         text NOT NULL DEFAULT '#6366f1',
  ordem       integer NOT NULL DEFAULT 0,
  ativo       boolean NOT NULL DEFAULT true,
  criado_em   timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_categorias ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_categorias TO authenticated;
GRANT ALL ON public.fin_categorias TO service_role;
CREATE POLICY "gestao financeiro acessa categorias" ON public.fin_categorias
  USING (public.has_gestao_access(auth.uid()))
  WITH CHECK (public.has_gestao_financeiro(auth.uid()));
CREATE TRIGGER fin_categorias_touch BEFORE UPDATE ON public.fin_categorias
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed categorias
INSERT INTO public.fin_categorias (nome, tipo, cor, ordem) VALUES
  ('Contribuições de Clubes',   'receita', '#10b981', 1),
  ('Eventos e Convenções',       'receita', '#3b82f6', 2),
  ('Doações e Patrocínios',      'receita', '#8b5cf6', 3),
  ('LCIF e Fundações',           'receita', '#f59e0b', 4),
  ('Outras Receitas',            'receita', '#6b7280', 5),
  ('Despesas Administrativas',   'despesa', '#ef4444', 10),
  ('Eventos e Programas',        'despesa', '#f97316', 11),
  ('Materiais e Publicações',    'despesa', '#eab308', 12),
  ('Serviços de Terceiros',      'despesa', '#06b6d4', 13),
  ('Viagens e Deslocamentos',    'despesa', '#ec4899', 14),
  ('Comunicação e Marketing',    'despesa', '#84cc16', 15),
  ('Outras Despesas',            'despesa', '#6b7280', 16);

-- ========================
-- CONTAS BANCÁRIAS
-- ========================
CREATE TABLE public.fin_contas_bancarias (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        text NOT NULL,
  banco       text NOT NULL,
  agencia     text,
  conta       text,
  tipo        text NOT NULL DEFAULT 'corrente' CHECK (tipo IN ('corrente','poupanca','investimento','caixa')),
  saldo_inicial integer NOT NULL DEFAULT 0, -- centavos
  ativo       boolean NOT NULL DEFAULT true,
  criado_em   timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_contas_bancarias ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_contas_bancarias TO authenticated;
GRANT ALL ON public.fin_contas_bancarias TO service_role;
CREATE POLICY "gestao financeiro acessa contas" ON public.fin_contas_bancarias
  USING (public.has_gestao_access(auth.uid()))
  WITH CHECK (public.has_gestao_financeiro(auth.uid()));
CREATE TRIGGER fin_contas_bancarias_touch BEFORE UPDATE ON public.fin_contas_bancarias
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ========================
-- CONTAS A PAGAR
-- ========================
CREATE TABLE public.fin_contas_pagar (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao       text NOT NULL,
  categoria_id    uuid REFERENCES public.fin_categorias(id) ON DELETE SET NULL,
  conta_id        uuid REFERENCES public.fin_contas_bancarias(id) ON DELETE SET NULL,
  valor           integer NOT NULL, -- centavos
  vencimento      date NOT NULL,
  competencia     date,             -- mês de competência
  status          text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','pago','vencido','cancelado')),
  pago_em         date,
  valor_pago      integer,          -- centavos
  fornecedor      text,
  documento       text,             -- NF, recibo
  observacoes     text,
  criado_por      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em       timestamptz NOT NULL DEFAULT now(),
  atualizado_em   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fin_contas_pagar_vencimento_idx ON public.fin_contas_pagar(vencimento);
CREATE INDEX fin_contas_pagar_status_idx ON public.fin_contas_pagar(status);
ALTER TABLE public.fin_contas_pagar ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_contas_pagar TO authenticated;
GRANT ALL ON public.fin_contas_pagar TO service_role;
CREATE POLICY "gestao financeiro acessa contas pagar" ON public.fin_contas_pagar
  USING (public.has_gestao_access(auth.uid()))
  WITH CHECK (public.has_gestao_financeiro(auth.uid()));
CREATE TRIGGER fin_contas_pagar_touch BEFORE UPDATE ON public.fin_contas_pagar
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ========================
-- CONTAS A RECEBER
-- ========================
CREATE TABLE public.fin_contas_receber (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao       text NOT NULL,
  categoria_id    uuid REFERENCES public.fin_categorias(id) ON DELETE SET NULL,
  conta_id        uuid REFERENCES public.fin_contas_bancarias(id) ON DELETE SET NULL,
  valor           integer NOT NULL, -- centavos
  vencimento      date NOT NULL,
  competencia     date,
  status          text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','recebido','vencido','cancelado')),
  recebido_em     date,
  valor_recebido  integer,
  pagador         text,
  documento       text,
  observacoes     text,
  criado_por      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em       timestamptz NOT NULL DEFAULT now(),
  atualizado_em   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fin_contas_receber_vencimento_idx ON public.fin_contas_receber(vencimento);
CREATE INDEX fin_contas_receber_status_idx ON public.fin_contas_receber(status);
ALTER TABLE public.fin_contas_receber ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_contas_receber TO authenticated;
GRANT ALL ON public.fin_contas_receber TO service_role;
CREATE POLICY "gestao financeiro acessa contas receber" ON public.fin_contas_receber
  USING (public.has_gestao_access(auth.uid()))
  WITH CHECK (public.has_gestao_financeiro(auth.uid()));
CREATE TRIGGER fin_contas_receber_touch BEFORE UPDATE ON public.fin_contas_receber
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ========================
-- MOVIMENTAÇÕES BANCÁRIAS
-- ========================
CREATE TABLE public.fin_movimentacoes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_id        uuid NOT NULL REFERENCES public.fin_contas_bancarias(id) ON DELETE CASCADE,
  categoria_id    uuid REFERENCES public.fin_categorias(id) ON DELETE SET NULL,
  tipo            text NOT NULL CHECK (tipo IN ('entrada','saida')),
  descricao       text NOT NULL,
  valor           integer NOT NULL, -- centavos (sempre positivo)
  data            date NOT NULL,
  documento       text,
  origem          text DEFAULT 'manual' CHECK (origem IN ('manual','importado','contas_pagar','contas_receber')),
  ref_id          uuid,             -- referência a contas_pagar / contas_receber
  conciliado      boolean NOT NULL DEFAULT false,
  observacoes     text,
  criado_por      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em       timestamptz NOT NULL DEFAULT now(),
  atualizado_em   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fin_movimentacoes_conta_idx ON public.fin_movimentacoes(conta_id, data);
CREATE INDEX fin_movimentacoes_data_idx ON public.fin_movimentacoes(data);
ALTER TABLE public.fin_movimentacoes ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_movimentacoes TO authenticated;
GRANT ALL ON public.fin_movimentacoes TO service_role;
CREATE POLICY "gestao financeiro acessa movimentacoes" ON public.fin_movimentacoes
  USING (public.has_gestao_access(auth.uid()))
  WITH CHECK (public.has_gestao_financeiro(auth.uid()));
CREATE TRIGGER fin_movimentacoes_touch BEFORE UPDATE ON public.fin_movimentacoes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ========================
-- ORÇAMENTO ANUAL
-- ========================
CREATE TABLE public.fin_orcamento (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ano             integer NOT NULL UNIQUE,
  descricao       text,
  status          text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','aprovado','fechado')),
  criado_por      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em       timestamptz NOT NULL DEFAULT now(),
  atualizado_em   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_orcamento ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_orcamento TO authenticated;
GRANT ALL ON public.fin_orcamento TO service_role;
CREATE POLICY "gestao financeiro acessa orcamento" ON public.fin_orcamento
  USING (public.has_gestao_access(auth.uid()))
  WITH CHECK (public.has_gestao_financeiro(auth.uid()));
CREATE TRIGGER fin_orcamento_touch BEFORE UPDATE ON public.fin_orcamento
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ========================
-- ITENS DO ORÇAMENTO
-- ========================
CREATE TABLE public.fin_orcamento_itens (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id    uuid NOT NULL REFERENCES public.fin_orcamento(id) ON DELETE CASCADE,
  categoria_id    uuid NOT NULL REFERENCES public.fin_categorias(id) ON DELETE CASCADE,
  valor_previsto  integer NOT NULL, -- centavos
  observacoes     text,
  criado_em       timestamptz NOT NULL DEFAULT now(),
  atualizado_em   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (orcamento_id, categoria_id)
);
ALTER TABLE public.fin_orcamento_itens ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_orcamento_itens TO authenticated;
GRANT ALL ON public.fin_orcamento_itens TO service_role;
CREATE POLICY "gestao financeiro acessa orcamento itens" ON public.fin_orcamento_itens
  USING (public.has_gestao_access(auth.uid()))
  WITH CHECK (public.has_gestao_financeiro(auth.uid()));
CREATE TRIGGER fin_orcamento_itens_touch BEFORE UPDATE ON public.fin_orcamento_itens
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ========================
-- COBRANÇAS (CLUBES)
-- ========================
CREATE TABLE public.fin_cobrancas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id         uuid REFERENCES public.clubs(id) ON DELETE SET NULL,
  descricao       text NOT NULL,
  valor           integer NOT NULL, -- centavos
  vencimento      date NOT NULL,
  status          text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','pago','vencido','cancelado')),
  referencia      text,             -- "Cota 2025-06", etc.
  observacoes     text,
  criado_por      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em       timestamptz NOT NULL DEFAULT now(),
  atualizado_em   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fin_cobrancas_club_idx ON public.fin_cobrancas(club_id);
CREATE INDEX fin_cobrancas_status_idx ON public.fin_cobrancas(status);
ALTER TABLE public.fin_cobrancas ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_cobrancas TO authenticated;
GRANT ALL ON public.fin_cobrancas TO service_role;
CREATE POLICY "gestao financeiro acessa cobrancas" ON public.fin_cobrancas
  USING (public.has_gestao_access(auth.uid()))
  WITH CHECK (public.has_gestao_financeiro(auth.uid()));
CREATE TRIGGER fin_cobrancas_touch BEFORE UPDATE ON public.fin_cobrancas
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Índices gerais utilitários para views de dashboard
CREATE INDEX fin_movimentacoes_tipo_data_idx ON public.fin_movimentacoes(tipo, data);
