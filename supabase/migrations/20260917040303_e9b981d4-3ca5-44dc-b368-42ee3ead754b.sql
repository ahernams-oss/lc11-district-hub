CREATE TABLE public.exercicios_leonicos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ano_leonico text NOT NULL UNIQUE,
  data_inicio date NOT NULL,
  data_fim date NOT NULL,
  status_financeiro text NOT NULL DEFAULT 'aberto',
  status_contabil text NOT NULL DEFAULT 'aberto',
  fin_fechado_em timestamptz,
  fin_fechado_por uuid,
  fin_parecer text,
  con_fechado_em timestamptz,
  con_fechado_por uuid,
  con_parecer text,
  resultado_financeiro jsonb,
  resultado_contabil jsonb,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exercicios_status_fin_chk CHECK (status_financeiro IN ('aberto','fechado')),
  CONSTRAINT exercicios_status_con_chk CHECK (status_contabil IN ('aberto','fechado'))
);

GRANT SELECT ON public.exercicios_leonicos TO authenticated;
GRANT ALL ON public.exercicios_leonicos TO service_role;
ALTER TABLE public.exercicios_leonicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Painel pode ver exercicios" ON public.exercicios_leonicos FOR SELECT TO authenticated USING (public.has_panel_access(auth.uid()));

CREATE TRIGGER exercicios_leonicos_touch BEFORE UPDATE ON public.exercicios_leonicos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.exercicio_saldos_abertura (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercicio_id uuid NOT NULL REFERENCES public.exercicios_leonicos(id) ON DELETE CASCADE,
  modulo text NOT NULL,
  conta_bancaria_id uuid REFERENCES public.fin_contas_bancarias(id) ON DELETE SET NULL,
  conta_contabil_id uuid REFERENCES public.con_plano_contas(id) ON DELETE SET NULL,
  descricao text NOT NULL,
  saldo bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exercicio_saldos_modulo_chk CHECK (modulo IN ('financeiro','contabil'))
);

CREATE INDEX exercicio_saldos_abertura_exercicio_idx ON public.exercicio_saldos_abertura(exercicio_id, modulo);
GRANT SELECT ON public.exercicio_saldos_abertura TO authenticated;
GRANT ALL ON public.exercicio_saldos_abertura TO service_role;
ALTER TABLE public.exercicio_saldos_abertura ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Painel pode ver saldos de abertura" ON public.exercicio_saldos_abertura FOR SELECT TO authenticated USING (public.has_panel_access(auth.uid()));

CREATE TRIGGER exercicio_saldos_abertura_touch BEFORE UPDATE ON public.exercicio_saldos_abertura FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.exercicio_eventos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercicio_id uuid NOT NULL REFERENCES public.exercicios_leonicos(id) ON DELETE CASCADE,
  modulo text NOT NULL,
  acao text NOT NULL,
  usuario_id uuid,
  usuario_email text,
  parecer text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exercicio_eventos_modulo_chk CHECK (modulo IN ('financeiro','contabil','geral')),
  CONSTRAINT exercicio_eventos_acao_chk CHECK (acao IN ('abertura','fechamento','reabertura'))
);

CREATE INDEX exercicio_eventos_exercicio_idx ON public.exercicio_eventos(exercicio_id, created_at DESC);
GRANT SELECT ON public.exercicio_eventos TO authenticated;
GRANT ALL ON public.exercicio_eventos TO service_role;
ALTER TABLE public.exercicio_eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Painel pode ver historico de exercicios" ON public.exercicio_eventos FOR SELECT TO authenticated USING (public.has_panel_access(auth.uid()));