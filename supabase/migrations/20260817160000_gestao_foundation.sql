
-- ==========================================================
-- Sistema de Gestão Distrital — Foundation Migration
-- Novas roles e funções de acesso para módulos de gestão
-- ==========================================================

-- Novas roles para o sistema de gestão (separadas do painel admin do site)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'gestor_financeiro';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'gestor_contabil';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'gestor_crm';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'gestor_admin';

-- Helper: qualquer acesso ao sistema de gestão
CREATE OR REPLACE FUNCTION public.has_gestao_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('gestor_financeiro','gestor_contabil','gestor_crm','gestor_admin')
  )
$$;

-- Helper: acesso ao módulo financeiro
CREATE OR REPLACE FUNCTION public.has_gestao_financeiro(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('gestor_financeiro','gestor_admin')
  )
$$;

-- Helper: acesso ao módulo contábil
CREATE OR REPLACE FUNCTION public.has_gestao_contabil(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('gestor_contabil','gestor_admin')
  )
$$;

-- Helper: acesso ao módulo CRM
CREATE OR REPLACE FUNCTION public.has_gestao_crm(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('gestor_crm','gestor_admin')
  )
$$;

-- Revogar acesso público e conceder apenas a authenticated/service_role
REVOKE EXECUTE ON FUNCTION public.has_gestao_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_gestao_access(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.has_gestao_financeiro(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_gestao_financeiro(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.has_gestao_contabil(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_gestao_contabil(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.has_gestao_crm(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_gestao_crm(uuid) TO authenticated, service_role;
