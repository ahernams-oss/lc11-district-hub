INSERT INTO public.usuarios_distritos (user_id, distrito_id)
SELECT DISTINCT ur.user_id, d.id
FROM public.user_roles ur
CROSS JOIN public.distritos d
WHERE ur.role::text IN ('gestor_financeiro','gestor_contabil','gestor_crm','gestor_admin','admin')
  AND d.ativo = true
ON CONFLICT (user_id, distrito_id) DO NOTHING;