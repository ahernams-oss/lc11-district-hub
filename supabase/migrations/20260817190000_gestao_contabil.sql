-- ================================================================
-- Módulo Contábil — Gestão Distrital LC-11
-- ================================================================

-- ========================
-- PLANO DE CONTAS
-- ========================
CREATE TABLE public.con_plano_contas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo          text NOT NULL UNIQUE,       -- Ex: "1", "1.1", "1.1.01", "1.1.01.001"
  nome            text NOT NULL,
  tipo            text NOT NULL CHECK (tipo IN ('ativo', 'passivo', 'patrimonio_liquido', 'receita', 'despesa')),
  natureza        text NOT NULL CHECK (natureza IN ('devedora', 'credora')),
  nivel           integer NOT NULL DEFAULT 1 CHECK (nivel >= 1 AND nivel <= 5),
  sintetica       boolean NOT NULL DEFAULT false, -- true = conta grupo/sintética, false = analítica (recebe lançamentos)
  pai_id          uuid REFERENCES public.con_plano_contas(id) ON DELETE RESTRICT,
  ativo           boolean NOT NULL DEFAULT true,
  criado_em       timestamptz NOT NULL DEFAULT now(),
  atualizado_em   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX con_plano_contas_codigo_idx ON public.con_plano_contas(codigo);
CREATE INDEX con_plano_contas_tipo_idx ON public.con_plano_contas(tipo);

ALTER TABLE public.con_plano_contas ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_plano_contas TO authenticated;
GRANT ALL ON public.con_plano_contas TO service_role;

CREATE POLICY "gestao contabil acessa plano contas" ON public.con_plano_contas
  USING (public.has_gestao_access(auth.uid()))
  WITH CHECK (public.has_gestao_contabil(auth.uid()));

CREATE TRIGGER con_plano_contas_touch BEFORE UPDATE ON public.con_plano_contas
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed Plano de Contas padrão para Distrito LC-11
INSERT INTO public.con_plano_contas (codigo, nome, tipo, natureza, nivel, sintetica) VALUES
  ('1',           'ATIVO',                                    'ativo',              'devedora', 1, true),
  ('1.1',         'ATIVO CIRCULANTE',                         'ativo',              'devedora', 2, true),
  ('1.1.01',      'Caixa e Equivalentes de Caixa',            'ativo',              'devedora', 3, true),
  ('1.1.01.001',  'Caixa Geral',                              'ativo',              'devedora', 4, false),
  ('1.1.01.002',  'Bancos Conta Movimento',                   'ativo',              'devedora', 4, false),
  ('1.1.01.003',  'Aplicações Financeiras',                   'ativo',              'devedora', 4, false),
  ('1.1.02',      'Créditos a Receber',                       'ativo',              'devedora', 3, true),
  ('1.1.02.001',  'Cotas a Receber dos Clubes',               'ativo',              'devedora', 4, false),
  ('1.1.02.002',  'Outros Créditos',                          'ativo',              'devedora', 4, false),

  ('2',           'PASSIVO E PATRIMÔNIO LÍQUIDO',             'passivo',            'credora',  1, true),
  ('2.1',         'PASSIVO CIRCULANTE',                       'passivo',            'credora',  2, true),
  ('2.1.01',      'Obrigações a Curto Prazo',                 'passivo',            'credora',  3, true),
  ('2.1.01.001',  'Fornecedores a Pagar',                     'passivo',            'credora',  4, false),
  ('2.1.01.002',  'Contas a Pagar Operacionais',              'passivo',            'credora',  4, false),
  ('2.1.01.003',  'Impostos e Taxas a Recolher',              'passivo',            'credora',  4, false),
  ('2.3',         'PATRIMÔNIO LÍQUIDO',                       'patrimonio_liquido', 'credora',  2, true),
  ('2.3.01',      'Patrimônio Social',                        'patrimonio_liquido', 'credora',  3, true),
  ('2.3.01.001',  'Fundo Social Distrital',                   'patrimonio_liquido', 'credora',  4, false),
  ('2.3.01.002',  'Superávit / Déficit Acumulado',            'patrimonio_liquido', 'credora',  4, false),

  ('3',           'RECEITAS',                                 'receita',            'credora',  1, true),
  ('3.1',         'RECEITAS OPERACIONAIS',                    'receita',            'credora',  2, true),
  ('3.1.01',      'Contribuições de Clubes',                  'receita',            'credora',  3, false),
  ('3.1.02',      'Eventos e Convenções Distritais',          'receita',            'credora',  3, false),
  ('3.1.03',      'Doações e Patrocínios',                    'receita',            'credora',  3, false),
  ('3.1.04',      'Receitas Financeiras',                     'receita',            'credora',  3, false),

  ('4',           'DESPESAS',                                 'despesa',            'devedora', 1, true),
  ('4.1',         'DESPESAS OPERACIONAIS',                    'despesa',            'devedora', 2, true),
  ('4.1.01',      'Despesas Administrativas e Sede',          'despesa',            'devedora', 3, false),
  ('4.1.02',      'Eventos e Convenções Distritais',          'despesa',            'devedora', 3, false),
  ('4.1.03',      'Serviços de Terceiros e Assessoria',       'despesa',            'devedora', 3, false),
  ('4.1.04',      'Viagens e Deslocamentos da Governadoria',  'despesa',            'devedora', 3, false),
  ('4.1.05',      'Despesas Bancárias e Tarifas',             'despesa',            'devedora', 3, false);

