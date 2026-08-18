import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "avancado" | "intermediario" | "basico" | "user" | "gestor_financeiro" | "gestor_contabil" | "gestor_crm" | "gestor_admin";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [devBypass, setDevBypass] = useState(false);

  useEffect(() => {
    const loadRoles = async (uid: string) => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);
      setRoles(((data ?? []) as { role: AppRole }[]).map((r) => r.role));
    };

    const handleBypass = (gestaoOnly = false) => {
      setUser({
        id: gestaoOnly ? "dev-gestor-id" : "dev-admin-id",
        email: gestaoOnly ? "gestor@localhost" : "admin@localhost",
        aud: "authenticated",
        role: "authenticated",
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
      } as any);
      // Admin bypass: all roles. Gestão bypass: only gestão roles.
      setRoles(gestaoOnly ? ["gestor_admin"] : ["admin", "gestor_admin"]);
      setDevBypass(true);
      setLoading(false);
    };

    const isDevBypass = import.meta.env.DEV && localStorage.getItem("dev_admin_bypass") === "true";
    const isDevGestaoBypass = import.meta.env.DEV && localStorage.getItem("dev_gestao_bypass") === "true";
    if (isDevBypass) handleBypass(false);
    else if (isDevGestaoBypass) handleBypass(true);

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_OUT") {
        localStorage.removeItem("dev_admin_bypass");
        localStorage.removeItem("dev_gestao_bypass");
        setSession(null);
        setUser(null);
        setRoles([]);
        setLoading(false);
        return;
      }

      if (import.meta.env.DEV && localStorage.getItem("dev_admin_bypass") === "true") {
        handleBypass(false);
        return;
      }
      if (import.meta.env.DEV && localStorage.getItem("dev_gestao_bypass") === "true") {
        handleBypass(true);
        return;
      }

      setDevBypass(false);
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadRoles(s.user.id), 0);
      } else {
        setRoles([]);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (import.meta.env.DEV && localStorage.getItem("dev_admin_bypass") === "true") {
        handleBypass(false);
        return;
      }
      if (import.meta.env.DEV && localStorage.getItem("dev_gestao_bypass") === "true") {
        handleBypass(true);
        return;
      }
      setDevBypass(false);
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) await loadRoles(s.user.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const isAdmin = roles.includes("admin");
  const isAvancado = isAdmin || roles.includes("avancado");
  const isIntermediario = isAvancado || roles.includes("intermediario");
  const hasPanelAccess =
    isAdmin || isAvancado || isIntermediario || roles.includes("basico");
  const canEditContent = isIntermediario; // intermediario, avancado, admin
  const canViewUsers = isAvancado; // avancado, admin
  const canManageUsers = isAdmin;

  // Sistema de Gestão — roles independentes do painel admin
  const isGestorAdmin = roles.includes("gestor_admin");
  const isGestorFinanceiro = isGestorAdmin || roles.includes("gestor_financeiro");
  const isGestorContabil = isGestorAdmin || roles.includes("gestor_contabil");
  const isGestorCRM = isGestorAdmin || roles.includes("gestor_crm");
  const hasGestaoAccess = isGestorAdmin || isGestorFinanceiro || isGestorContabil || isGestorCRM;

  const signOut = async () => {
    localStorage.removeItem("dev_admin_bypass");
    localStorage.removeItem("dev_gestao_bypass");
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRoles([]);
  };

  return {
    session,
    devBypass,
    user,
    loading,
    roles,
    isAdmin,
    isAvancado,
    isIntermediario,
    hasPanelAccess,
    canEditContent,
    canViewUsers,
    canManageUsers,
    // Gestão
    isGestorAdmin,
    isGestorFinanceiro,
    isGestorContabil,
    isGestorCRM,
    hasGestaoAccess,
    signOut,
  };
}
