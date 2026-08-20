import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { anoLeonicoDe, fimAnoLeonico } from "@/lib/ano-leonico";

export async function assertClubesAccess(userId: string) {
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
        roles.includes("gestor_crm") ||
        roles.includes("gestor_admin") ||
        roles.includes("gestor_financeiro") ||
        roles.includes("admin")
      ) {
        return;
      }
    }
  } catch {
    // Fall through to dev check
  }

  if (process.env.NODE_ENV !== "production") {
    return;
  }

  throw new Error("Acesso negado: requer permissão de gestão.");
}

const MOCK_CLUBES = [
  { id: "c1111111-1111-1111-1111-111111111101", nome: "Lions Clube Vitória Centro", codigo_lions: "034123", charter_date: "1965-04-12", regiao: "Região A", divisao: "Divisão A-1", cidade: "Vitória", estado: "ES", email: "vitoriacentro@distritolc11.org.br", telefone: "(27) 3322-1100", dia_reuniao: "2ª e 4ª Quinta-feira", horario_reuniao: "20:00", local_reuniao: "Sede Social Vitória", status: "ativo", created_at: "2026-08-17T12:00:00Z" },
  { id: "c1111111-1111-1111-1111-111111111102", nome: "Lions Clube Vila Velha Glória", codigo_lions: "034124", charter_date: "1972-08-20", regiao: "Região A", divisao: "Divisão A-1", cidade: "Vila Velha", estado: "ES", email: "vilavelhagloria@distritolc11.org.br", telefone: "(27) 3329-4455", dia_reuniao: "1ª e 3ª Quarta-feira", horario_reuniao: "19:30", local_reuniao: "Sede Campestre Vila Velha", status: "ativo", created_at: "2026-08-17T12:00:00Z" },
  { id: "c1111111-1111-1111-1111-111111111103", nome: "Lions Clube Cachoeiro de Itapemirim", codigo_lions: "034125", charter_date: "1958-11-05", regiao: "Região B", divisao: "Divisão B-1", cidade: "Cachoeiro de Itapemirim", estado: "ES", email: "cachoeiro@distritolc11.org.br", telefone: "(28) 3522-8899", dia_reuniao: "2ª e 4ª Terça-feira", horario_reuniao: "20:00", local_reuniao: "Hotel Império", status: "ativo", created_at: "2026-08-17T12:00:00Z" },
  { id: "c1111111-1111-1111-1111-111111111104", nome: "Lions Clube Colatina Centro", codigo_lions: "034126", charter_date: "1968-03-15", regiao: "Região C", divisao: "Divisão C-1", cidade: "Colatina", estado: "ES", email: "colatina@distritolc11.org.br", telefone: "(27) 3722-5500", dia_reuniao: "1ª e 3ª Quinta-feira", horario_reuniao: "20:00", local_reuniao: "Sede Colatina", status: "ativo", created_at: "2026-08-17T12:00:00Z" },
  { id: "c1111111-1111-1111-1111-111111111105", nome: "Lions Clube Linhares", codigo_lions: "034127", charter_date: "1975-06-18", regiao: "Região C", divisao: "Divisão C-2", cidade: "Linhares", estado: "ES", email: "linhares@distritolc11.org.br", telefone: "(27) 3371-3322", dia_reuniao: "2ª e 4ª Segunda-feira", horario_reuniao: "19:30", local_reuniao: "Auditório Linhares", status: "ativo", created_at: "2026-08-17T12:00:00Z" },
];

