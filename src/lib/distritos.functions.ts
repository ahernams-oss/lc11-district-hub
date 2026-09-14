import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DEV_IDS = [
  "00000000-0000-0000-0000-000000000001",
  "dev-admin-id",
  "dev-gestor-id",
];

export type Distrito = {
  id: string;
  nome: string;
  sigla: string;
  estados: string | null;
  ativo: boolean;
  ordem: number;
};

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** True when the account sees every district (admin / gestor_admin / dev bypass). */
export async function isMasterDistrital(userId: string) {
  if (DEV_IDS.includes(userId)) return true;
  const db = await admin();
  const { data } = await db.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => String(r.role));
  return roles.includes("admin") || roles.includes("gestor_admin");
}

/**
 * District ids the caller is allowed to read.
 * Masters get every district; other gestores only the ones linked to them.
 */
export async function distritoScope(userId: string): Promise<string[]> {
  const db = await admin();
  if (await isMasterDistrital(userId)) {
    const { data } = await db.from("distritos").select("id");
    return (data ?? []).map((d: any) => d.id as string);
  }
  const { data } = await db
    .from("usuarios_distritos")
    .select("distrito_id")
    .eq("user_id", userId);
  return (data ?? []).map((d: any) => d.distrito_id as string);
}

/** District new records should be filed under for this caller. */
export async function distritoPadrao(userId: string): Promise<string | null> {
  const db = await admin();
  if (!(await isMasterDistrital(userId))) {
    const { data } = await db
      .from("usuarios_distritos")
      .select("distrito_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    return (data as any)?.distrito_id ?? null;
  }
  const { data } = await db
    .from("distritos")
    .select("id")
    .eq("ativo", true)
    .order("ordem")
    .limit(1)
    .maybeSingle();
  return (data as any)?.id ?? null;
}

async function assertMaster(userId: string) {
  if (!(await isMasterDistrital(userId))) {
    throw new Error("Acesso negado: apenas Gestores Administradores gerenciam distritos.");
  }
}

// ─── DISTRITOS ───────────────────────────────────────────────────────
export const listDistritos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin();
    const ids = await distritoScope(context.userId);
    const master = await isMasterDistrital(context.userId);
    let q = db.from("distritos").select("*").order("ordem").order("nome");
    if (!master) q = q.in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return { distritos: (data ?? []) as Distrito[], master };
  });

export const upsertDistrito = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid().optional(),
      nome: z.string().min(1),
      sigla: z.string().min(1),
      estados: z.string().nullable().optional(),
      ativo: z.boolean().default(true),
      ordem: z.number().int().default(0),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertMaster(context.userId);
    const db = await admin();
    if (data.id) {
      const { error } = await db.from("distritos").update(data).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await db.from("distritos").insert(data);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteDistrito = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertMaster(context.userId);
    const db = await admin();
    const { error } = await db.from("distritos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── VÍNCULOS USUÁRIO x DISTRITO ─────────────────────────────────────
export const listDistritoUsuarios = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertMaster(context.userId);
    const db = await admin();

    const { data: usersData, error: usersErr } = await db.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (usersErr) throw new Error(`Não foi possível listar as contas: ${usersErr.message}`);

    const [{ data: links }, { data: roles }] = await Promise.all([
      db.from("usuarios_distritos").select("user_id, distrito_id"),
      db.from("user_roles").select("user_id, role"),
    ]);

    const gestaoRoles = new Set([
      "gestor_admin",
      "gestor_financeiro",
      "gestor_contabil",
      "gestor_crm",
    ]);

    return (usersData?.users ?? [])
      .map((u: any) => {
        const userRoles = (roles ?? [])
          .filter((r: any) => r.user_id === u.id)
          .map((r: any) => String(r.role));
        return {
          id: u.id as string,
          email: (u.email ?? "") as string,
          roles: userRoles,
          isMaster: userRoles.includes("admin") || userRoles.includes("gestor_admin"),
          distritos: (links ?? [])
            .filter((l: any) => l.user_id === u.id)
            .map((l: any) => l.distrito_id as string),
        };
      })
      .filter((u: any) => u.roles.some((r: string) => gestaoRoles.has(r) || r === "admin"));
  });

export const setDistritosDoUsuario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({ user_id: z.string().uuid(), distrito_ids: z.array(z.string().uuid()) }),
  )
  .handler(async ({ data, context }) => {
    await assertMaster(context.userId);
    const db = await admin();
    const { error: delErr } = await db
      .from("usuarios_distritos")
      .delete()
      .eq("user_id", data.user_id);
    if (delErr) throw new Error(delErr.message);
    if (data.distrito_ids.length) {
      const { error } = await db.from("usuarios_distritos").insert(
        data.distrito_ids.map((distrito_id) => ({ user_id: data.user_id, distrito_id })),
      );
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

/** Districts of the signed-in user, for the shell/badge in the UI. */
export const getMeusDistritos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin();
    const master = await isMasterDistrital(context.userId);
    const ids = await distritoScope(context.userId);
    if (!ids.length) return { master, distritos: [] as Distrito[] };
    const { data } = await db
      .from("distritos")
      .select("*")
      .in("id", ids)
      .order("ordem")
      .order("nome");
    return { master, distritos: (data ?? []) as Distrito[] };
  });
