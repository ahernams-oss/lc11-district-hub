import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

  throw new Error("Acesso negado: requer perfil Gestor Financeiro.");
}

// ─── CATEGORIAS ───────────────────────────────────────────────────
export const listCategorias = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("fin_categorias")
      .select("*")
      .order("ordem");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertCategoria = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid().optional(),
    nome: z.string().min(1),
    tipo: z.enum(["receita", "despesa"]),
    cor: z.string().default("#6366f1"),
    ordem: z.number().int().default(0),
    ativo: z.boolean().default(true),
  }))
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.id) {
      const { error } = await supabaseAdmin.from("fin_categorias").update(data).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("fin_categorias").insert(data);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteCategoria = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("fin_categorias").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── CONTAS BANCÁRIAS ─────────────────────────────────────────────
export const listContasBancarias = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("fin_contas_bancarias")
      .select("*")
      .order("nome");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertContaBancaria = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid().optional(),
    nome: z.string().min(1),
    banco: z.string().min(1),
    agencia: z.string().optional(),
    conta: z.string().optional(),
    tipo: z.enum(["corrente","poupanca","investimento","caixa"]).default("corrente"),
    saldo_inicial: z.number().int().default(0),
    ativo: z.boolean().default(true),
  }))
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.id) {
      const { error } = await supabaseAdmin.from("fin_contas_bancarias").update(data).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("fin_contas_bancarias").insert(data);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteContaBancaria = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("fin_contas_bancarias").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── CONTAS A PAGAR ───────────────────────────────────────────────
export const listContasPagar = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    status: z.string().optional(),
    mes: z.string().optional(), // "YYYY-MM"
    categoria_id: z.string().uuid().optional(),
  }).optional())
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("fin_contas_pagar")
      .select("*, categoria:fin_categorias(id,nome,cor,tipo), conta:fin_contas_bancarias(id,nome,banco)")
      .order("vencimento");
    if (data?.status) q = q.eq("status", data.status);
    if (data?.categoria_id) q = q.eq("categoria_id", data.categoria_id);
    if (data?.mes) {
      const [y, m] = data.mes.split("-");
      q = q.gte("vencimento", `${y}-${m}-01`).lte("vencimento", `${y}-${m}-31`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertContaPagar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid().optional(),
    descricao: z.string().min(1),
    categoria_id: z.string().uuid().nullable().optional(),
    conta_id: z.string().uuid().nullable().optional(),
    valor: z.number().int().positive(),
    vencimento: z.string(), // ISO date
    competencia: z.string().nullable().optional(),
    status: z.enum(["pendente","pago","vencido","cancelado"]).default("pendente"),
    pago_em: z.string().nullable().optional(),
    valor_pago: z.number().int().nullable().optional(),
    fornecedor: z.string().nullable().optional(),
    documento: z.string().nullable().optional(),
    anexo_url: z.string().nullable().optional(),
    observacoes: z.string().nullable().optional(),
  }))
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = { ...data, criado_por: context.userId };
    if (data.id) {
      const { error } = await supabaseAdmin.from("fin_contas_pagar").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("fin_contas_pagar").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteContaPagar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("fin_contas_pagar").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── CONTAS A RECEBER ─────────────────────────────────────────────
export const listContasReceber = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    status: z.string().optional(),
    mes: z.string().optional(),
    categoria_id: z.string().uuid().optional(),
  }).optional())
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("fin_contas_receber")
      .select("*, categoria:fin_categorias(id,nome,cor,tipo), conta:fin_contas_bancarias(id,nome,banco)")
      .order("vencimento");
    if (data?.status) q = q.eq("status", data.status);
    if (data?.categoria_id) q = q.eq("categoria_id", data.categoria_id);
    if (data?.mes) {
      const [y, m] = data.mes.split("-");
      q = q.gte("vencimento", `${y}-${m}-01`).lte("vencimento", `${y}-${m}-31`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertContaReceber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid().optional(),
    descricao: z.string().min(1),
    categoria_id: z.string().uuid().nullable().optional(),
    conta_id: z.string().uuid().nullable().optional(),
    valor: z.number().int().positive(),
    vencimento: z.string(),
    competencia: z.string().nullable().optional(),
    status: z.enum(["pendente","recebido","vencido","cancelado"]).default("pendente"),
    recebido_em: z.string().nullable().optional(),
    valor_recebido: z.number().int().nullable().optional(),
    pagador: z.string().nullable().optional(),
    documento: z.string().nullable().optional(),
    anexo_url: z.string().nullable().optional(),
    observacoes: z.string().nullable().optional(),
  }))
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = { ...data, criado_por: context.userId };
    if (data.id) {
      const { error } = await supabaseAdmin.from("fin_contas_receber").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("fin_contas_receber").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteContaReceber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("fin_contas_receber").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── MOVIMENTAÇÕES ────────────────────────────────────────────────
export const listMovimentacoes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    conta_id: z.string().uuid().optional(),
    mes: z.string().optional(), // "YYYY-MM"
    tipo: z.string().optional(),
  }).optional())
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("fin_movimentacoes")
      .select("*, categoria:fin_categorias(id,nome,cor,tipo), conta:fin_contas_bancarias(id,nome,banco)")
      .order("data", { ascending: false });
    if (data?.conta_id) q = q.eq("conta_id", data.conta_id);
    if (data?.tipo) q = q.eq("tipo", data.tipo);
    if (data?.mes) {
      const [y, m] = data.mes.split("-");
      q = q.gte("data", `${y}-${m}-01`).lte("data", `${y}-${m}-31`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertMovimentacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid().optional(),
    conta_id: z.string().uuid(),
    categoria_id: z.string().uuid().nullable().optional(),
    tipo: z.enum(["entrada","saida"]),
    descricao: z.string().min(1),
    valor: z.number().int().positive(),
    data: z.string(),
    documento: z.string().nullable().optional(),
    conciliado: z.boolean().default(false),
    observacoes: z.string().nullable().optional(),
  }))
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = { ...data, criado_por: context.userId };
    if (data.id) {
      const { error } = await supabaseAdmin.from("fin_movimentacoes").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("fin_movimentacoes").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteMovimentacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("fin_movimentacoes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── ORÇAMENTO ────────────────────────────────────────────────────
export const listOrcamentos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("fin_orcamento")
      .select("*, itens:fin_orcamento_itens(*, categoria:fin_categorias(id,nome,cor,tipo))")
      .order("ano", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertOrcamento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid().optional(),
    ano: z.number().int().min(2020).max(2050),
    descricao: z.string().nullable().optional(),
    status: z.enum(["rascunho","aprovado","fechado"]).default("rascunho"),
    itens: z.array(z.object({
      categoria_id: z.string().uuid(),
      valor_previsto: z.number().int().nonnegative(),
      observacoes: z.string().nullable().optional(),
    })),
  }))
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let orcId = data.id;
    if (orcId) {
      const { error } = await supabaseAdmin.from("fin_orcamento").update({
        ano: data.ano, descricao: data.descricao, status: data.status,
      }).eq("id", orcId);
      if (error) throw new Error(error.message);
      // Replace all items
      await supabaseAdmin.from("fin_orcamento_itens").delete().eq("orcamento_id", orcId);
    } else {
      const { data: newOrc, error } = await supabaseAdmin.from("fin_orcamento")
        .insert({ ano: data.ano, descricao: data.descricao, status: data.status, criado_por: context.userId })
        .select("id").single();
      if (error) throw new Error(error.message);
      orcId = newOrc.id;
    }
    if (data.itens.length > 0) {
      const { error } = await supabaseAdmin.from("fin_orcamento_itens")
        .insert(data.itens.map((i) => ({ ...i, orcamento_id: orcId })));
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ─── COBRANÇAS ────────────────────────────────────────────────────
export const listCobrancas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    status: z.string().optional(),
    club_id: z.string().uuid().optional(),
  }).optional())
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("fin_cobrancas")
      .select("*, clube:clubs(id,name,city)")
      .order("vencimento");
    if (data?.status) q = q.eq("status", data.status);
    if (data?.club_id) q = q.eq("club_id", data.club_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertCobranca = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid().optional(),
    club_id: z.string().uuid().nullable().optional(),
    descricao: z.string().min(1),
    valor: z.number().int().positive(),
    vencimento: z.string(),
    status: z.enum(["pendente","pago","vencido","cancelado"]).default("pendente"),
    referencia: z.string().nullable().optional(),
    observacoes: z.string().nullable().optional(),
  }))
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = { ...data, criado_por: context.userId };
    if (data.id) {
      const { error } = await supabaseAdmin.from("fin_cobrancas").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("fin_cobrancas").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteCobranca = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("fin_cobrancas").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── DASHBOARD / RESUMO ───────────────────────────────────────────
export const getFinanceiroDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertFinanceiroAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const mesAtual = `${yyyy}-${mm}`;
    const hoje = now.toISOString().split("T")[0];
    const em7dias = new Date(now.getTime() + 7 * 86400000).toISOString().split("T")[0];

    // Contas bancárias com saldo_inicial
    const { data: contas } = await supabaseAdmin.from("fin_contas_bancarias").select("id,nome,saldo_inicial").eq("ativo", true);

    // Movimentações do mês
    const { data: movs } = await supabaseAdmin
      .from("fin_movimentacoes")
      .select("tipo,valor")
      .gte("data", `${yyyy}-${mm}-01`)
      .lte("data", `${yyyy}-${mm}-31`);

    const entradas = (movs ?? []).filter((m: any) => m.tipo === "entrada").reduce((s: number, m: any) => s + m.valor, 0);
    const saidas   = (movs ?? []).filter((m: any) => m.tipo === "saida").reduce((s: number, m: any) => s + m.valor, 0);
    const saldoInicial = (contas ?? []).reduce((s: number, c: any) => s + c.saldo_inicial, 0);

    // Contas a vencer em 7 dias
    const { data: aVencer } = await supabaseAdmin
      .from("fin_contas_pagar")
      .select("valor")
      .eq("status", "pendente")
      .gte("vencimento", hoje)
      .lte("vencimento", em7dias);

    // Contas vencidas não pagas
    const { data: vencidas } = await supabaseAdmin
      .from("fin_contas_pagar")
      .select("valor")
      .eq("status", "pendente")
      .lt("vencimento", hoje);

    // Cobranças pendentes
    const { data: cobrancasPendentes } = await supabaseAdmin
      .from("fin_cobrancas")
      .select("valor")
      .eq("status", "pendente");

    // Fluxo últimos 6 meses (movimentações)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split("T")[0];
    const { data: fluxoRows } = await supabaseAdmin
      .from("fin_movimentacoes")
      .select("tipo,valor,data")
      .gte("data", sixMonthsAgo)
      .order("data");

    // Aggregate by month
    const fluxoMap: Record<string, { entrada: number; saida: number }> = {};
    for (const row of fluxoRows ?? []) {
      const key = (row as any).data.substring(0, 7);
      if (!fluxoMap[key]) fluxoMap[key] = { entrada: 0, saida: 0 };
      if ((row as any).tipo === "entrada") fluxoMap[key].entrada += (row as any).valor;
      else fluxoMap[key].saida += (row as any).valor;
    }
    const fluxo = Object.entries(fluxoMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, v]) => ({ mes, ...v, saldo: v.entrada - v.saida }));

    return {
      saldoTotal: saldoInicial + entradas - saidas,
      entradas,
      saidas,
      aVencer7d: (aVencer ?? []).reduce((s: number, r: any) => s + r.valor, 0),
      vencidas: (vencidas ?? []).reduce((s: number, r: any) => s + r.valor, 0),
      cobrancasPendentes: (cobrancasPendentes ?? []).reduce((s: number, r: any) => s + r.valor, 0),
      fluxo,
      mes: mesAtual,
    };
  });