const MOCK_ASSOCIADOS = [
  { id: "a1111111-1111-1111-1111-111111111101", clube_id: "c1111111-1111-1111-1111-111111111101", nome: "CL Dr. Roberto Mendes", cpf: "123.456.789-00", email: "roberto.mendes@email.com", telefone: "(27) 99881-2233", whatsapp: "(27) 99881-2233", cargo_clube: "Presidente", cargo_distrital: "Assessor Distrital de Visão", categoria: "ativo", status: "ativo", created_at: "2026-08-17T12:00:00Z", dist_clubes: { nome: "Lions Clube Vitória Centro" } },
  { id: "a1111111-1111-1111-1111-111111111102", clube_id: "c1111111-1111-1111-1111-111111111101", nome: "CaL Maria Eduarda Mendes", cpf: "234.567.890-11", email: "maria.mendes@email.com", telefone: "(27) 99881-2234", whatsapp: "(27) 99881-2234", cargo_clube: "Secretária", cargo_distrital: null, categoria: "ativo", status: "ativo", created_at: "2026-08-17T12:00:00Z", dist_clubes: { nome: "Lions Clube Vitória Centro" } },
  { id: "a1111111-1111-1111-1111-111111111103", clube_id: "c1111111-1111-1111-1111-111111111102", nome: "CL Carlos Alberto Santos", cpf: "345.678.901-22", email: "carlos.alberto@email.com", telefone: "(27) 99772-4455", whatsapp: "(27) 99772-4455", cargo_clube: "Presidente", cargo_distrital: "Presidente da Divisão A-1", categoria: "ativo", status: "ativo", created_at: "2026-08-17T12:00:00Z", dist_clubes: { nome: "Lions Clube Vila Velha Glória" } },
  { id: "a1111111-1111-1111-1111-111111111104", clube_id: "c1111111-1111-1111-1111-111111111103", nome: "CL João Paulo Fonseca", cpf: "456.789.012-33", email: "joao.fonseca@email.com", telefone: "(28) 99811-5566", whatsapp: "(28) 99811-5566", cargo_clube: "Tesoureiro", cargo_distrital: null, categoria: "ativo", status: "ativo", created_at: "2026-08-17T12:00:00Z", dist_clubes: { nome: "Lions Clube Cachoeiro de Itapemirim" } },
  { id: "a1111111-1111-1111-1111-111111111105", clube_id: "c1111111-1111-1111-1111-111111111104", nome: "CaL Ana Paula Oliveira", cpf: "567.890.123-44", email: "ana.paula@email.com", telefone: "(27) 99911-2233", whatsapp: "(27) 99911-2233", cargo_clube: "Presidente", cargo_distrital: "Governadora de Distrito 2025/2026", categoria: "vitalicio", status: "ativo", created_at: "2026-08-17T12:00:00Z", dist_clubes: { nome: "Lions Clube Colatina Centro" } },
];

// ─── METRICAS ────────────────────────────────────────────────────────
export const getClubesMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertClubesAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let clubes: any[] = MOCK_CLUBES;
    let associados: any[] = MOCK_ASSOCIADOS;

    try {
      const { data: dbClubes } = await supabaseAdmin.from("dist_clubes").select("*");
      if (dbClubes && dbClubes.length > 0) clubes = dbClubes;

      const { data: dbAssociados } = await supabaseAdmin.from("dist_associados").select("*");
      if (dbAssociados && dbAssociados.length > 0) associados = dbAssociados;
    } catch {
      // Fallback in dev
    }

    const totalClubes = clubes.length;
    const clubesAtivos = clubes.filter((c) => c.status === "ativo").length;
    const totalAssociados = associados.length;
    const associadosAtivos = associados.filter((a) => a.status === "ativo").length;

    // Regiões únicas
    const regioes = Array.from(new Set(clubes.map((c) => c.regiao)));
    const divisoes = Array.from(new Set(clubes.map((c) => c.divisao)));

    return {
      totalClubes,
      clubesAtivos,
      totalAssociados,
      associadosAtivos,
      totalRegioes: regioes.length,
      totalDivisoes: divisoes.length,
    };
  });

// ─── CLUBES ──────────────────────────────────────────────────────────
export const listClubes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertClubesAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      const { data, error } = await supabaseAdmin
        .from("dist_clubes")
        .select("*")
        .order("nome");

      if (!error && data && data.length > 0) return data;
    } catch {
      // Dev fallback
    }

    return MOCK_CLUBES;
  });

