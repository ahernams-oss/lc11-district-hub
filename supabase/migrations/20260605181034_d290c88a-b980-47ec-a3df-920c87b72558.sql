
-- =========================
-- REGIONS
-- =========================
CREATE TABLE public.regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  letter text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.regions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.regions TO authenticated;
GRANT ALL ON public.regions TO service_role;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read regions" ON public.regions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write regions" ON public.regions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER regions_touch BEFORE UPDATE ON public.regions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- DIVISIONS
-- =========================
CREATE TABLE public.divisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX divisions_region_idx ON public.divisions(region_id);
GRANT SELECT ON public.divisions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.divisions TO authenticated;
GRANT ALL ON public.divisions TO service_role;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read divisions" ON public.divisions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write divisions" ON public.divisions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER divisions_touch BEFORE UPDATE ON public.divisions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- CLUBS
-- =========================
CREATE TABLE public.clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id uuid NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  name text NOT NULL,
  city text,
  email text,
  phone text,
  meetings text,
  address text,
  website text,
  instagram text,
  facebook text,
  president text,
  logo_url text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX clubs_division_idx ON public.clubs(division_id);
GRANT SELECT ON public.clubs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clubs TO authenticated;
GRANT ALL ON public.clubs TO service_role;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read clubs" ON public.clubs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write clubs" ON public.clubs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER clubs_touch BEFORE UPDATE ON public.clubs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- NEWS
-- =========================
CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text,
  excerpt text,
  content text,
  cover_url text,
  tag text,
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT ALL ON public.news TO service_role;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read news" ON public.news FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write news" ON public.news FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER news_touch BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- EVENTS
-- =========================
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location text,
  starts_at timestamptz,
  ends_at timestamptz,
  tag text,
  cover_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read events" ON public.events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write events" ON public.events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER events_touch BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- PROJECTS
-- =========================
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  tag text,
  description text,
  content text,
  cover_url text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read projects" ON public.projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write projects" ON public.projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER projects_touch BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- SEED: regiões iniciais
-- =========================
INSERT INTO public.regions (letter, name, description, order_index) VALUES
  ('A', 'Região A — Metropolitana Central', 'Clubes da região central da capital paulista.', 1),
  ('B', 'Região B — Metropolitana Sul/Leste', 'Clubes da zona sul da capital e municípios da Grande São Paulo a leste.', 2),
  ('C', 'Região C — Oeste', 'Clubes da região oeste da Grande São Paulo.', 3),
  ('D', 'Região D — ABC Paulista', 'Clubes da região do ABC.', 4),
  ('E', 'Região E — Campinas e Sorocaba', 'Clubes do interior paulista nas regiões de Campinas e Sorocaba.', 5),
  ('F', 'Região F — Ribeirão Preto', 'Clubes da região de Ribeirão Preto.', 6),
  ('G', 'Região G — Vale do Paraíba', 'Clubes da região do Vale do Paraíba.', 7),
  ('H', 'Região H — Litoral', 'Clubes da região litorânea.', 8);

-- Divisões (uma por região com mesmo código)
INSERT INTO public.divisions (region_id, code, name, order_index)
SELECT id, letter || '1', 'Divisão ' || letter || '1', 1 FROM public.regions;

-- Clubes
DO $$
DECLARE
  d_a uuid; d_b uuid; d_c uuid; d_d uuid; d_e uuid; d_f uuid; d_g uuid; d_h uuid;
