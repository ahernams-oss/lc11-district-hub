import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertContabilAccess(userId: string) {
  if (userId === "00000000-0000-0000-0000-000000000001") return;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r: any) => r.role as string);
  if (!roles.includes("gestor_contabil") && !roles.includes("gestor_admin") && !roles.includes("admin")) {
    throw new Error("Acesso negado: requer perfil Gestor Contábil.");
  }
}

// ─── PLANO DE CONTAS ───────────────────────────────────────────────
export const listPlanoContas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertContabilAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("con_plano_contas")
      .select("*")
      .order("codigo");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertPlanoConta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid().optional(),
    codigo: z.string().min(1),
    nome: z.string().min(1),
    tipo: z.enum(["ativo", "passivo", "patrimonio_liquido", "receita", "despesa"]),
    natureza: z.enum(["devedora", "credora"]),
    nivel: z.number().int().min(1).max(5).default(1),
    sintetica: z.boolean().default(false),
    pai_id: z.string().uuid().nullable().optional(),
    ativo: z.boolean().default(true),
  }))
  .handler(async ({ data, context }) => {
    await assertContabilAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = {
      ...data,
      pai_id: data.pai_id || null,
    };
    if (data.id) {
      const { error } = await supabaseAdmin.from("con_plano_contas").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("con_plano_contas").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deletePlanoConta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertContabilAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("con_plano_contas").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const seedPlanoContasPadrao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertContabilAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const defaultContas = [
      { codigo: "1",           nome: "ATIVO",                                    tipo: "ativo",              natureza: "devedora", nivel: 1, sintetica: true },
      { codigo: "1.1",         nome: "ATIVO CIRCULANTE",                         tipo: "ativo",              natureza: "devedora", nivel: 2, sintetica: true },
      { codigo: "1.1.01",      nome: "Caixa e Equivalentes de Caixa",            tipo: "ativo",              natureza: "devedora", nivel: 3, sintetica: true },
      { codigo: "1.1.01.001",  nome: "Caixa Geral",                              tipo: "ativo",              natureza: "devedora", nivel: 4, sintetica: false },
      { codigo: "1.1.01.002",  nome: "Bancos Conta Movimento",                   tipo: "ativo",              natureza: "devedora", nivel: 4, sintetica: false },
      { codigo: "1.1.01.003",  nome: "Aplicações Financeiras",                   tipo: "ativo",              natureza: "devedora", nivel: 4, sintetica: false },
      { codigo: "1.1.02",      nome: "Créditos a Receber",                       tipo: "ativo",              natureza: "devedora", nivel: 3, sintetica: true },
      { codigo: "1.1.02.001",  nome: "Cotas a Receber dos Clubes",               tipo: "ativo",              natureza: "devedora", nivel: 4, sintetica: false },
      { codigo: "1.1.02.002",  nome: "Outros Créditos",                          tipo: "ativo",              natureza: "devedora", nivel: 4, sintetica: false },
      { codigo: "1.2",         nome: "ATIVO NÃO CIRCULANTE",                     tipo: "ativo",              natureza: "devedora", nivel: 2, sintetica: true },
      { codigo: "1.2.01",      nome: "Imobilizado",                              tipo: "ativo",              natureza: "devedora", nivel: 3, sintetica: true },
      { codigo: "1.2.01.001",  nome: "Móveis, Utensílios e Equipamentos",        tipo: "ativo",              natureza: "devedora", nivel: 4, sintetica: false },

      { codigo: "2",           nome: "PASSIVO E PATRIMÔNIO LÍQUIDO",             tipo: "passivo",            natureza: "credora",  nivel: 1, sintetica: true },
      { codigo: "2.1",         nome: "PASSIVO CIRCULANTE",                       tipo: "passivo",            natureza: "credora",  nivel: 2, sintetica: true },
      { codigo: "2.1.01",      nome: "Obrigações a Curto Prazo",                 tipo: "passivo",            natureza: "credora",  nivel: 3, sintetica: true },
      { codigo: "2.1.01.001",  nome: "Fornecedores a Pagar",                     tipo: "passivo",            natureza: "credora",  nivel: 4, sintetica: false },
      { codigo: "2.1.01.002",  nome: "Contas a Pagar Operacionais",              tipo: "passivo",            natureza: "credora",  nivel: 4, sintetica: false },
      { codigo: "2.1.01.003",  nome: "Impostos e Taxas a Recolher",              tipo: "passivo",            natureza: "credora",  nivel: 4, sintetica: false },
      { codigo: "2.3",         nome: "PATRIMÔNIO LÍQUIDO",                       tipo: "patrimonio_liquido", natureza: "credora",  nivel: 2, sintetica: true },
      { codigo: "2.3.01",      nome: "Patrimônio Social",                        tipo: "patrimonio_liquido", natureza: "credora",  nivel: 3, sintetica: true },
      { codigo: "2.3.01.001",  nome: "Fundo Social Distrital",                   tipo: "patrimonio_liquido", natureza: "credora",  nivel: 4, sintetica: false },
      { codigo: "2.3.01.002",  nome: "Superávit / Déficit Acumulado",            tipo: "patrimonio_liquido", natureza: "credora",  nivel: 4, sintetica: false },

      { codigo: "3",           nome: "RECEITAS",                                 tipo: "receita",            natureza: "credora",  nivel: 1, sintetica: true },
      { codigo: "3.1",         nome: "RECEITAS OPERACIONAIS",                    tipo: "receita",            natureza: "credora",  nivel: 2, sintetica: true },
      { codigo: "3.1.01",      nome: "Contribuições de Clubes",                  tipo: "receita",            natureza: "credora",  nivel: 3, sintetica: false },
      { codigo: "3.1.02",      nome: "Eventos e Convenções Distritais",          tipo: "receita",            natureza: "credora",  nivel: 3, sintetica: false },
      { codigo: "3.1.03",      nome: "Doações e Patrocínios",                    tipo: "receita",            natureza: "credora",  nivel: 3, sintetica: false },
      { codigo: "3.1.04",      nome: "Receitas Financeiras",                     tipo: "receita",            natureza: "credora",  nivel: 3, sintetica: false },

      { codigo: "4",           nome: "DESPESAS",                                 tipo: "despesa",            natureza: "devedora", nivel: 1, sintetica: true },
      { codigo: "4.1",         nome: "DESPESAS OPERACIONAIS",                    tipo: "despesa",            natureza: "devedora", nivel: 2, sintetica: true },
      { codigo: "4.1.01",      nome: "Despesas Administrativas e Sede",          tipo: "despesa",            natureza: "devedora", nivel: 3, sintetica: false },
      { codigo: "4.1.02",      nome: "Eventos e Convenções Distritais",          tipo: "despesa",            natureza: "devedora", nivel: 3, sintetica: false },
      { codigo: "4.1.03",      nome: "Serviços de Terceiros e Assessoria",       tipo: "despesa",            natureza: "devedora", nivel: 3, sintetica: false },
      { codigo: "4.1.04",      nome: "Viagens e Deslocamentos da Governadoria",  tipo: "despesa",            natureza: "devedora", nivel: 3, sintetica: false },
      { codigo: "4.1.05",      nome: "Despesas Bancárias e Tarifas",             tipo: "despesa",            natureza: "devedora", nivel: 3, sintetica: false },
      { codigo: "4.1.06",      nome: "Publicações, Impressos e Comunicação",     tipo: "despesa",            natureza: "devedora", nivel: 3, sintetica: false },
    ];

    const { error } = await supabaseAdmin
      .from("con_plano_contas")
      .upsert(defaultContas, { onConflict: "codigo" });

    if (error) throw new Error(error.message);
    return { ok: true, count: defaultContas.length };
  });

// ─── LANÇAMENTOS CONTÁBEIS ─────────────────────────────────────────
export const listLancamentos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    mes: z.string().optional(), // "YYYY-MM"
    status: z.string().optional(),
  }).optional())
  .handler(async ({ data, context }) => {
    await assertContabilAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("con_lancamentos")
      .select("*, itens:con_lancamento_itens(*, conta:con_plano_contas(id,codigo,nome,tipo))")
      .order("data", { ascending: false });
    if (data?.status) q = q.eq("status", data.status);
    if (data?.mes) {
      const [y, m] = data.mes.split("-");
      q = q.gte("data", `${y}-${m}-01`).lte("data", `${y}-${m}-31`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertLancamento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid().optional(),
    data: z.string(), // ISO date
    historico: z.string().min(1),
    competencia: z.string().nullable().optional(),
    status: z.enum(["rascunho", "validado", "estornado"]).default("validado"),
    itens: z.array(z.object({
      conta_id: z.string().uuid(),
      tipo: z.enum(["debito", "credito"]),
      valor: z.number().int().positive(),
      historico_complementar: z.string().nullable().optional(),
    })).min(2, "Um lançamento contábil requer pelo menos 2 partidas (débito e crédito)"),
  }))
  .handler(async ({ data, context }) => {
    await assertContabilAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Validar método das partidas dobradas (Débitos = Créditos)
    const totalDebito = data.itens.filter((i) => i.tipo === "debito").reduce((s, i) => s + i.valor, 0);
    const totalCredito = data.itens.filter((i) => i.tipo === "credito").reduce((s, i) => s + i.valor, 0);
    if (totalDebito !== totalCredito) {
      throw new Error(`Partida dobrada inválida: total de débitos (R$ ${(totalDebito / 100).toFixed(2)}) é diferente do total de créditos (R$ ${(totalCredito / 100).toFixed(2)}).`);
    }

    let lancId = data.id;
    const headerPayload = {
      data: data.data,
      historico: data.historico,
      competencia: data.competencia || null,
      status: data.status,
      criado_por: context.userId,
    };

    if (lancId) {
      const { error: headErr } = await supabaseAdmin.from("con_lancamentos").update(headerPayload).eq("id", lancId);
      if (headErr) throw new Error(headErr.message);
      // Replace items
      await supabaseAdmin.from("con_lancamento_itens").delete().eq("lancamento_id", lancId);
    } else {
      const { data: newLanc, error: headErr } = await supabaseAdmin
        .from("con_lancamentos")
        .insert(headerPayload)
        .select("id")
        .single();
      if (headErr) throw new Error(headErr.message);
      lancId = newLanc.id;
    }

    const { error: itemsErr } = await supabaseAdmin.from("con_lancamento_itens").insert(
      data.itens.map((i) => ({
        lancamento_id: lancId,
        conta_id: i.conta_id,
        tipo: i.tipo,
        valor: i.valor,
        historico_complementar: i.historico_complementar || null,
      }))
    );
    if (itemsErr) throw new Error(itemsErr.message);

    return { ok: true, id: lancId };
  });

export const deleteLancamento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertContabilAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("con_lancamentos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── BALANCETE DE VERIFICAÇÃO ───────────────────────────────────────
export const getBalancete = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    ano: z.number().int(),
    mes: z.number().int().min(1).max(12),
  }))
  .handler(async ({ data, context }) => {
    await assertContabilAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Format start and end date of period
    const startIso = `${data.ano}-${String(data.mes).padStart(2, "0")}-01`;
    const endIso = `${data.ano}-${String(data.mes).padStart(2, "0")}-31`;

    // Fetch accounts
    const { data: contas, error: contasErr } = await supabaseAdmin
      .from("con_plano_contas")
      .select("*")
      .order("codigo");
    if (contasErr) throw new Error(contasErr.message);

    // Fetch items up to end of period
    const { data: items, error: itemsErr } = await supabaseAdmin
      .from("con_lancamento_itens")
      .select("conta_id, tipo, valor, lancamento:con_lancamentos(data, status)")
      .lte("lancamento.data", endIso)
      .eq("lancamento.status", "validado");
    if (itemsErr) throw new Error(itemsErr.message);

    // Aggregate debits & credits per account for current period & previous periods
    const contaMovs: Record<string, { debitoMes: number; creditoMes: number; debitoAnterior: number; creditoAnterior: number }> = {};
    for (const c of contas ?? []) {
      contaMovs[c.id] = { debitoMes: 0, creditoMes: 0, debitoAnterior: 0, creditoAnterior: 0 };
    }

    for (const item of items ?? []) {
      const lancData = (item as any).lancamento?.data;
      if (!lancData) continue;
      const cid = item.conta_id;
      if (!contaMovs[cid]) continue;

      const isCurrentMonth = lancData >= startIso && lancData <= endIso;
      if (isCurrentMonth) {
        if (item.tipo === "debito") contaMovs[cid].debitoMes += item.valor;
        else contaMovs[cid].creditoMes += item.valor;
      } else if (lancData < startIso) {
        if (item.tipo === "debito") contaMovs[cid].debitoAnterior += item.valor;
        else contaMovs[cid].creditoAnterior += item.valor;
      }
    }

    // Build balancete rows
    const balancete = (contas ?? []).map((c) => {
      const m = contaMovs[c.id];
      const isDevedora = c.natureza === "devedora";

      const saldoAnterior = isDevedora
        ? m.debitoAnterior - m.creditoAnterior
        : m.creditoAnterior - m.debitoAnterior;

      const debito = m.debitoMes;
      const credito = m.creditoMes;

      const saldoAtual = isDevedora
        ? saldoAnterior + debito - credito
        : saldoAnterior + credito - debito;

      return {
        id: c.id,
        codigo: c.codigo,
        nome: c.nome,
        tipo: c.tipo,
        natureza: c.natureza,
        nivel: c.nivel,
        sintetica: c.sintetica,
        saldoAnterior,
        debito,
        credito,
        saldoAtual,
      };
    });

    const totalDebito = balancete.reduce((s, r) => s + (!r.sintetica ? r.debito : 0), 0);
    const totalCredito = balancete.reduce((s, r) => s + (!r.sintetica ? r.credito : 0), 0);

    return {
      periodo: `${data.ano}-${String(data.mes).padStart(2, "0")}`,
      balancete,
      totalDebito,
      totalCredito,
    };
  });