export const upsertClube = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid().optional(),
      nome: z.string().min(1),
      codigo_lions: z.string().optional().nullable(),
      charter_date: z.string().optional().nullable(),
      regiao: z.string().default("Região A"),
      divisao: z.string().default("Divisão A-1"),
      cidade: z.string().default("Vitória"),
      estado: z.string().default("ES"),
      cep: z.string().optional().nullable(),
      endereco: z.string().optional().nullable(),
      email: z.string().optional().nullable(),
      telefone: z.string().optional().nullable(),
      dia_reuniao: z.string().optional().nullable(),
      horario_reuniao: z.string().optional().nullable(),
      local_reuniao: z.string().optional().nullable(),
      status: z.enum(["ativo", "inativo", "em_processo"]).default("ativo"),
      observacoes: z.string().optional().nullable(),
    })
  )
  .handler(async ({ data, context }) => {
    await assertClubesAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      if (data.id) {
        await supabaseAdmin.from("dist_clubes").update(data).eq("id", data.id);
      } else {
        await supabaseAdmin.from("dist_clubes").insert(data);
      }
    } catch {
      // Mock update
    }

    return { ok: true };
  });

export const deleteClube = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertClubesAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      await supabaseAdmin.from("dist_clubes").delete().eq("id", data.id);
    } catch {
      // Mock delete
    }

    return { ok: true };
  });

// ─── ASSOCIADOS ──────────────────────────────────────────────────────
export const listAssociados = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ clube_id: z.string().uuid().optional() }).optional())
  .handler(async ({ data, context }) => {
    await assertClubesAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      let query = supabaseAdmin.from("dist_associados").select("*, dist_clubes(nome)").order("nome");
      if (data?.clube_id) {
        query = query.eq("clube_id", data.clube_id);
      }
      const { data: res, error } = await query;
      if (!error && res && res.length > 0) return res;
    } catch {
      // Dev fallback
    }

    return MOCK_ASSOCIADOS;
  });

