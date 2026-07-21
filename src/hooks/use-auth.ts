import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "avancado" | "intermediario" | "basico" | "user";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  useEffect(() => {
    const loadRoles = async (uid: string) => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);
      setRoles(((data ?? []) as { role: AppRole }[]).map((r) => r.role));
    };

    const handleBypass = () => {
      setUser({
        id: "dev-admin-id",
        email: "admin@localhost",
        aud: "authenticated",
        role: "authenticated",
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
      } as any);
      setRoles(["admin"]);
      setLoading(false);
    };

    if (import.meta.env.DEV && localStorage.getItem("dev_admin_bypass") === "true") {
      handleBypass();
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_OUT") {
        localStorage.removeItem("dev_admin_bypass");
        setSession(null);
        setUser(null);
        setRoles([]);
        setLoading(false);
        return;
      }

      if (import.meta.env.DEV && localStorage.getItem("dev_admin_bypass") === "true") {
        handleBypass();
        return;
      }

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
        handleBypass();
        return;
      }
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

  const signOut = async () => {
    localStorage.removeItem("dev_admin_bypass");
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRoles([]);
  };

  return {
    session,
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
    signOut,
  };
}
