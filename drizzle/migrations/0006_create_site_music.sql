CREATE TABLE public.site_music (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  file_url text NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  volume integer NOT NULL DEFAULT 50,
  loop boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_music TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_music TO authenticated;
GRANT ALL ON public.site_music TO service_role;
ALTER TABLE public.site_music ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active music" ON public.site_music FOR SELECT USING (active = true);
CREATE POLICY "Editors manage music" ON public.site_music FOR ALL TO authenticated
  USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));
CREATE TRIGGER site_music_touch BEFORE UPDATE ON public.site_music FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();