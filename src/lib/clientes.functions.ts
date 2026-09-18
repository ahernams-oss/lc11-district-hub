import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { distritoScope, distritoPadrao } from "@/lib/distritos.functions";

async function assertFinanceiroAccess(userId: string) {
  if (
    userId === "00000000-0000-0000-0000-000000000001" ||
    userId === "dev-admin-id" ||
    userId === "dev-gestor-id"
  ) return;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  try {
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (!error && data) {
      const roles = data.map((r: any) => r.role as string);
      if (
        roles.includes("gestor_financeiro") ||
        roles.includes("gestor_admin") ||
        roles.includes("admin")
      ) return;
    }
  } catch {
    // fall through
  }

  if (process.env.NODE_ENV !== "production") return;
  throw new Error("Acesso negado: requer perfil Gestor Financeiro.");
}

const clienteSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(1),
  nome_fantasia: z.string().nullable().optional(),
  tipo_pessoa: z.enum(["juridica", "fisica"]).default("juridica"),
  documento: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  contato_nome: z.string().nullable().optional(),
  cep: z.string().nullable().optional(),
  logradouro: z.string().nullable().optional(),
  numero: z.string().nullable().optional(),
  complemento: z.string().nullable().optional(),
  bairro: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  estado_uf: z.string().nullable().optional(),
  categoria_id: z.string().uuid().nullable().optional(),
  clube_nome: z.string().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  ativo: z.boolean().default(true),
});

/** Lista clientes/pagadores com busca por nome, nome fantasia, documento, clube ou cidade. */
export const listClientes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      busca: z.string().optional(),
      apenasAtivos: z.boolean().optional(),
      limite: z.number().int().min(1).max(200).optional(),
    }).optional(),
  )
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const escopoDistritos = await distritoScope(context.userId);

    let q = supabaseAdmin
      .from("fin_clientes")
      .select("*, categoria:fin_categorias(id,nome,cor,tipo)")
      .in("distrito_id", escopoDistritos)
      .order("nome")
      .limit(data?.limite ?? 200);

    if (data?.apenasAtivos) q = q.eq("ativo", true);

    const busca = data?.busca?.trim();
    if (busca) {
      const termo = busca.replace(/[%,()]/g, " ");
      q = q.or(
        `nome.ilike.%${termo}%,nome_fantasia.ilike.%${termo}%,documento.ilike.%${termo}%,clube_nome.ilike.%${termo}%,cidade.ilike.%${termo}%`,
      );
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(clienteSchema)
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = { ...data, criado_por: context.userId };
    if (data.id) {
      const { error } = await supabaseAdmin.from("fin_clientes").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: inserted, error } = await supabaseAdmin
      .from("fin_clientes")
      .insert({ ...payload, distrito_id: await distritoPadrao(context.userId) })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: (inserted as any)?.id as string };
  });

export const deleteCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("fin_contas_receber")
      .select("id", { count: "exact", head: true })
      .eq("cliente_id", data.id);
    if ((count ?? 0) > 0) {
      throw new Error(
        `Este cliente está vinculado a ${count} conta(s) a receber. Desative-o em vez de excluir.`,
      );
    }
    const { error } = await supabaseAdmin.from("fin_clientes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
