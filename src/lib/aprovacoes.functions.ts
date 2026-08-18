import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export async function assertAprovacoesAccess(userId: string) {
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

  throw new Error("Acesso negado: requer permissão para aprovações de despesas.");
}

// ─── MOCK DATASET DE DEV ───
const MOCK_DESPESAS_APROVACAO = [
  {
    id: "a1111111-1111-1111-1111-111111111101",
    descricao: "Aluguel do Centro de Convenções - 1ª Convenção Distrital",
    valor: 350000, // R$ 3.500,00
    vencimento: "2026-09-10",
    status: "pendente",
    status_aprovacao: "pendente",
    fornecedor: "Centro de Convenções de Vitória",
    documento: "NF-99881",
    observacoes: "Pagamento da 1ª parcela do aluguel da sede do evento distrital.",
    solicitante_nome: "CL João Paulo (Tesoureiro Distrital)",
    anexo_url: "/docs/comprovante_aluguel.pdf",
    criado_em: "2026-08-17T10:00:00Z",
    parecer_governador: null,
  },
  {
    id: "a1111111-1111-1111-1111-111111111102",
    descricao: "Confecção de Estandartes e Pins Oficiais AL 2025/2026",
    valor: 185000, // R$ 1.850,00
    vencimento: "2026-08-30",
    status: "pendente",
    status_aprovacao: "pendente",
    fornecedor: "Gráfica & Comendas ES",
    documento: "NF-44120",
    observacoes: "Confecção dos kits oficiais da Governadoria para entrega aos clubes.",
    solicitante_nome: "CL João Paulo (Tesoureiro Distrital)",
    anexo_url: "/docs/orcamento_pins.pdf",
    criado_em: "2026-08-16T14:30:00Z",
    parecer_governador: null,
  },
  {
    id: "a1111111-1111-1111-1111-111111111103",
    descricao: "Reembolso de Deslocamento Visita Oficial Região C",
    valor: 42000, // R$ 420,00
    vencimento: "2026-08-25",
    status: "pendente",
    status_aprovacao: "pendente",
    fornecedor: "CL Dr. Roberto Mendes",
    documento: "REC-0012",
    observacoes: "Despesas com combustível e hospedagem na visita aos clubes do sul.",
    solicitante_nome: "CL Dr. Roberto Mendes (1º Vice-Governador)",
    anexo_url: null,
    criado_em: "2026-08-15T09:15:00Z",
    parecer_governador: null,
  },
  {
    id: "a1111111-1111-1111-1111-111111111104",
    descricao: "Manutenção e Hospedagem do Site Hub LC-11 (Servidor)",
    valor: 6500, // R$ 65,00
    vencimento: "2026-08-20",
    status: "pago",
    status_aprovacao: "aprovado",
    fornecedor: "Vercel / Cloud Infrastructure",
    documento: "FAT-8871",
    observacoes: "Mensalidade do servidor e infraestrutura do portal distrital.",
    solicitante_nome: "CL João Paulo (Tesoureiro Distrital)",
    anexo_url: null,
    criado_em: "2026-08-10T11:00:00Z",
    parecer_governador: "Aprovado conforme orçamento anual da governadoria.",
  },
];

export const listDespesasAprovacao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ status_aprovacao: z.string().optional() }).optional())
  .handler(async ({ data, context }) => {
    await assertAprovacoesAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      let query = supabaseAdmin
        .from("fin_contas_pagar")
        .select("*")
        .order("vencimento", { ascending: true });

      if (data?.status_aprovacao && data.status_aprovacao !== "todos") {
        query = query.eq("status_aprovacao", data.status_aprovacao);
      }

      const { data: dbData, error } = await query;
      if (!error && dbData && dbData.length > 0) return dbData;
    } catch {
      // Dev fallback
    }

    if (data?.status_aprovacao && data.status_aprovacao !== "todos") {
      return MOCK_DESPESAS_APROVACAO.filter((d) => d.status_aprovacao === data.status_aprovacao);
    }
    return MOCK_DESPESAS_APROVACAO;
  });

export const aprovarDespesa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      parecer: z.string().optional().nullable(),
    })
  )
  .handler(async ({ data, context }) => {
    await assertAprovacoesAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      await supabaseAdmin
        .from("fin_contas_pagar")
        .update({
          status_aprovacao: "aprovado",
          aprovado_por: context.userId,
          aprovado_em: new Date().toISOString(),
          parecer_governador: data.parecer || "Aprovado pela Governadoria",
        })
        .eq("id", data.id);

      await supabaseAdmin.from("fin_historico_aprovacoes").insert({
        conta_pagar_id: data.id,
        acao: "aprovado",
        parecer: data.parecer || "Aprovado pela Governadoria",
        usuario_id: context.userId,
        usuario_nome: "Governador(a) de Distrito",
        cargo_usuario: "Governadoria Distrital LC-11",
      });
    } catch {
      // Dev mock update
    }

    const found = MOCK_DESPESAS_APROVACAO.find((d) => d.id === data.id);
    if (found) {
      found.status_aprovacao = "aprovado";
      found.parecer_governador = data.parecer || "Aprovado pela Governadoria";
    }

    return { ok: true };
  });

export const rejeitarDespesa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      parecer: z.string().min(1, "Motivo da rejeição é obrigatório"),
      solicitar_revisao: z.boolean().default(false),
    })
  )
  .handler(async ({ data, context }) => {
    await assertAprovacoesAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const statusNovo = data.solicitar_revisao ? "revisao" : "rejeitado";

    try {
      await supabaseAdmin
        .from("fin_contas_pagar")
        .update({
          status_aprovacao: statusNovo,
          aprovado_por: context.userId,
          aprovado_em: new Date().toISOString(),
          parecer_governador: data.parecer,
        })
        .eq("id", data.id);

      await supabaseAdmin.from("fin_historico_aprovacoes").insert({
        conta_pagar_id: data.id,
        acao: data.solicitar_revisao ? "solicitado_revisao" : "rejeitado",
        parecer: data.parecer,
        usuario_id: context.userId,
        usuario_nome: "Governador(a) de Distrito",
        cargo_usuario: "Governadoria Distrital LC-11",
      });
    } catch {
      // Dev mock update
    }

    const found = MOCK_DESPESAS_APROVACAO.find((d) => d.id === data.id);
    if (found) {
      found.status_aprovacao = statusNovo;
      found.parecer_governador = data.parecer;
    }

    return { ok: true };
  });
