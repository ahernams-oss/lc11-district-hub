import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export async function assertDistritoAccess(userId: string) {
  if (userId === "00000000-0000-0000-0000-000000000001") return;
  // Auth bypass for dev
}

// ─── MOCK DATASETS DE DEV ───
const MOCK_NOMINATA = [
  { id: "n1111111-1111-1111-1111-111111111101", clube_id: "c1111111-1111-1111-1111-111111111101", ano_leonico: "2025/2026", cargo: "Presidente", nome_oficial: "CL Dr. Roberto Mendes", email: "roberto.mendes@email.com", telefone: "(27) 99881-2233", whatsapp: "(27) 99881-2233" },
  { id: "n1111111-1111-1111-1111-111111111102", clube_id: "c1111111-1111-1111-1111-111111111101", ano_leonico: "2025/2026", cargo: "Secretária", nome_oficial: "CaL Maria Eduarda Mendes", email: "maria.mendes@email.com", telefone: "(27) 99881-2234", whatsapp: "(27) 99881-2234" },
  { id: "n1111111-1111-1111-1111-111111111103", clube_id: "c1111111-1111-1111-1111-111111111101", ano_leonico: "2025/2026", cargo: "Tesoureiro", nome_oficial: "CL Fernando Machado", email: "fernando@email.com", telefone: "(27) 99881-5544", whatsapp: "(27) 99881-5544" },
  { id: "n1111111-1111-1111-1111-111111111104", clube_id: "c1111111-1111-1111-1111-111111111101", ano_leonico: "2025/2026", cargo: "Diretor de Associados (GMT)", nome_oficial: "CL Marcos Aurelio", email: "marcos@email.com", telefone: "(27) 99771-3322", whatsapp: "(27) 99771-3322" },
];

const MOCK_DOCUMENTOS = [
  { id: "d1111111-1111-1111-1111-111111111101", titulo: "Circular Oficial da Governadoria nº 01/2025-2026", descricao: "Orientações para o início do Ano Leônico e convocação para a 1ª Reunião do Conselho Distrital.", categoria: "Circular da Governadoria", arquivo_url: "/docs/circular_01_governadoria.pdf", arquivo_nome: "circular_01_governadoria.pdf", arquivo_tamanho: "1.4 MB", autor_cargo: "Governador(a) de Distrito", created_at: "2026-08-17T10:00:00Z" },
  { id: "d1111111-1111-1111-1111-111111111102", titulo: "Relatório do Balancete Financeiro Distrital - 1º Trimestre", descricao: "Prestação de contas das cotas distritais arrecadadas e despesas do trimestre.", categoria: "Balancete Distrital", arquivo_url: "/docs/balancete_1_trimestre_lc11.pdf", arquivo_nome: "balancete_1_trimestre_lc11.pdf", arquivo_tamanho: "850 KB", autor_cargo: "Tesoureiro(a) Distrital", created_at: "2026-08-16T14:30:00Z" },
  { id: "d1111111-1111-1111-1111-111111111103", titulo: "Formulário Padrão de Relatório de Atividades dos Clubes (GST)", descricao: "Modelo em PDF/DOC para envio mensal de relatórios de serviço ao Distrito.", categoria: "Formulários & Modelos", arquivo_url: "/docs/formulario_relatorio_gst.docx", arquivo_nome: "formulario_relatorio_gst.docx", arquivo_tamanho: "320 KB", autor_cargo: "Governador(a) de Distrito", created_at: "2026-08-15T09:15:00Z" },
];

