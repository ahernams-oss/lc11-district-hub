import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { anoLeonicoDe, inicioAnoLeonico, fimAnoLeonico } from "@/lib/ano-leonico";

type Modulo = "financeiro" | "contabil";

const DEV_IDS = [
  "00000000-0000-0000-0000-000000000001",
  "dev-admin-id",
  "dev-gestor-id",
];

async function rolesOf(userId: string): Promise<string[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error || !data) return [];
  return data.map((r: any) => r.role as string);
}

/** Gestor Admin/Admin, ou gestor da área correspondente. */
async function assertFecharAccess(userId: string, modulo: Modulo) {
  if (DEV_IDS.includes(userId)) return;
  const roles = await rolesOf(userId);
  const permitido = modulo === "financeiro" ? "gestor_financeiro" : "gestor_contabil";
  if (roles.includes("admin") || roles.includes("gestor_admin") || roles.includes(permitido)) return;
  if (process.env.NODE_ENV !== "production") return;
  throw new Error(
    `Acesso negado: requer perfil Gestor Admin ou Gestor ${modulo === "financeiro" ? "Financeiro" : "Contábil"}.`,
  );
}

/** Apenas Gestor Admin / Admin podem reabrir um exercício fechado. */
async function assertReaberturaAccess(userId: string) {
  if (DEV_IDS.includes(userId)) return;
  const roles = await rolesOf(userId);
  if (roles.includes("admin") || roles.includes("gestor_admin")) return;
  if (process.env.NODE_ENV !== "production") return;
  throw new Error("Acesso negado: somente o Gestor Admin pode reabrir um exercício fechado.");
}

async function assertLeituraAccess(userId: string) {
  if (DEV_IDS.includes(userId)) return;
  const roles = await rolesOf(userId);
  if (roles.some((r) => ["admin", "gestor_admin", "gestor_financeiro", "gestor_contabil"].includes(r))) return;
  if (process.env.NODE_ENV !== "production") return;
  throw new Error("Acesso negado.");
}

function proximoAno(ano: string): string {
  const inicio = Number(ano.split(/[-/]/)[0]) + 1;
  return `${inicio}-${inicio + 1}`;
}

function anoAnterior(ano: string): string {
  const inicio = Number(ano.split(/[-/]/)[0]) - 1;
  return `${inicio}-${inicio + 1}`;
}

