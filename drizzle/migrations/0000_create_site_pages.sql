CREATE TABLE public.site_pages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title text NOT NULL CHECK (length(trim(title)) > 0),
 slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 menu_key text NOT NULL CHECK (menu_key IN ('inicio','lideres','clubes','documentos','projetos','noticias','eventos','conexao','dados','lcif')),
 menu_label text NOT NULL,
 description text NOT NULL DEFAULT '',
 body text NOT NULL DEFAULT '',
 image_url text NOT NULL DEFAULT '',
 sort_order integer NOT NULL DEFAULT 0,
 published boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_pages TO authenticated;
GRANT ALL ON public.site_pages TO service_role;
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published pages are public" ON public.site_pages FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Content editors manage pages" ON public.site_pages FOR ALL TO authenticated USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));
CREATE INDEX site_pages_menu_order ON public.site_pages(menu_key, sort_order, title) WHERE published = true;