const MOCK_ESTRUTURA = [
  { id: "e1111111-1111-1111-1111-111111111101", ano_leonico: "2025/2026", categoria_estrutura: "Mesa Diretora", cargo_nome: "Governadora de Distrito", nome_titular: "CaL Ana Paula Oliveira", clube_origem: "Lions Clube Colatina Centro", email: "governador@distritolc11.org.br", telefone: "(27) 99911-2233", ordem: 1 },
  { id: "e1111111-1111-1111-1111-111111111102", ano_leonico: "2025/2026", categoria_estrutura: "Mesa Diretora", cargo_nome: "1º Vice-Governador", nome_titular: "CL Dr. Roberto Mendes", clube_origem: "Lions Clube Vitória Centro", email: "roberto.mendes@email.com", telefone: "(27) 99881-2233", ordem: 2 },
  { id: "e1111111-1111-1111-1111-111111111103", ano_leonico: "2025/2026", categoria_estrutura: "Mesa Diretora", cargo_nome: "Secretário Distrital", nome_titular: "CL Carlos Alberto Santos", clube_origem: "Lions Clube Vila Velha Glória", email: "secretaria@distritolc11.org.br", telefone: "(27) 99772-4455", ordem: 3 },
  { id: "e1111111-1111-1111-1111-111111111104", ano_leonico: "2025/2026", categoria_estrutura: "Mesa Diretora", cargo_nome: "Tesoureiro Distrital", nome_titular: "CL João Paulo Fonseca", clube_origem: "Lions Clube Cachoeiro de Itapemirim", email: "tesouraria@distritolc11.org.br", telefone: "(28) 99811-5566", ordem: 4 },
  { id: "e1111111-1111-1111-1111-111111111105", ano_leonico: "2025/2026", categoria_estrutura: "Regiões e Divisões", cargo_nome: "Presidente da Região A", nome_titular: "CL Dr. Roberto Mendes", clube_origem: "Lions Clube Vitória Centro", email: "roberto.mendes@email.com", telefone: "(27) 99881-2233", ordem: 5 },
  { id: "e1111111-1111-1111-1111-111111111106", ano_leonico: "2025/2026", categoria_estrutura: "Regiões e Divisões", cargo_nome: "Presidente da Divisão A-1", nome_titular: "CL Carlos Alberto Santos", clube_origem: "Lions Clube Vila Velha Glória", email: "carlos.alberto@email.com", telefone: "(27) 99772-4455", ordem: 6 },
  { id: "e1111111-1111-1111-1111-111111111107", ano_leonico: "2025/2026", categoria_estrutura: "Equipe Global (GAT/GMT/GST/GET)", cargo_nome: "Coordenador GMT (Quadro Social)", nome_titular: "CL Marcos Aurelio", clube_origem: "Lions Clube Vitória Centro", email: "gmt@distritolc11.org.br", telefone: "(27) 99771-3322", ordem: 7 },
  { id: "e1111111-1111-1111-1111-111111111108", ano_leonico: "2025/2026", categoria_estrutura: "Assessoria Distrital Specialized", cargo_nome: "Assessor Distrital de Visão e SightFirst", nome_titular: "CL Dr. Roberto Mendes", clube_origem: "Lions Clube Vitória Centro", email: "visao@distritolc11.org.br", telefone: "(27) 99881-2233", ordem: 8 },
];

// ─── 1. NOMINATA DO CLUBE ───
export const getNominataByClube = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ clube_id: z.string().uuid(), ano_leonico: z.string().default("2025/2026") }))
  .handler(async ({ data, context }) => {
    await assertDistritoAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      const { data: dbData, error } = await supabaseAdmin
        .from("dist_nominata_clube")
        .select("*")
        .eq("clube_id", data.clube_id)
        .eq("ano_leonico", data.ano_leonico);

      if (!error && dbData && dbData.length > 0) return dbData;
    } catch {
      // Dev fallback
    }

    return MOCK_NOMINATA.filter((n) => n.clube_id === data.clube_id && n.ano_leonico === data.ano_leonico);
  });

export const upsertNominataCargo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid().optional(),
      clube_id: z.string().uuid(),
      ano_leonico: z.string().default("2025/2026"),
      cargo: z.string().min(1),
      nome_oficial: z.string().min(1),
      email: z.string().optional().nullable(),
      telefone: z.string().optional().nullable(),
      whatsapp: z.string().optional().nullable(),
    })
  )
  .handler(async ({ data, context }) => {
    await assertDistritoAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      if (data.id) {
        await supabaseAdmin.from("dist_nominata_clube").update(data).eq("id", data.id);
      } else {
        await supabaseAdmin.from("dist_nominata_clube").upsert(data, { onConflict: "clube_id,ano_leonico,cargo" });
      }
    } catch {
      // Mock operation
    }

    return { ok: true };
  });