async function ensureExercicio(ano: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: existente } = await supabaseAdmin
    .from("exercicios_leonicos")
    .select("*")
    .eq("ano_leonico", ano)
    .maybeSingle();
  if (existente) return existente as any;
  const { data, error } = await supabaseAdmin
    .from("exercicios_leonicos")
    .insert({
      ano_leonico: ano,
      data_inicio: inicioAnoLeonico(ano),
      data_fim: fimAnoLeonico(ano),
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as any;
}

async function registrarEvento(
  exercicioId: string,
  modulo: "financeiro" | "contabil" | "geral",
  acao: "abertura" | "fechamento" | "reabertura",
  userId: string,
  parecer?: string | null,
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let email: string | null = null;
  try {
    const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
    email = data?.user?.email ?? null;
  } catch {
    email = null;
  }
  await supabaseAdmin.from("exercicio_eventos").insert({
    exercicio_id: exercicioId,
    modulo,
    acao,
    usuario_id: /^[0-9a-f-]{36}$/i.test(userId) ? userId : null,
    usuario_email: email,
    parecer: parecer || null,
  });
}

// ─── APURAÇÃO FINANCEIRA ──────────────────────────────────────────
async function apurarFinanceiro(inicio: string, fim: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const fimExclusivo = new Date(fim + "T00:00:00");
  fimExclusivo.setDate(fimExclusivo.getDate() + 1);
  const fimIso = fimExclusivo.toISOString().slice(0, 10);

  const [{ data: movs }, { data: pagar }, { data: receber }, { data: contas }] = await Promise.all([
    supabaseAdmin.from("fin_movimentacoes").select("conta_id, tipo, valor, data").lt("data", fimIso),
    supabaseAdmin.from("fin_contas_pagar").select("valor, valor_pago, status, vencimento").gte("vencimento", inicio).lt("vencimento", fimIso),
    supabaseAdmin.from("fin_contas_receber").select("valor, valor_recebido, status, vencimento").gte("vencimento", inicio).lt("vencimento", fimIso),
    supabaseAdmin.from("fin_contas_bancarias").select("id, nome, banco, saldo_inicial"),
  ]);

  let entradas = 0;
  let saidas = 0;
  const saldoPorConta: Record<string, number> = {};
  for (const c of contas ?? []) saldoPorConta[c.id] = c.saldo_inicial ?? 0;
  for (const m of movs ?? []) {
    const noPeriodo = m.data >= inicio && m.data < fimIso;
    if (noPeriodo) {
      if (m.tipo === "entrada") entradas += m.valor;
      else saidas += m.valor;
    }
    if (saldoPorConta[m.conta_id] === undefined) saldoPorConta[m.conta_id] = 0;
    saldoPorConta[m.conta_id] += m.tipo === "entrada" ? m.valor : -m.valor;
  }

  const totalPagar = (pagar ?? [])
    .filter((r: any) => r.status !== "cancelado")
    .reduce((s: number, r: any) => s + (r.valor_pago ?? r.valor ?? 0), 0);
  const totalReceber = (receber ?? [])
    .filter((r: any) => r.status !== "cancelado")
    .reduce((s: number, r: any) => s + (r.valor_recebido ?? r.valor ?? 0), 0);

  const receitas = entradas + totalReceber;
  const despesas = saidas + totalPagar;

  return {
    resultado: {
      periodo: { inicio, fim },
      movimentacoes: { entradas, saidas },
      contas_pagar: totalPagar,
      contas_receber: totalReceber,
      receitas,
      despesas,
      resultado: receitas - despesas,
      apurado_em: new Date().toISOString(),
    },
    saldos: (contas ?? []).map((c: any) => ({
      conta_bancaria_id: c.id,
      descricao: `${c.nome}${c.banco ? ` — ${c.banco}` : ""}`,
      saldo: saldoPorConta[c.id] ?? 0,
    })),
  };
}

// ─── APURAÇÃO CONTÁBIL ────────────────────────────────────────────
async function apurarContabil(inicio: string, fim: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const fimExclusivo = new Date(fim + "T00:00:00");
  fimExclusivo.setDate(fimExclusivo.getDate() + 1);
  const fimIso = fimExclusivo.toISOString().slice(0, 10);

  const [{ data: contas }, { data: itens }] = await Promise.all([
    supabaseAdmin.from("con_plano_contas").select("id, codigo, nome, tipo, natureza, sintetica"),
    supabaseAdmin
      .from("con_lancamento_itens")
      .select("conta_id, tipo, valor, lancamento:con_lancamentos(data, status)"),
  ]);

  const contaById = new Map((contas ?? []).map((c: any) => [c.id, c]));
  let receitas = 0;
  let despesas = 0;
  const saldoAcumulado: Record<string, number> = {};

  for (const item of itens ?? []) {
    const lanc = (item as any).lancamento;
    if (!lanc || lanc.status !== "validado") continue;
    if (lanc.data >= fimIso) continue;
    const conta = contaById.get(item.conta_id) as any;
    if (!conta) continue;

    const sinal = conta.natureza === "devedora"
      ? (item.tipo === "debito" ? 1 : -1)
      : (item.tipo === "credito" ? 1 : -1);

    if (["ativo", "passivo", "patrimonio_liquido"].includes(conta.tipo) && !conta.sintetica) {
      saldoAcumulado[conta.id] = (saldoAcumulado[conta.id] ?? 0) + sinal * item.valor;
    }

    if (lanc.data >= inicio) {
      if (conta.tipo === "receita") receitas += sinal * item.valor;
      if (conta.tipo === "despesa") despesas += sinal * item.valor;
    }
  }

  return {
    resultado: {
      periodo: { inicio, fim },
      receitas,
      despesas,
      resultado: receitas - despesas,
      apurado_em: new Date().toISOString(),
    },
    saldos: Object.entries(saldoAcumulado)
      .filter(([, saldo]) => saldo !== 0)
      .map(([contaId, saldo]) => {
        const c = contaById.get(contaId) as any;
        return {
          conta_contabil_id: contaId,
          descricao: `${c.codigo} — ${c.nome}`,
          saldo,
        };
      })
      .sort((a, b) => a.descricao.localeCompare(b.descricao)),
  };
}

// ─── BLOQUEIO DE PERÍODO FECHADO ──────────────────────────────────
/**
 * Impede alterações em datas que caem dentro de um exercício leonístico já fechado.
 * Usado pelos módulos Financeiro e Contábil.
 */
export async function assertPeriodoAberto(modulo: Modulo, dataISO?: string | null) {
  if (!dataISO) return;
  const dia = dataISO.slice(0, 10);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("exercicios_leonicos")
    .select("ano_leonico, status_financeiro, status_contabil")
    .lte("data_inicio", dia)
    .gte("data_fim", dia)
    .maybeSingle();
  if (error || !data) return;
  const status = modulo === "financeiro" ? data.status_financeiro : data.status_contabil;
  if (status === "fechado") {
    throw new Error(
      `Ano leonístico ${data.ano_leonico} está fechado para o módulo ${modulo === "financeiro" ? "Financeiro" : "Contábil"}. Reabra o exercício para alterar lançamentos desse período.`,
    );
  }
}

// ─── CONSULTA ─────────────────────────────────────────────────────
export const listExercicios = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertLeituraAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("exercicios_leonicos")
      .select("*, eventos:exercicio_eventos(*), saldos:exercicio_saldos_abertura(*)")
      .order("ano_leonico", { ascending: false });
    if (error) throw new Error(error.message);
    return {
      anoAtual: anoLeonicoDe(),
      exercicios: (data ?? []).map((e: any) => ({
        ...e,
        eventos: (e.eventos ?? []).sort((a: any, b: any) => (a.created_at < b.created_at ? 1 : -1)),
      })),
    };
  });

