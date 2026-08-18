import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { StatusBadge } from "@/components/gestao/StatusBadge";
import { Drawer, Field, FormInput, FormSelect, FormTextarea, FormRow, FormActions } from "@/components/gestao/GestaoForm";
import { CurrencyInput } from "@/components/gestao/CurrencyInput";
import { listLancamentos, upsertLancamento, deleteLancamento, listPlanoContas } from "@/lib/contabil.functions";
import { formatBRL, formatDate, currentYearMonth, todayISO } from "@/lib/financeiro.utils";

export const Route = createFileRoute("/gestao/contabil/lancamentos")({
  component: LancamentosPage,
});

type Lancamento = Awaited<ReturnType<typeof listLancamentos>>[number];

type ItemLine = {
  conta_id: string;
  tipo: "debito" | "credito";
  valor: number;
  historico_complementar?: string;
};

const EMPTY_FORM = {
  id: undefined as string | undefined,
  data: todayISO(),
  historico: "",
  competencia: "" as string | undefined,
  status: "validado" as const,
  itens: [
    { conta_id: "", tipo: "debito" as const, valor: 0, historico_complementar: "" },
    { conta_id: "", tipo: "credito" as const, valor: 0, historico_complementar: "" },
  ] as ItemLine[],
};

function LancamentosPage() {
  const qc = useQueryClient();
  const list = useServerFn(listLancamentos);
  const upsert = useServerFn(upsertLancamento);
  const del = useServerFn(deleteLancamento);
  const listContas = useServerFn(listPlanoContas);

  const [mes, setMes] = useState(currentYearMonth());
  const [statusFilter, setStatusFilter] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: lancamentos, isLoading } = useQuery({
    queryKey: ["lancamentos", mes, statusFilter],
    queryFn: () => list({ data: { mes, status: statusFilter || undefined } }),
  });

  const { data: planoContas } = useQuery({
    queryKey: ["plano-contas"],
    queryFn: () => listContas({}),
  });

  const saveMut = useMutation({
    mutationFn: (d: typeof form) => upsert({ data: {
      ...d,
      competencia: d.competencia || null,
      itens: d.itens.map((i) => ({ ...i, historico_complementar: i.historico_complementar || null })),
    } as any }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Lançamento contábil registrado com sucesso." });
      setDrawer(false);
      qc.invalidateQueries({ queryKey: ["lancamentos"] });
      qc.invalidateQueries({ queryKey: ["contabil-dashboard"] });
      qc.invalidateQueries({ queryKey: ["financeiro-dashboard"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao salvar lançamento." }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Lançamento excluído." });
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["lancamentos"] });
      qc.invalidateQueries({ queryKey: ["contabil-dashboard"] });
      qc.invalidateQueries({ queryKey: ["financeiro-dashboard"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao excluir." }),
  });

  function openNew() {
    setForm({ ...EMPTY_FORM, data: todayISO() });
    setDrawer(true);
  }

  function openEdit(l: Lancamento) {
    setForm({
      id: l.id,
      data: l.data,
      historico: l.historico,
      competencia: (l as any).competencia ?? "",
      status: l.status as any,
      itens: (l.itens ?? []).map((i: any) => ({
        conta_id: i.conta_id,
        tipo: i.tipo,
        valor: i.valor,
        historico_complementar: i.historico_complementar ?? "",
      })),
    });
    setDrawer(true);
  }

  // Multi-line partidas dobradas logic
  function addLine(tipo: "debito" | "credito") {
    setForm((f) => ({
      ...f,
      itens: [...f.itens, { conta_id: "", tipo, valor: 0, historico_complementar: "" }],
    }));
  }

  function removeLine(index: number) {
    if (form.itens.length <= 2) return;
    setForm((f) => ({
      ...f,
      itens: f.itens.filter((_, i) => i !== index),
    }));
  }

  function updateLine(index: number, patch: Partial<ItemLine>) {
    setForm((f) => ({
      ...f,
      itens: f.itens.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  // Validation
  const totalDebito = form.itens.filter((i) => i.tipo === "debito").reduce((s, i) => s + i.valor, 0);
  const totalCredito = form.itens.filter((i) => i.tipo === "credito").reduce((s, i) => s + i.valor, 0);
  const diferenca = totalDebito - totalCredito;
  const isPartidaValida = totalDebito > 0 && diferenca === 0 && form.itens.every((i) => i.conta_id && i.valor > 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isPartidaValida) return;
    saveMut.mutate(form);
  }

  const contasAnaliticas = (planoContas ?? []).filter((c) => !c.sintetica && c.ativo);

  return (
    <div>
      <GestaoHeader
        title="Lançamentos Contábeis"
        subtitle="Escrituração em partidas dobradas (Débitos e Créditos)"
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "Contábil", to: "/gestao/contabil" }, { label: "Lançamentos" }]}
        actions={
          <button onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Novo Lançamento
          </button>
        }
      />

      <div className="p-6 space-y-5">
        {msg && (
          <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${msg.type === "ok" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-red-500/20 bg-red-500/10 text-red-400"}`}>
            {msg.type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {msg.text}
            <button onClick={() => setMsg(null)} className="ml-auto opacity-60 hover:opacity-100">×</button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-primary"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white outline-none focus:border-primary"
          >
            <option value="">Todos os status</option>
            <option value="validado">Validado</option>
            <option value="rascunho">Rascunho</option>
            <option value="estornado">Estornado</option>
          </select>
        </div>

        {/* Entries List */}
        <div className="rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-slate-500">Carregando...</div>
          ) : (lancamentos ?? []).length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Nenhum lançamento encontrado. <button onClick={openNew} className="text-primary underline">Cadastrar agora</button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {(lancamentos ?? []).map((l) => {
                const valorLancamento = (l.itens ?? [])
                  .filter((i: any) => i.tipo === "debito")
                  .reduce((s: number, i: any) => s + i.valor, 0);

                return (
                  <div key={l.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-slate-500">#{l.id.slice(0, 8)}</span>
                        <span className="font-semibold text-white text-sm">{l.historico}</span>
                        <StatusBadge status={l.status} />
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400">{formatDate(l.data)}</span>
                        <span className="font-mono font-bold text-white text-sm">{formatBRL(valorLancamento)}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(l)} className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setConfirmDelete(l.id)} className="rounded p-1 text-slate-400 hover:bg-red-500/10 hover:text-red-400">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Partidas */}
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 rounded-lg border border-white/5 bg-white/[0.01] p-3 text-xs">
                      {/* Débitos */}
                      <div>
                        <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          <ArrowUpRight className="h-3 w-3" /> Débitos (D)
                        </div>
                        <div className="space-y-1">
                          {(l.itens ?? []).filter((i: any) => i.tipo === "debito").map((i: any) => (
                            <div key={i.id} className="flex justify-between font-mono text-slate-300">
                              <span className="truncate mr-2">{i.conta?.codigo} — {i.conta?.nome}</span>
                              <span className="font-semibold text-emerald-400 shrink-0">{formatBRL(i.valor)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Créditos */}
                      <div>
                        <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400">
                          <ArrowDownRight className="h-3 w-3" /> Créditos (C)
                        </div>
                        <div className="space-y-1">
                          {(l.itens ?? []).filter((i: any) => i.tipo === "credito").map((i: any) => (
                            <div key={i.id} className="flex justify-between font-mono text-slate-300">
                              <span className="truncate mr-2">{i.conta?.codigo} — {i.conta?.nome}</span>
                              <span className="font-semibold text-red-400 shrink-0">{formatBRL(i.valor)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setConfirmDelete(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0d1321] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">Confirmar exclusão</h3>
            <p className="mt-2 text-sm text-slate-400">Tem certeza que deseja excluir este lançamento contábil?</p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300">Cancelar</button>
              <button onClick={() => delMut.mutate(confirmDelete!)} disabled={delMut.isPending} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50">
                {delMut.isPending ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Form Drawer */}
      <Drawer open={drawer} onClose={() => setDrawer(false)} title={form.id ? "Editar Lançamento" : "Novo Lançamento Contábil"} width="w-[640px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormRow>
            <Field label="Data do Lançamento" required>
              <FormInput
                type="date"
                value={form.data}
                onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                required
              />
            </Field>
            <Field label="Competência">
              <FormInput
                type="month"
                value={form.competencia ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, competencia: e.target.value || undefined }))}
              />
            </Field>
          </FormRow>

          <Field label="Histórico Contábil" required hint="Descrição clara da transação contábil">
            <FormInput
              value={form.historico}
              onChange={(e) => setForm((f) => ({ ...f, historico: e.target.value }))}
              placeholder="Ex: Pagamento de aluguel da sede referente ao mês X"
              required
            />
          </Field>

          {/* Partidas Dobradas Section */}
          <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <div className="font-display font-bold text-white text-sm">Partidas Dobradas (Débitos e Créditos)</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addLine("debito")}
                  className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20"
                >
                  + Débito
                </button>
                <button
                  type="button"
                  onClick={() => addLine("credito")}
                  className="rounded bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20"
                >
                  + Crédito
                </button>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-3">
              {form.itens.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/5 p-3">
                  <div className="w-24 shrink-0">
                    <select
                      value={item.tipo}
                      onChange={(e) => updateLine(idx, { tipo: e.target.value as any })}
                      className={`w-full rounded-md border px-2 py-1.5 text-xs font-bold outline-none ${
                        item.tipo === "debito"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-red-500/30 bg-red-500/10 text-red-400"
                      }`}
                    >
                      <option value="debito" className="bg-[#0d1321] text-emerald-400">Débito (D)</option>
                      <option value="credito" className="bg-[#0d1321] text-red-400">Crédito (C)</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-0">
                    <select
                      value={item.conta_id}
                      onChange={(e) => updateLine(idx, { conta_id: e.target.value })}
                      className="w-full rounded-md border border-white/10 bg-[#0d1321] px-2.5 py-1.5 text-xs text-white outline-none focus:border-primary"
                      required
                    >
                      <option value="">Selecione a conta analítica</option>
                      {contasAnaliticas.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.codigo} — {c.nome} ({c.natureza.substring(0, 3)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-32 shrink-0">
                    <CurrencyInput
                      value={item.valor}
                      onChange={(v) => updateLine(idx, { valor: v })}
                      className="text-xs py-1.5"
                    />
                  </div>

                  {form.itens.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="rounded p-1.5 text-slate-500 hover:text-red-400 hover:bg-white/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Partida balance summary */}
            <div className="mt-4 rounded-lg border border-white/10 bg-[#0d1321] p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Débitos (D):</span>
                <span className="font-mono font-bold text-emerald-400">{formatBRL(totalDebito)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Créditos (C):</span>
                <span className="font-mono font-bold text-red-400">{formatBRL(totalCredito)}</span>
              </div>
              <div className="flex justify-between border-t border-white/8 pt-1.5">
                <span className="font-semibold text-slate-200">Diferença (D - C):</span>
                <span className={`font-mono font-bold ${diferenca === 0 && totalDebito > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {formatBRL(diferenca)}
                </span>
              </div>

              {diferenca !== 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-red-400 mt-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>O lançamento contábil deve estar equilibrado (Débitos = Créditos).</span>
                </div>
              )}
            </div>
          </div>

          <FormActions onCancel={() => setDrawer(false)} loading={saveMut.isPending} label={isPartidaValida ? "Salvar Lançamento" : "Partida desequilibrada"} />
        </form>
      </Drawer>
    </div>
  );
}
