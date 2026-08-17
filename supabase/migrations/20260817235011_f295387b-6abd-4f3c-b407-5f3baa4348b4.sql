DROP POLICY IF EXISTS "Documents are publicly readable" ON public.documents;

CREATE POLICY "Public documents readable by everyone"
ON public.documents
FOR SELECT
USING (
  COALESCE(is_restricted, false) = false
  OR (
    auth.uid() IS NOT NULL
    AND (
      CASE COALESCE(required_role::text, 'membro')
        WHEN 'admin' THEN public.has_role(auth.uid(), 'admin'::app_role)
        WHEN 'diretoria' THEN public.has_panel_access(auth.uid())
        ELSE true
      END
    )
  )
);