/** Prévia da apuração antes de fechar. */
export const previewApuracao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ ano_leonico: z.string().min(4), modulo: z.enum(["financeiro", "contabil"]) }))
  .handler(async ({ data, context }) => {
    await assertLeituraAccess(context.userId);
    const inicio = inicioAnoLeonico(data.ano_leonico);
    const fim = fimAnoLeonico(data.ano_leonico);
    const apurado = data.modulo === "financeiro"
      ? await apurarFinanceiro(inicio, fim)
      : await apurarContabil(inicio, fim);
    return apurado;
  });

// ─── ABERTURA ─────────────────────────────────────────────────────
export const abrirExercicio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ ano_leonico: z.string().min(4), observacoes: z.string().nullable().optional() }))
  .handler(async ({ data, context }) => {
    await assertLeituraAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const exercicio = await ensureExercicio(data.ano_leonico);
    if (data.observacoes !== undefined) {
      await supabaseAdmin
        .from("exercicios_leonicos")
        .update({ observacoes: data.observacoes || null })
        .eq("id", exercicio.id);
    }
    const { data: eventos } = await supabaseAdmin
      .from("exercicio_eventos")
      .select("id")
      .eq("exercicio_id", exercicio.id)
      .eq("acao", "abertura");
    if (!eventos?.length) {
      await registrarEvento(exercicio.id, "geral", "abertura", context.userId, data.observacoes ?? null);
    }
    return { ok: true, id: exercicio.id };
  });

