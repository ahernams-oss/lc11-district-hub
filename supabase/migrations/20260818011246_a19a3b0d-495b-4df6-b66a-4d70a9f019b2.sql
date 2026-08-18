-- FINANCEIRO
CREATE TABLE public.fin_categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text NOT NULL DEFAULT 'despesa',
  cor text NOT NULL DEFAULT '#6366f1',
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fin_contas_bancarias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  banco text NOT NULL,
  agencia text,
  conta text,
  tipo text NOT NULL DEFAULT 'corrente',
  saldo_inicial bigint NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fin_contas_pagar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  categoria_id uuid REFERENCES public.fin_categorias(id) ON DELETE SET NULL,
  conta_id uuid REFERENCES public.fin_contas_bancarias(id) ON DELETE SET NULL,
  valor bigint NOT NULL DEFAULT 0,
  vencimento date NOT NULL,
  competencia text,
  status text NOT NULL DEFAULT 'pendente',
  pago_em timestamptz,
  valor_pago bigint,
  fornecedor text,
  documento text,
  anexo_url text,
  observacoes text,
  status_aprovacao text NOT NULL DEFAULT 'pendente',
  aprovado_por uuid,
  aprovado_em timestamptz,
  parecer_governador text,
  solicitante_nome text,
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fin_contas_receber (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  categoria_id uuid REFERENCES public.fin_categorias(id) ON DELETE SET NULL,
  conta_id uuid REFERENCES public.fin_contas_bancarias(id) ON DELETE SET NULL,
  valor bigint NOT NULL DEFAULT 0,
  vencimento date NOT NULL,
  competencia text,
  status text NOT NULL DEFAULT 'pendente',
  recebido_em timestamptz,
  valor_recebido bigint,
  pagador text,
  documento text,
  anexo_url text,
  observacoes text,
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fin_movimentacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_id uuid NOT NULL REFERENCES public.fin_contas_bancarias(id) ON DELETE CASCADE,
  categoria_id uuid REFERENCES public.fin_categorias(id) ON DELETE SET NULL,
  tipo text NOT NULL DEFAULT 'entrada',
  descricao text NOT NULL,
  valor bigint NOT NULL DEFAULT 0,
  data date NOT NULL,
  documento text,
  conciliado boolean NOT NULL DEFAULT false,
  observacoes text,
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fin_orcamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ano integer NOT NULL,
  descricao text,
  status text NOT NULL DEFAULT 'rascunho',
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fin_orcamento_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id uuid NOT NULL REFERENCES public.fin_orcamento(id) ON DELETE CASCADE,
  categoria_id uuid REFERENCES public.fin_categorias(id) ON DELETE SET NULL,
  valor_previsto bigint NOT NULL DEFAULT 0,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fin_cobrancas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid REFERENCES public.clubs(id) ON DELETE SET NULL,
  descricao text NOT NULL,
  valor bigint NOT NULL DEFAULT 0,
  vencimento date NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  referencia text,
  observacoes text,
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fin_historico_aprovacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_pagar_id uuid REFERENCES public.fin_contas_pagar(id) ON DELETE CASCADE,
  acao text NOT NULL,
  parecer text,
  usuario_id uuid,
  usuario_nome text,
  cargo_usuario text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- CONTABIL
CREATE TABLE public.con_plano_contas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nome text NOT NULL,
  tipo text NOT NULL,
  natureza text NOT NULL,
  nivel integer NOT NULL DEFAULT 1,
  sintetica boolean NOT NULL DEFAULT false,
  pai_id uuid REFERENCES public.con_plano_contas(id) ON DELETE SET NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.con_lancamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL,
  historico text NOT NULL,
  competencia text,
  status text NOT NULL DEFAULT 'validado',
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.con_lancamento_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lancamento_id uuid NOT NULL REFERENCES public.con_lancamentos(id) ON DELETE CASCADE,
  conta_id uuid NOT NULL REFERENCES public.con_plano_contas(id) ON DELETE RESTRICT,
  tipo text NOT NULL,
  valor bigint NOT NULL DEFAULT 0,
  historico_complementar text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- CRM
CREATE TABLE public.crm_contatos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text,
  telefone text,
  whatsapp text,
  clube_nome text,
  cargo text,
  tipo text NOT NULL DEFAULT 'prospeccao',
  estagio_funil text NOT NULL DEFAULT 'novo',
  status text NOT NULL DEFAULT 'ativo',
  origem text,
  observacoes text,
  valor_estimado numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.crm_interacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contato_id uuid NOT NULL REFERENCES public.crm_contatos(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'whatsapp',
  titulo text NOT NULL,
  descricao text,
  registrado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.crm_tarefas_followup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contato_id uuid NOT NULL REFERENCES public.crm_contatos(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  data_vencimento date NOT NULL,
  tipo text NOT NULL DEFAULT 'ligacao',
  status text NOT NULL DEFAULT 'pendente',
  concluida_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- DISTRITAL
CREATE TABLE public.dist_clubes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  codigo_lions text,
  charter_date date,
  regiao text NOT NULL DEFAULT 'Região A',
  divisao text NOT NULL DEFAULT 'Divisão A-1',
  cidade text NOT NULL DEFAULT 'Vitória',
  estado text NOT NULL DEFAULT 'ES',
  cep text,
  endereco text,
  email text,
  telefone text,
  dia_reuniao text,
  horario_reuniao text,
  local_reuniao text,
  status text NOT NULL DEFAULT 'ativo',
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.dist_associados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clube_id uuid NOT NULL REFERENCES public.dist_clubes(id) ON DELETE CASCADE,
  nome text NOT NULL,
  cpf text,
  email text,
  telefone text,
  whatsapp text,
  data_nascimento date,
  data_admissao date,
  cargo_clube text NOT NULL DEFAULT 'Membro',
  cargo_distrital text,
  categoria text NOT NULL DEFAULT 'ativo',
  status text NOT NULL DEFAULT 'ativo',
  nome_conjuge text,
  foto_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.dist_nominata_clube (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clube_id uuid NOT NULL REFERENCES public.dist_clubes(id) ON DELETE CASCADE,
  ano_leonico text NOT NULL DEFAULT '2025/2026',
  cargo text NOT NULL,
  nome_oficial text NOT NULL,
  email text,
  telefone text,
  whatsapp text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (clube_id, ano_leonico, cargo)
);

CREATE TABLE public.dist_documentos_informativos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  categoria text NOT NULL DEFAULT 'Circular da Governadoria',
  arquivo_url text NOT NULL,
  arquivo_nome text NOT NULL,
  arquivo_tamanho text,
  autor_cargo text NOT NULL DEFAULT 'Governador(a) de Distrito',
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.dist_estrutura_cargos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ano_leonico text NOT NULL DEFAULT '2025/2026',
  categoria_estrutura text NOT NULL DEFAULT 'Mesa Diretora',
  cargo_nome text NOT NULL,
  nome_titular text NOT NULL,
  clube_origem text,
  email text,
  telefone text,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- GRANTS: acesso apenas pelo servidor (service_role)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'fin_categorias','fin_contas_bancarias','fin_contas_pagar','fin_contas_receber',
    'fin_movimentacoes','fin_orcamento','fin_orcamento_itens','fin_cobrancas','fin_historico_aprovacoes',
    'con_plano_contas','con_lancamentos','con_lancamento_itens',
    'crm_contatos','crm_interacoes','crm_tarefas_followup',
    'dist_clubes','dist_associados','dist_nominata_clube','dist_documentos_informativos','dist_estrutura_cargos'
  ] LOOP
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', t || '_touch', t);
  END LOOP;
END $$;

-- Superadmin: todos os perfis
INSERT INTO public.user_roles (user_id, role)
SELECT '36c4cd48-8233-408c-bef8-eda105d20190'::uuid, r::public.app_role
FROM unnest(ARRAY['admin','avancado','intermediario','basico','gestor_admin','gestor_financeiro','gestor_contabil','gestor_crm']) AS r
ON CONFLICT (user_id, role) DO NOTHING;