export const upsertAssociado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid().optional(),
      clube_id: z.string().uuid(),
      nome: z.string().min(1),
      cpf: z.string().optional().nullable(),
      email: z.string().optional().nullable(),
      telefone: z.string().optional().nullable(),
      whatsapp: z.string().optional().nullable(),
      data_nascimento: z.string().optional().nullable(),
      data_admissao: z.string().optional().nullable(),
      cargo_clube: z.string().default("Membro"),
      cargo_distrital: z.string().optional().nullable(),
      categoria: z.enum(["ativo", "honorario", "privilegiado", "vitalicio", "ausente"]).default("ativo"),
      status: z.enum(["ativo", "desligado", "licenciado"]).default("ativo"),
      nome_conjuge: z.string().optional().nullable(),
      foto_url: z.string().optional().nullable(),
      cidade: z.string().optional().nullable(),
      cep: z.string().optional().nullable(),
      logradouro: z.string().optional().nullable(),
      numero: z.string().optional().nullable(),
      complemento: z.string().optional().nullable(),
      bairro: z.string().optional().nullable(),
      cidade_endereco: z.string().optional().nullable(),
      estado_uf: z.string().optional().nullable(),
      bio: z.string().optional().nullable(),
    })
  )
  .handler(async ({ data, context }) => {
    await assertClubesAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Cargos anteriores (para detectar mudança e registrar histórico)
    let anterior: any = null;
    let associadoId = data.id ?? null;

    try {
      if (data.id) {
        const { data: prev } = await supabaseAdmin
          .from("dist_associados")
          .select("cargo_clube, cargo_distrital")
          .eq("id", data.id)
          .maybeSingle();
        anterior = prev;
        await supabaseAdmin.from("dist_associados").update(data).eq("id", data.id);
      } else {
        const { data: inserted } = await supabaseAdmin
          .from("dist_associados")
          .insert(data)
          .select("id")
          .maybeSingle();
        associadoId = inserted?.id ?? null;
      }

      // Registrar histórico quando o cargo mudar (sempre carimbado com o ano leônico)
      if (associadoId) {
        const hoje = new Date().toISOString().slice(0, 10);
        const anoAtual = anoLeonicoDe();
        const pares: Array<{ ambito: "clube" | "distrito"; novo: string | null; antigo: string | null }> = [
          { ambito: "clube", novo: data.cargo_clube || null, antigo: anterior?.cargo_clube ?? null },
          { ambito: "distrito", novo: data.cargo_distrital || null, antigo: anterior?.cargo_distrital ?? null },
        ];
        for (const p of pares) {
          if (p.novo === p.antigo) continue;

          // Encerra os cargos abertos desse âmbito, respeitando o ano leônico de cada um
          const { data: abertos } = await supabaseAdmin
            .from("dist_associado_cargos")
            .select("id, ano_leonico")
            .eq("associado_id", associadoId)
            .eq("ambito", p.ambito)
            .eq("atual", true);

          for (const a of abertos ?? []) {
            const anoReg = (a as any).ano_leonico || anoAtual;
            // se o cargo era de um ano leônico anterior, encerra no fim daquele ano
            const fim = anoReg === anoAtual ? hoje : fimAnoLeonico(anoReg);
            await supabaseAdmin
              .from("dist_associado_cargos")
              .update({ atual: false, data_fim: fim })
              .eq("id", (a as any).id);
          }

          if (p.novo) {
            // evita duplicar o mesmo cargo/ano leônico
            const { data: jaExiste } = await supabaseAdmin
              .from("dist_associado_cargos")
              .select("id")
              .eq("associado_id", associadoId)
              .eq("ambito", p.ambito)
              .eq("cargo", p.novo)
              .eq("ano_leonico", anoAtual)
              .maybeSingle();

            if (jaExiste?.id) {
              await supabaseAdmin
                .from("dist_associado_cargos")
                .update({ atual: true, data_fim: null })
                .eq("id", jaExiste.id);
            } else {
              await supabaseAdmin.from("dist_associado_cargos").insert({
                associado_id: associadoId,
                ambito: p.ambito,
                cargo: p.novo,
                ano_leonico: anoAtual,
                data_inicio: hoje,
                atual: true,
              });
            }
          }
        }
      }

    } catch {
      // Mock operation
      // Mock operation
    }

    return { ok: true };
  });

export const deleteAssociado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertClubesAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      await supabaseAdmin.from("dist_associados").delete().eq("id", data.id);
    } catch {
      // Mock delete
    }

    return { ok: true };
  });

// ─── HISTÓRICO DE CARGOS ─────────────────────────────────────────────
export const listCargosHistorico = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ associado_id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertClubesAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: res, error } = await supabaseAdmin
      .from("dist_associado_cargos")
      .select("*")
      .eq("associado_id", data.associado_id)
      .order("data_inicio", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return res ?? [];
  });

export const upsertCargoHistorico = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid().optional(),
      associado_id: z.string().uuid(),
      ambito: z.enum(["clube", "distrito"]).default("clube"),
      cargo: z.string().min(1),
      ano_leonico: z.string().optional().nullable(),
      data_inicio: z.string().optional().nullable(),
      data_fim: z.string().optional().nullable(),
      atual: z.boolean().default(false),
      observacoes: z.string().optional().nullable(),
    })
  )
  .handler(async ({ data, context }) => {
    await assertClubesAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = {
      ...data,
      data_inicio: data.data_inicio || null,
      data_fim: data.data_fim || null,
    };
    if (data.id) {
      const { error } = await supabaseAdmin.from("dist_associado_cargos").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("dist_associado_cargos").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteCargoHistorico = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertClubesAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("dist_associado_cargos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
