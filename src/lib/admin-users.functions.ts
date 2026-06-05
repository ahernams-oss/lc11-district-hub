import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ROLE_VALUES = ["admin", "avancado", "intermediario", "basico"] as const;
export type PanelRole = (typeof ROLE_VALUES)[number];

async function getCallerRoles(userId: string): Promise<string[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => r.role as string);
}

async function assertCallerCanViewUsers(userId: string) {
  const roles = await getCallerRoles(userId);
  if (!roles.includes("admin") && !roles.includes("avancado")) {
    throw new Error("Acesso negado: requer perfil Avançado ou Administrador.");
  }
}

async function assertCallerIsAdmin(userId: string) {
  const roles = await getCallerRoles(userId);
  if (!roles.includes("admin")) {
    throw new Error("Acesso negado: apenas administradores podem executar essa ação.");
  }
}

export type AdminUserRow = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  roles: PanelRole[];
  highest_role: PanelRole | null;
  is_admin: boolean;
};

const ROLE_RANK: Record<PanelRole, number> = {
  basico: 1,
  intermediario: 2,
  avancado: 3,
  admin: 4,
};

export const listAuthUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminUserRow[]> => {
    await assertCallerCanViewUsers(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: usersData, error: usersErr } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (usersErr) throw new Error(usersErr.message);

    const { data: rolesRows, error: rolesErr } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role");
    if (rolesErr) throw new Error(rolesErr.message);

    const rolesByUser = new Map<string, PanelRole[]>();
    for (const r of rolesRows ?? []) {
      const role = (r as any).role as string;
      if (!(ROLE_VALUES as readonly string[]).includes(role)) continue;
      const arr = rolesByUser.get((r as any).user_id) ?? [];
      arr.push(role as PanelRole);
      rolesByUser.set((r as any).user_id, arr);
    }

    return usersData.users
      .map((u) => {
        const roles = rolesByUser.get(u.id) ?? [];
        const highest =
          roles.sort((a, b) => ROLE_RANK[b] - ROLE_RANK[a])[0] ?? null;
        return {
          id: u.id,
          email: u.email ?? null,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
          roles,
          highest_role: highest,
          is_admin: roles.includes("admin"),
        };
      })
      .sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""));
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      userId: z.string().uuid(),
      role: z.enum(["admin", "avancado", "intermediario", "basico", "none"]),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context.userId);

    if (data.userId === context.userId && data.role !== "admin") {
      throw new Error("Você não pode rebaixar seu próprio perfil de Administrador.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Remove all panel roles first
    const { error: delErr } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .in("role", ROLE_VALUES as unknown as string[]);
    if (delErr) throw new Error(delErr.message);

    if (data.role !== "none") {
      const { error: insErr } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: data.userId, role: data.role as any });
      if (insErr) throw new Error(insErr.message);
    }

    return { ok: true };
  });

// Backwards-compat: toggle admin role on/off
export const setUserAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      userId: z.string().uuid(),
      isAdmin: z.boolean(),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context.userId);
    if (data.userId === context.userId && !data.isAdmin) {
      throw new Error("Você não pode remover seu próprio acesso de administrador.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.isAdmin) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert(
          { user_id: data.userId, role: "admin" as any },
          { onConflict: "user_id,role" },
        );
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", "admin" as any);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteAuthUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context.userId);
    if (data.userId === context.userId) {
      throw new Error("Você não pode excluir sua própria conta.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