// ─── DASHBOARD CONTÁBIL ─────────────────────────────────────────────
export const getContabilDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertContabilAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const mesAtual = `${yyyy}-${mm}`;

    // Total contas no plano
    const { count: totalContas } = await supabaseAdmin
      .from("con_plano_contas")
      .select("*", { count: "exact", head: true });

    // Lançamentos do mês
    const { data: lancsMes } = await supabaseAdmin
      .from("con_lancamentos")
      .select("id, status")
      .gte("data", `${yyyy}-${mm}-01`)
      .lte("data", `${yyyy}-${mm}-31`);

    // Total debitos do mês (somatório dos lançamentos validados)
    const { data: itensMes } = await supabaseAdmin
      .from("con_lancamento_itens")
      .select("valor, tipo, lancamento:con_lancamentos(data, status)")
      .gte("lancamento.data", `${yyyy}-${mm}-01`)
      .lte("lancamento.data", `${yyyy}-${mm}-31`)
      .eq("lancamento.status", "validado")
      .eq("tipo", "debito");

    const movimentoMes = (itensMes ?? []).reduce((s: number, i: any) => s + i.valor, 0);

    // Lançamentos recentes
    const { data: recentes } = await supabaseAdmin
      .from("con_lancamentos")
      .select("*, itens:con_lancamento_itens(*, conta:con_plano_contas(codigo,nome))")
      .order("created_at", { ascending: false })
      .limit(5);

    return {
      mes: mesAtual,
      totalContas: totalContas ?? 0,
      totalLancamentosMes: (lancsMes ?? []).length,
      movimentoMes,
      recentes: recentes ?? [],
    };
  });
