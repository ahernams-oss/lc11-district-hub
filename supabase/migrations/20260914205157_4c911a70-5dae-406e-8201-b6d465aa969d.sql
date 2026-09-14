-- 1. Distritos
CREATE TABLE public.distritos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  sigla text NOT NULL UNIQUE,
  estados text,
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.distritos TO authenticated;
GRANT ALL ON public.distritos TO service_role;
ALTER TABLE public.distritos ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER distritos_touch BEFORE UPDATE ON public.distritos
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.distritos (nome, sigla, estados, ordem)
VALUES ('Distrito LC-11', 'LC-11', 'ES / RJ', 1);

-- 2. Vínculo usuário <-> distrito
CREATE TABLE public.usuarios_distritos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  distrito_id uuid NOT NULL REFERENCES public.distritos(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, distrito_id)
);
GRANT SELECT ON public.usuarios_distritos TO authenticated;
GRANT ALL ON public.usuarios_distritos TO service_role;
ALTER TABLE public.usuarios_distritos ENABLE ROW LEVEL SECURITY;

-- 3. Helpers
CREATE OR REPLACE FUNCTION public.is_gestor_master(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text IN ('admin','gestor_admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.can_access_distrito(_user_id uuid, _distrito_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_gestor_master(_user_id)
     OR EXISTS (
       SELECT 1 FROM public.usuarios_distritos
       WHERE user_id = _user_id AND distrito_id = _distrito_id
     )
$$;

-- 4. Policies
CREATE POLICY "gestores read distritos" ON public.distritos
  FOR SELECT TO authenticated
  USING (public.has_panel_access(auth.uid()) OR public.can_access_distrito(auth.uid(), id));

CREATE POLICY "master manage distritos" ON public.distritos
  FOR ALL TO authenticated
  USING (public.is_gestor_master(auth.uid()))
  WITH CHECK (public.is_gestor_master(auth.uid()));

CREATE POLICY "read own distrito links" ON public.usuarios_distritos
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_gestor_master(auth.uid()));

CREATE POLICY "master manage distrito links" ON public.usuarios_distritos
  FOR ALL TO authenticated
  USING (public.is_gestor_master(auth.uid()))
  WITH CHECK (public.is_gestor_master(auth.uid()));

-- 5. distrito_id nas tabelas de gestão + backfill LC-11
DO $$
DECLARE
  d uuid;
  t text;
  tabelas text[] := ARRAY[
    'dist_clubes','dist_associados','dist_estrutura_cargos','dist_documentos_informativos',
    'fin_contas_pagar','fin_contas_receber','fin_movimentacoes','fin_cobrancas','fin_orcamento',
    'con_lancamentos','con_plano_contas','crm_contatos'
  ];
BEGIN
  SELECT id INTO d FROM public.distritos WHERE sigla = 'LC-11';
  FOREACH t IN ARRAY tabelas LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS distrito_id uuid REFERENCES public.distritos(id) ON DELETE SET NULL', t);
    EXECUTE format('UPDATE public.%I SET distrito_id = %L WHERE distrito_id IS NULL', t, d);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (distrito_id)', t || '_distrito_idx', t);
  END LOOP;
END $$;