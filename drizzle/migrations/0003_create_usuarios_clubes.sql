CREATE TABLE public.usuarios_clubes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  clube_id uuid NOT NULL REFERENCES public.dist_clubes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, clube_id)
);
GRANT ALL ON public.usuarios_clubes TO service_role;
GRANT SELECT ON public.usuarios_clubes TO authenticated;
ALTER TABLE public.usuarios_clubes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário vê seus vínculos de clube" ON public.usuarios_clubes FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_gestor_master(auth.uid()));