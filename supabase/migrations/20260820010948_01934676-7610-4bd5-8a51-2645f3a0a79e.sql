CREATE TABLE public.dist_associado_cargos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  associado_id uuid NOT NULL REFERENCES public.dist_associados(id) ON DELETE CASCADE,
  ambito text NOT NULL DEFAULT 'clube',
  cargo text NOT NULL,
  ano_leonico text,
  data_inicio date,
  data_fim date,
  atual boolean NOT NULL DEFAULT false,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dist_associado_cargos TO authenticated;
GRANT ALL ON public.dist_associado_cargos TO service_role;

ALTER TABLE public.dist_associado_cargos ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_dist_assoc_cargos_assoc ON public.dist_associado_cargos(associado_id);

CREATE TRIGGER dist_associado_cargos_touch BEFORE UPDATE ON public.dist_associado_cargos
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();