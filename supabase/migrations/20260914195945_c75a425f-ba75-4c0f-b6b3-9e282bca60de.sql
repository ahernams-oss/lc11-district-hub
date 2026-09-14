INSERT INTO public.user_roles (user_id, role)
SELECT u.id, r.role
FROM auth.users u
CROSS JOIN (VALUES ('admin'::app_role), ('avancado'::app_role), ('intermediario'::app_role), ('basico'::app_role), ('gestor_admin'::app_role)) AS r(role)
WHERE lower(u.email) = 'ahernams@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;