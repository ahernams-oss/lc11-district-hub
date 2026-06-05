import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertCallerIsAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado: apenas administradores.");
}

export type AdminUserRow = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
};

export const listAuthUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminUserRow[]> => {
    await assertCallerIsAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: usersData, error: usersErr } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (usersErr) throw new Error(usersErr.message);

    const { data: roles, error: rolesErr } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "admin");
    if (rolesErr) throw new Error(rolesErr.message);

    const adminSet = new Set((roles ?? []).map((r) => r.user_id));

    return usersData.users
      .map((u) => ({
        id: u.id,
        email: u.email ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        is_admin: adminSet.has(u.id),
      }))
      .sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""));
  });

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
          { user_id: data.userId, role: "admin" },
          { onConflict: "user_id,role" },
        );
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", "admin");
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
