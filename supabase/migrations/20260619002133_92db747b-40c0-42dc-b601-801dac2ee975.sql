CREATE TABLE public.popups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  image_url text,
  link_url text,
  link_label text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  display_seconds integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.popups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.popups TO authenticated;
GRANT ALL ON public.popups TO service_role;

ALTER TABLE public.popups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active popups"
  ON public.popups FOR SELECT
  USING (active = true);

CREATE POLICY "Editors manage popups"
  ON public.popups FOR ALL
  TO authenticated
  USING (public.can_edit_content(auth.uid()))
  WITH CHECK (public.can_edit_content(auth.uid()));

CREATE TRIGGER popups_touch_updated_at
  BEFORE UPDATE ON public.popups
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();