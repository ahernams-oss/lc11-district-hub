DROP POLICY IF EXISTS "Permitir inserção por qualquer visitante" ON public.site_visits;
CREATE POLICY "Visitantes registram visitas válidas" ON public.site_visits
FOR INSERT TO anon, authenticated
WITH CHECK (
  length(path) BETWEEN 1 AND 500
  AND left(path, 1) = '/'
  AND path NOT LIKE '/admin%'
  AND length(visitor_id) BETWEEN 8 AND 100
  AND visitor_id ~ '^[A-Za-z0-9_-]+$'
  AND (created_at IS NULL OR created_at BETWEEN now() - interval '5 minutes' AND now() + interval '5 minutes')
);