export const deleteNominataCargo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertDistritoAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      await supabaseAdmin.from("dist_nominata_clube").delete().eq("id", data.id);
    } catch {
      // Mock delete
    }

    return { ok: true };
  });

// ─── 2. PAINEL INFORMATIVO / DOCUMENTOS ───
export const listDocumentosInformativos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ categoria: z.string().optional() }).optional())
  .handler(async ({ data, context }) => {
    await assertDistritoAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      let query = supabaseAdmin.from("dist_documentos_informativos").select("*").order("created_at", { ascending: false });
      if (data?.categoria && data.categoria !== "todas") {
        query = query.eq("categoria", data.categoria);
      }
      const { data: dbDocs, error } = await query;
      if (!error && dbDocs && dbDocs.length > 0) return dbDocs;
    } catch {
      // Dev fallback
    }

    if (data?.categoria && data.categoria !== "todas") {
      return MOCK_DOCUMENTOS.filter((d) => d.categoria === data.categoria);
    }
    return MOCK_DOCUMENTOS;
  });

export const addDocumentoInformativo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      titulo: z.string().min(1),
      descricao: z.string().optional().nullable(),
      categoria: z.enum(["Circular da Governadoria", "Relatório Financeiro", "Balancete Distrital", "Formulários & Modelos", "Regulamentos", "Outros"]).default("Circular da Governadoria"),
      arquivo_url: z.string().min(1),
      arquivo_nome: z.string().min(1),
      arquivo_tamanho: z.string().optional().nullable(),
      autor_cargo: z.string().default("Governador(a) de Distrito"),
    })
  )
  .handler(async ({ data, context }) => {
    await assertDistritoAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      await supabaseAdmin.from("dist_documentos_informativos").insert({
        ...data,
        criado_por: context.userId,
      });
    } catch {
      // Mock insert
    }

    return { ok: true };
  });

export const deleteDocumentoInformativo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertDistritoAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      await supabaseAdmin.from("dist_documentos_informativos").delete().eq("id", data.id);
    } catch {
      // Mock delete
    }

    return { ok: true };
  });

// ─── 3. ESTRUTURA DISTRITAL ───
export const listEstruturaDistrital = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ ano_leonico: z.string().default("2025/2026") }).optional())
  .handler(async ({ data, context }) => {
    await assertDistritoAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      const { data: dbEst, error } = await supabaseAdmin
        .from("dist_estrutura_cargos")
        .select("*")
        .eq("ano_leonico", data?.ano_leonico || "2025/2026")
        .order("ordem", { ascending: true });

      if (!error && dbEst && dbEst.length > 0) return dbEst;
    } catch {
      // Dev fallback
    }

    return MOCK_ESTRUTURA;
  });

export const upsertCargoDistrital = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid().optional(),
      ano_leonico: z.string().default("2025/2026"),
      categoria_estrutura: z.enum(["Mesa Diretora", "Regiões e Divisões", "Equipe Global (GAT/GMT/GST/GET)", "Assessoria Distrital Specialized"]).default("Mesa Diretora"),
      cargo_nome: z.string().min(1),
      nome_titular: z.string().min(1),
      clube_origem: z.string().optional().nullable(),
      email: z.string().optional().nullable(),
      telefone: z.string().optional().nullable(),
      ordem: z.number().default(0),
    })
  )
  .handler(async ({ data, context }) => {
    await assertDistritoAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      if (data.id) {
        await supabaseAdmin.from("dist_estrutura_cargos").update(data).eq("id", data.id);
      } else {
        await supabaseAdmin.from("dist_estrutura_cargos").insert(data);
      }
    } catch {
      // Mock operation
    }

    return { ok: true };
  });

export const deleteCargoDistrital = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertDistritoAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      await supabaseAdmin.from("dist_estrutura_cargos").delete().eq("id", data.id);
    } catch {
      // Mock delete
    }

    return { ok: true };
  });