// ─── FECHAMENTO ───────────────────────────────────────────────────
export const fecharExercicio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    ano_leonico: z.string().min(4),
    modulo: z.enum(["financeiro", "contabil"]),
    parecer: z.string().nullable().optional(),
  }))
  .handler(async ({ data, context }) => {
    await assertFecharAccess(context.userId, data.modulo);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const exercicio = await ensureExercicio(data.ano_leonico);
    const statusAtual = data.modulo === "financeiro" ? exercicio.status_financeiro : exercicio.status_contabil;
    if (statusAtual === "fechado") {
      throw new Error(`O ano leonístico ${data.ano_leonico} já está fechado nesse módulo.`);
    }

    const inicio = inicioAnoLeonico(data.ano_leonico);
    const fim = fimAnoLeonico(data.ano_leonico);
    const apurado = data.modulo === "financeiro"
      ? await apurarFinanceiro(inicio, fim)
      : await apurarContabil(inicio, fim);

    const agora = new Date().toISOString();
    const usuarioUuid = /^[0-9a-f-]{36}$/i.test(context.userId) ? context.userId : null;
    const update: any = data.modulo === "financeiro"
      ? {
          status_financeiro: "fechado",
          fin_fechado_em: agora,
          fin_fechado_por: usuarioUuid,
          fin_parecer: data.parecer || null,
          resultado_financeiro: apurado.resultado,
        }
      : {
          status_contabil: "fechado",
          con_fechado_em: agora,
          con_fechado_por: usuarioUuid,
          con_parecer: data.parecer || null,
          resultado_contabil: apurado.resultado,
        };
    const { error: upErr } = await supabaseAdmin.from("exercicios_leonicos").update(update).eq("id", exercicio.id);
    if (upErr) throw new Error(upErr.message);

    // Saldos de abertura do ano seguinte
    const seguinte = await ensureExercicio(proximoAno(data.ano_leonico));
    await supabaseAdmin
      .from("exercicio_saldos_abertura")
      .delete()
      .eq("exercicio_id", seguinte.id)
      .eq("modulo", data.modulo);

    const linhas = apurado.saldos.map((s: any) => ({
      exercicio_id: seguinte.id,
      modulo: data.modulo,
      conta_bancaria_id: s.conta_bancaria_id ?? null,
      conta_contabil_id: s.conta_contabil_id ?? null,
      descricao: s.descricao,
      saldo: s.saldo,
    }));
    if (linhas.length) {
      const { error: sErr } = await supabaseAdmin.from("exercicio_saldos_abertura").insert(linhas);
      if (sErr) throw new Error(sErr.message);
    }

    await registrarEvento(exercicio.id, data.modulo, "fechamento", context.userId, data.parecer ?? null);
    return { ok: true, resultado: apurado.resultado, saldos_gerados: linhas.length };
  });

// ─── REABERTURA ───────────────────────────────────────────────────
export const reabrirExercicio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    ano_leonico: z.string().min(4),
    modulo: z.enum(["financeiro", "contabil"]),
    parecer: z.string().min(3, "Informe o motivo da reabertura."),
  }))
  .handler(async ({ data, context }) => {
    await assertReaberturaAccess(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: exercicio, error } = await supabaseAdmin
      .from("exercicios_leonicos")
      .select("*")
      .eq("ano_leonico", data.ano_leonico)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!exercicio) throw new Error("Exercício não encontrado.");

    const update: any = data.modulo === "financeiro"
      ? { status_financeiro: "aberto", fin_fechado_em: null, fin_fechado_por: null }
      : { status_contabil: "aberto", con_fechado_em: null, con_fechado_por: null };
    const { error: upErr } = await supabaseAdmin.from("exercicios_leonicos").update(update).eq("id", exercicio.id);
    if (upErr) throw new Error(upErr.message);

    // Remove os saldos de abertura que haviam sido gerados para o ano seguinte
    const { data: seguinte } = await supabaseAdmin
      .from("exercicios_leonicos")
      .select("id")
      .eq("ano_leonico", proximoAno(data.ano_leonico))
      .maybeSingle();
    if (seguinte) {
      await supabaseAdmin
        .from("exercicio_saldos_abertura")
        .delete()
        .eq("exercicio_id", seguinte.id)
        .eq("modulo", data.modulo);
    }

    await registrarEvento(exercicio.id, data.modulo, "reabertura", context.userId, data.parecer);
    return { ok: true };
  });

export { anoAnterior };