-- ========================
-- LANÇAMENTOS CONTÁBEIS (CABEÇALHO)
-- ========================
CREATE TABLE public.con_lancamentos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero          serial UNIQUE,
  data            date NOT NULL,
  historico       text NOT NULL,
  competencia     date,                       -- YYYY-MM-01
  status          text NOT NULL DEFAULT 'validado' CHECK (status IN ('rascunho', 'validado', 'estornado')),
  origem          text NOT NULL DEFAULT 'manual' CHECK (origem IN ('manual', 'financeiro', 'importado')),
  ref_id          uuid,                       -- referência opcional para fin_movimentacoes, fin_contas_pagar, etc.
  criado_por      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em       timestamptz NOT NULL DEFAULT now(),
  atualizado_em   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX con_lancamentos_data_idx ON public.con_lancamentos(data);
CREATE INDEX con_lancamentos_status_idx ON public.con_lancamentos(status);

ALTER TABLE public.con_lancamentos ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_lancamentos TO authenticated;
GRANT ALL ON public.con_lancamentos TO service_role;

CREATE POLICY "gestao contabil acessa lancamentos" ON public.con_lancamentos
  USING (public.has_gestao_access(auth.uid()))
  WITH CHECK (public.has_gestao_contabil(auth.uid()));

CREATE TRIGGER con_lancamentos_touch BEFORE UPDATE ON public.con_lancamentos
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ========================
-- ITENS DO LANÇAMENTO (PARTIDAS DÉBITO E CRÉDITO)
-- ========================
CREATE TABLE public.con_lancamento_itens (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lancamento_id           uuid NOT NULL REFERENCES public.con_lancamentos(id) ON DELETE CASCADE,
  conta_id                uuid NOT NULL REFERENCES public.con_plano_contas(id) ON DELETE RESTRICT,
  tipo                    text NOT NULL CHECK (tipo IN ('debito', 'credito')),
  valor                   integer NOT NULL CHECK (valor > 0), -- centavos BRL
  historico_complementar  text,
  criado_em               timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX con_lancamento_itens_lanc_idx ON public.con_lancamento_itens(lancamento_id);
CREATE INDEX con_lancamento_itens_conta_idx ON public.con_lancamento_itens(conta_id);

ALTER TABLE public.con_lancamento_itens ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_lancamento_itens TO authenticated;
GRANT ALL ON public.con_lancamento_itens TO service_role;

CREATE POLICY "gestao contabil acessa lancamento itens" ON public.con_lancamento_itens
  USING (public.has_gestao_access(auth.uid()))
  WITH CHECK (public.has_gestao_contabil(auth.uid()));

-- ========================
-- CONCILIAÇÃO CONTÁBIL X FINANCEIRO
-- ========================
CREATE TABLE public.con_conciliacoes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lancamento_id       uuid NOT NULL REFERENCES public.con_lancamentos(id) ON DELETE CASCADE,
  movimentacao_id     uuid NOT NULL REFERENCES public.fin_movimentacoes(id) ON DELETE CASCADE,
  conciliado_em       timestamptz NOT NULL DEFAULT now(),
  conciliado_por      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  observacao          text,
  UNIQUE (lancamento_id, movimentacao_id)
);

ALTER TABLE public.con_conciliacoes ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_conciliacoes TO authenticated;
GRANT ALL ON public.con_conciliacoes TO service_role;

CREATE POLICY "gestao contabil acessa conciliacoes" ON public.con_conciliacoes
  USING (public.has_gestao_access(auth.uid()))
  WITH CHECK (public.has_gestao_contabil(auth.uid()));