BEGIN
  SELECT d.id INTO d_a FROM public.divisions d JOIN public.regions r ON d.region_id=r.id WHERE r.letter='A' LIMIT 1;
  SELECT d.id INTO d_b FROM public.divisions d JOIN public.regions r ON d.region_id=r.id WHERE r.letter='B' LIMIT 1;
  SELECT d.id INTO d_c FROM public.divisions d JOIN public.regions r ON d.region_id=r.id WHERE r.letter='C' LIMIT 1;
  SELECT d.id INTO d_d FROM public.divisions d JOIN public.regions r ON d.region_id=r.id WHERE r.letter='D' LIMIT 1;
  SELECT d.id INTO d_e FROM public.divisions d JOIN public.regions r ON d.region_id=r.id WHERE r.letter='E' LIMIT 1;
  SELECT d.id INTO d_f FROM public.divisions d JOIN public.regions r ON d.region_id=r.id WHERE r.letter='F' LIMIT 1;
  SELECT d.id INTO d_g FROM public.divisions d JOIN public.regions r ON d.region_id=r.id WHERE r.letter='G' LIMIT 1;
  SELECT d.id INTO d_h FROM public.divisions d JOIN public.regions r ON d.region_id=r.id WHERE r.letter='H' LIMIT 1;

  INSERT INTO public.clubs (division_id, name, city, email, meetings, order_index) VALUES
    (d_a, 'Lions Clube Centro', 'São Paulo', 'centro@distritolc11.org', '2ª e 4ª terça, 20h', 1),
    (d_a, 'Lions Clube Norte', 'São Paulo', 'norte@distritolc11.org', '1ª e 3ª quinta, 20h', 2),
    (d_a, 'Lions Clube Vila Mariana', 'São Paulo', 'vilamariana@distritolc11.org', 'Quintas-feiras, 19h', 3),
    (d_b, 'Lions Clube Sul', 'São Paulo', 'sul@distritolc11.org', 'Quartas-feiras, 19h30', 1),
    (d_b, 'Lions Clube Leste', 'Guarulhos', 'leste@distritolc11.org', '1ª terça, 20h', 2),
    (d_c, 'Lions Clube Oeste', 'Osasco', 'oeste@distritolc11.org', '2ª e 4ª quarta, 20h', 1),
    (d_d, 'Lions Clube Santo André', 'Santo André', 'santoandre@distritolc11.org', '1ª e 3ª quarta, 20h', 1),
    (d_e, 'Lions Clube Campinas', 'Campinas', 'campinas@distritolc11.org', '2ª terça, 20h', 1),
    (d_e, 'Lions Clube Sorocaba', 'Sorocaba', 'sorocaba@distritolc11.org', 'Quartas-feiras, 20h', 2),
    (d_f, 'Lions Clube Ribeirão Preto', 'Ribeirão Preto', 'ribeirao@distritolc11.org', '1ª e 3ª segunda, 20h', 1),
    (d_g, 'Lions Clube São José', 'São José dos Campos', 'saojose@distritolc11.org', 'Terças-feiras, 19h30', 1),
    (d_h, 'Lions Clube Santos', 'Santos', 'santos@distritolc11.org', '2ª quinta, 20h', 1);
END $$;

-- Seed: notícias
INSERT INTO public.news (title, tag, excerpt, published_at) VALUES
  ('Convenção Distrital reúne mais de 800 Leões', 'Distrito', 'Encontro anual fortaleceu laços e celebrou os melhores projetos do ano leonístico.', '2026-05-20'),
  ('Mutirão atende 1.200 crianças em escolas públicas', 'Visão', 'Triagem oftalmológica resultou em 380 encaminhamentos médicos e 220 óculos doados.', '2026-05-05'),
  ('Plantio coletivo recupera área de mata ciliar', 'Meio Ambiente', 'Voluntários de 8 clubes plantaram 1.500 mudas nativas em um único final de semana.', '2026-04-18'),
  ('Distrito atinge meta de doação à Fundação LCIF', 'LCIF', 'Recursos ampliam projetos globais nas cinco causas humanitárias do Lions.', '2026-04-02'),
  ('LEO Clubes do distrito ganham novos quadros', 'Juventude', 'Mais de 60 jovens passaram a integrar o movimento leonístico jovem.', '2026-03-15'),
  ('Campanha arrecada 12 toneladas de alimentos', 'Combate à Fome', 'Mobilização envolveu 30 clubes em ação coordenada no fim de semana.', '2026-02-28');

-- Seed: eventos
INSERT INTO public.events (title, location, starts_at, tag, description) VALUES
  ('Reunião do Gabinete Distrital', 'Sede do Distrito — São Paulo', '2026-06-14 14:00', 'Reunião', '14h às 18h'),
  ('Mutirão de Triagem Oftalmológica', 'EMEF Vila Esperança', '2026-07-06 08:00', 'Visão', '08h às 14h'),
  ('Encontro de Presidentes de Clube', 'Hotel Central', '2026-07-20 09:00', 'Formação', '09h às 17h'),
  ('Campanha Mesa Solidária', 'Diversas praças do distrito', '2026-08-10 08:00', 'Fome', 'Dia inteiro'),
  ('Plantio Distrito Verde', 'Parque Municipal', '2026-08-23 08:00', 'Meio Ambiente', '08h às 12h'),
  ('Caminhada pela Visão', 'Av. Paulista', '2026-09-07 07:00', 'Visão', '07h às 11h');

-- Seed: projetos
INSERT INTO public.projects (title, tag, description, order_index) VALUES
  ('Olhar para o Futuro', 'Visão', 'Mutirão de triagem oftalmológica que atendeu mais de 1.200 crianças em escolas públicas em 2025.', 1),
  ('Mesa Solidária', 'Fome', 'Distribuição mensal de cestas básicas e refeições quentes em parceria com 18 clubes do distrito.', 2),
  ('Distrito Verde', 'Meio Ambiente', 'Plantio de 5.000 mudas nativas em áreas degradadas ao longo de 2025.', 3);
