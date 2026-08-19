import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { Drawer, Field, FormInput, FormSelect, FormTextarea, FormRow, FormActions } from "@/components/gestao/GestaoForm";
import { CurrencyInput } from "@/components/gestao/CurrencyInput";
import { listMovimentacoes, upsertMovimentacao, deleteMovimentacao, listCategorias, listContasBancarias } from "@/lib/financeiro.functions";
import { formatBRL, formatDate, currentYearMonth } from "@/lib/financeiro.utils";

export const Route = createFileRoute("/gestao/financeiro/movimentacoes")({
  component: MovimentacoesPage,
});

type Mov = Awaited<ReturnType<typeof listMovimentacoes>>[number];

const EMPTY_FORM = {
  id: undefined as string | undefined,
  conta_id: "",
  categoria_id: "" as string | undefined,
  tipo: "saida" as "entrada" | "saida",
  descricao: "",
  valor: 0,
  data: "",
  documento: "",
  conciliado: false,
  observacoes: "",
};

function MovimentacoesPage() {
  const qc = useQueryClient();
  const listMov = useServerFn(listMovimentacoes);
  const upsert = useServerFn(upsertMovimentacao);
  const del = useServerFn(deleteMovimentacao);
  const listCats = useServerFn(listCategorias);
  const listContas = useServerFn(listContasBancarias);

  const [mes, setMes] = useState(currentYearMonth());
  const [tipoFilter, setTipoFilter] = useState("");
  const [contaFilter, setContaFilter] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: movs, isLoading } = useQuery({
    queryKey: ["movimentacoes", mes, tipoFilter, contaFilter],
    queryFn: () => listMov({ data: {
      mes,
      tipo: tipoFilter || undefined,
      conta_id: contaFilter || undefined,
    }}),
  });

  const { data: categorias } = useQuery({ queryKey: ["fin-categorias"], queryFn: () => listCats({}) });
  const { data: bancarias } = useQuery({ queryKey: ["fin-bancarias"], queryFn: () => listContas({}) });

  const saveMut = useMutation({
    mutationFn: (d: typeof form) => upsert({ data: {
      ...d,
      categoria_id: d.categoria_id || null,
      documento: d.documento || null,
      observacoes: d.observacoes || null,
    } as any }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Movimentação salva." });
      setDrawer(false);
      qc.invalidateQueries({ queryKey: ["movimentacoes"] });
      qc.invalidateQueries({ queryKey: ["financeiro-dashboard"] });
      qc.invalidateQueries({ queryKey: ["contabil-dashboard"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro" }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Registro excluído." });
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["movimentacoes"] });
      qc.invalidateQueries({ queryKey: ["financeiro-dashboard"] });
      qc.invalidateQueries({ queryKey: ["contabil-dashboard"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro" }),
  });

  function openEdit(m: Mov) {
    setForm({
      id: m.id,
      conta_id: (m as any).conta_id ?? "",
      categoria_id: (m as any).categoria_id ?? "",
      tipo: m.tipo as any,
      descricao: m.descricao,
      valor: m.valor,
      data: m.data,
      documento: (m as any).documento ?? "",
      conciliado: m.conciliado,
      observacoes: (m as any).observacoes ?? "",
    });
    setDrawer(true);
  }

  const entradas = (movs ?? []).filter((m) => m.tipo === "entrada").reduce((s, m) => s + m.valor, 0);
  const saidas = (movs ?? []).filter((m) => m.tipo === "saida").reduce((s, m) => s + m.valor, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.conta_id) return;
    saveMut.mutate(form);
  }

  return (
    <div>
      <GestaoHeader
        title="Movimentações"
        subtitle="Extrato de entradas e saídas nas contas bancárias"
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "Financeiro", to: "/gestao/financeiro" }, { label: "Movimentações" }]}
        actions={
          <button onClick={() => { setForm({ ...EMPTY_FORM }); setDrawer(true); }} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Nova Movimentação
          </button>
        }
      />

      <div className="p-6 space-y-5">
        {msg && (
          <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${msg.type === "ok" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-red-500/20 bg-red-500/10 text-red-400"}`}>
            {msg.type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {msg.text}
            <button onClick={() => setMsg(null)} className="ml-auto">×</button>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider">
              <ArrowUpCircle className="h-3.5 w-3.5 text-emerald-400" /> Entradas
            </div>
            <div className="mt-1 text-xl font-bold text-emerald-400">{formatBRL(entradas)}</div>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider">
              <ArrowDownCircle className="h-3.5 w-3.5 text-red-400" /> Saídas
            </div>
            <div className="mt-1 text-xl font-bold text-red-400">{formatBRL(saidas)}</div>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Saldo do período</div>
            <div className={`mt-1 text-xl font-bold ${entradas - saidas >= 0 ? "text-white" : "text-red-400"}`}>{formatBRL(entradas - saidas)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <input type="month" value={mes} onChange={(e) => setMes(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-primary" />
          <select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white outline-none focus:border-primary">
            <option value="">Todas as movimentações</option>
            <option value="entrada">Somente entradas</option>
            <option value="saida">Somente saídas</option>
          </select>
          <select value={contaFilter} onChange={(e) => setContaFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white outline-none focus:border-primary">
            <option value="">Todas as contas</option>
            {(bancarias ?? []).map((b: any) => <option key={b.id} value={b.id}>{b.nome}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-slate-500">Carregando...</div>
          ) : (movs ?? []).length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Nenhuma movimentação encontrada.
            </div>
          ) : (
            <div className="w-full overflow-x-auto"><table className="min-w-[760px] w-full text-sm">
              <thead className="border-b border-white/8 bg-white/[0.02] text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3">Conta</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 w-20">Ações</th>
                </tr>
              </thead>
              <tbody>
                {(movs ?? []).map((m) => (
                  <tr key={m.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-slate-300 text-xs">{formatDate(m.data)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {m.tipo === "entrada"
                          ? <ArrowUpCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                          : <ArrowDownCircle className="h-4 w-4 shrink-0 text-red-400" />}
                        <div>
                          <div className="font-medium text-white">{m.descricao}</div>
                          {m.conciliado && <div className="text-[10px] text-slate-500">Conciliado</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{(m as any).conta?.nome ?? "—"}</td>
                    <td className="px-4 py-3">
                      {(m as any).categoria ? (
                        <span className="flex items-center gap-1.5 text-xs text-slate-300">
                          <span className="h-2 w-2 rounded-full" style={{ background: (m as any).categoria.cor }} />
                          {(m as any).categoria.nome}
                        </span>
                      ) : "—"}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-semibold ${m.tipo === "entrada" ? "text-emerald-400" : "text-red-400"}`}>
                      {m.tipo === "entrada" ? "+" : "-"}{formatBRL(m.valor)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(m)} className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setConfirmDelete(m.id)} className="rounded p-1 text-slate-400 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setConfirmDelete(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0d1321] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">Confirmar exclusão</h3>
            <p className="mt-2 text-sm text-slate-400">Tem certeza? Esta ação não pode ser desfeita.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300">Cancelar</button>
              <button onClick={() => delMut.mutate(confirmDelete!)} disabled={delMut.isPending} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50">
                {delMut.isPending ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </>
      )}

      <Drawer open={drawer} onClose={() => setDrawer(false)} title={form.id ? "Editar Movimentação" : "Nova Movimentação"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Tipo" required>
            <div className="grid grid-cols-2 gap-2">
              {(["entrada", "saida"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, tipo: t }))}
                  className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition ${
                    form.tipo === t
                      ? t === "entrada"
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                        : "border-red-500/50 bg-red-500/10 text-red-400"
                      : "border-white/10 text-slate-400 hover:bg-white/5"
                  }`}
                >
                  {t === "entrada" ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                  {t === "entrada" ? "Entrada" : "Saída"}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Conta Bancária" required>
            <FormSelect value={form.conta_id} onChange={(e) => setForm((f) => ({ ...f, conta_id: e.target.value }))} required>
              <option value="">Selecione a conta</option>
              {(bancarias ?? []).map((b: any) => <option key={b.id} value={b.id}>{b.nome} — {b.banco}</option>)}
            </FormSelect>
          </Field>

          <Field label="Descrição" required>
            <FormInput value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} placeholder="Descrição da movimentação" required />
          </Field>

          <FormRow>
            <Field label="Valor" required>
              <CurrencyInput value={form.valor} onChange={(v) => setForm((f) => ({ ...f, valor: v }))} />
            </Field>
            <Field label="Data" required>
              <FormInput type="date" value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))} required />
            </Field>
          </FormRow>

          <Field label="Categoria">
            <FormSelect value={form.categoria_id ?? ""} onChange={(e) => setForm((f) => ({ ...f, categoria_id: e.target.value || undefined }))}>
              <option value="">Sem categoria</option>
              {(categorias ?? [])
                .filter((c: any) => form.tipo === "entrada" ? c.tipo === "receita" : c.tipo === "despesa")
                .map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </FormSelect>
          </Field>

          <FormRow>
            <Field label="Documento">
              <FormInput value={form.documento ?? ""} onChange={(e) => setForm((f) => ({ ...f, documento: e.target.value }))} placeholder="NF, recibo, etc." />
            </Field>
            <Field label="Conciliado">
              <div className="flex items-center gap-2 mt-2.5">
                <input type="checkbox" id="conciliado" checked={form.conciliado} onChange={(e) => setForm((f) => ({ ...f, conciliado: e.target.checked }))} className="accent-primary h-4 w-4" />
                <label htmlFor="conciliado" className="text-sm text-slate-300">Marcado como conciliado</label>
              </div>
            </Field>
          </FormRow>

          <Field label="Observações">
            <FormTextarea value={form.observacoes ?? ""} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} />
          </Field>

          <FormActions onCancel={() => setDrawer(false)} loading={saveMut.isPending} />
        </form>
      </Drawer>
    </div>
  );
}
