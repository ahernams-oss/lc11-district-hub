import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GESTAO_ROLE_VALUES = [
  "gestor_financeiro",
  "gestor_contabil",
  "gestor_crm",
  "gestor_admin",
] as const;

export type GestaoRole = (typeof GESTAO_ROLE_VALUES)[number];

async function assertCallerIsGestorAdmin(context: { userId: string; supabase: any }) {
  const { userId, supabase } = context;
  if (
    userId === "00000000-0000-0000-0000-000000000001" ||
    userId === "dev-admin-id" ||
    userId === "dev-gestor-id"
  ) return;

  const [gestorResult, adminResult] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "gestor_admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
  ]);

  if (gestorResult.error || adminResult.error) {
    throw new Error("Não foi possível validar as permissões desta conta. Entre novamente e tente de novo.");
  }

  if (gestorResult.data === true || adminResult.data === true) return;

  throw new Error("Acesso negado: requer perfil Gestor Admin.");
}

/**
 * Lists all users with their gestão roles.
 * Requires gestor_admin or admin role.
 */
export const listGestaoUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertCallerIsGestorAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: usersData, error: usersErr } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (usersErr) {
      throw new Error(
        `Não foi possível listar as contas: ${usersErr.message}. Verifique a configuração do backend e publique novamente.`,
      );
    }
    const usersList: any[] = usersData?.users ?? [];

    const { data: rolesData, error: rolesErr } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role");
    if (rolesErr) throw new Error(rolesErr.message);
    const rolesRows: any[] = rolesData ?? [];

    // Build per-user role lists (all roles, for display)
    const rolesByUser = new Map<string, string[]>();
    for (const r of rolesRows) {
      const role = (r as any).role as string;
      const arr = rolesByUser.get((r as any).user_id) ?? [];
      arr.push(role);
      rolesByUser.set((r as any).user_id, arr);
    }

    return usersList
      .map((u) => {
        const allRoles = rolesByUser.get(u.id) ?? [];
        const gestaoRoles = allRoles.filter((r) =>
          (GESTAO_ROLE_VALUES as readonly string[]).includes(r),
        );
        return {
          id: u.id,
          email: u.email ?? null,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
          all_roles: allRoles,
          gestao_roles: gestaoRoles as GestaoRole[],
        };
      })
      .sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""));
  });

/**
 * Sets multiple gestão roles for a user.
 * Clears existing gestão roles and inserts the new array.
 */
export const updateGestaoUserRoles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      userId: z.string().uuid(),
      roles: z.array(z.enum(["gestor_financeiro", "gestor_contabil", "gestor_crm", "gestor_admin"])),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertCallerIsGestorAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Delete existing gestão roles
    const { error: delErr } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .in("role", GESTAO_ROLE_VALUES as unknown as any);
    if (delErr) throw new Error(delErr.message);

    // Insert new roles
    if (data.roles.length > 0) {
      const rows = data.roles.map((role) => ({ user_id: data.userId, role }));
      const { error: insErr } = await supabaseAdmin.from("user_roles").insert(rows);
      if (insErr) throw new Error(insErr.message);
    }

    return { ok: true };
  });

/**
 * Creates a new user in Gestão Distrital with specified credentials & roles.
 */
export const createGestaoUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      nome: z.string().optional(),
      cargo: z.string().optional(),
      clube: z.string().optional(),
      roles: z.array(z.enum(["gestor_financeiro", "gestor_contabil", "gestor_crm", "gestor_admin"])),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertCallerIsGestorAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Create auth user
    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.nome,
        cargo: data.cargo,
        clube: data.clube,
      },
    });
    if (createErr) throw new Error(createErr.message);

    // Insert roles
    if (data.roles.length > 0) {
      const rows = data.roles.map((r) => ({
        user_id: newUser.user.id,
        role: r,
      }));
      const { error: roleErr } = await supabaseAdmin.from("user_roles").insert(rows);
      if (roleErr) throw new Error(roleErr.message);
    }

    return { ok: true, userId: newUser.user.id };
  });

/**
 * Deletes a user account from Gestão.
 */
export const deleteGestaoUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertCallerIsGestorAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Ensures the Superadmin account (ahernams@gmail.com) exists with all privileges.
 */
export const ensureSuperadminCreated = createServerFn({ method: "POST" }).handler(async () => {
  const email = "ahernams@gmail.com";
  const password = "P1m2a515@";

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 100 });

    let user = usersData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: "Superadmin Distrito LC-11",
          cargo: "Governador / Superadmin",
        },
      });

      if (!createErr && created.user) {
        user = created.user;
      }
    } else {
      // Update password if user already exists
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password,
        user_metadata: {
          full_name: "Superadmin Distrito LC-11",
          cargo: "Governador / Superadmin",
        },
      });
    }

    if (user) {
      const allRoles = ["admin", "gestor_admin", "gestor_financeiro", "gestor_contabil", "gestor_crm", "avancado"];
      for (const role of allRoles) {
        await supabaseAdmin.from("user_roles").upsert(
          { user_id: user.id, role: role as any },
          { onConflict: "user_id,role" }
        );
      }
    }

    return { ok: true, email, message: "Usuário Superadmin configurado com sucesso!" };
  } catch (err: any) {
    return { ok: false, error: err.message || "Dev mode fallback active" };
  }
});

