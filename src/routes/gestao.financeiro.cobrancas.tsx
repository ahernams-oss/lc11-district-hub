import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { StatusBadge } from "@/components/gestao/StatusBadge";
import { Drawer, Field, FormInput, FormSelect, FormTextarea, FormRow, FormActions } from "@/components/gestao/GestaoForm";
import { CurrencyInput } from "@/components/gestao/CurrencyInput";
import { listCobrancas, upsertCobranca, deleteCobranca } from "@/lib/financeiro.functions";
import { formatBRL, formatDate } from "@/lib/financeiro.utils";

export const Route = createFileRoute("/gestao/financeiro/cobrancas")({
  component: CobrancasPage,
});

type Cobranca = Awaited<ReturnType<typeof listCobrancas>>[number];

const STATUS_OPTIONS = ["pendente", "pago", "vencido", "cancelado"] as const;
const EMPTY_FORM = {
  id: undefined as string | undefined,
  club_id: "" as string | undefined,
  descricao: "",
  valor: 0,
  vencimento: "",
  status: "pendente" as const,
  referencia: "",
  observacoes: "",
};

function CobrancasPage() {
  const qc = useQueryClient();
  const list = useServerFn(listCobrancas);
  const upsert = useServerFn(upsertCobranca);
  const del = useServerFn(deleteCobranca);

  const [statusFilter, setStatusFilter] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: cobrancas, isLoading } = useQuery({
    queryKey: ["cobrancas", statusFilter],
    queryFn: () => list({ data: { status: statusFilter || undefined } }),
  });

  const saveMut = useMutation({
    mutationFn: (d: typeof form) => upsert({ data: {
      ...d,
      club_id: d.club_id || null,
      referencia: d.referencia || null,
      observacoes: d.observacoes || null,
    } as any }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Cobrança salva com sucesso." });
      setDrawer(false);
      qc.invalidateQueries({ queryKey: ["cobrancas"] });
      qc.invalidateQueries({ queryKey: ["financeiro-dashboard"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro" }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Cobrança excluída." });
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["cobrancas"] });
      qc.invalidateQueries({ queryKey: ["financeiro-dashboard"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro" }),
  });

  function openEdit(c: Cobranca) {
    setForm({
      id: c.id,
      club_id: (c as any).club_id ?? "",
      descricao: c.descricao,
      valor: c.valor,
      vencimento: c.vencimento,
      status: c.status as any,
      referencia: (c as any).referencia ?? "",
      observacoes: (c as any).observacoes ?? "",
    });
    setDrawer(true);
  }

  const totalPendente = (cobrancas ?? []).filter((c) => c.status === "pendente").reduce((s, c) => s + c.valor, 0);
  const totalPago = (cobrancas ?? []).filter((c) => c.status === "pago").reduce((s, c) => s + c.valor, 0);
  const totalVencido = (cobrancas ?? []).filter((c) => c.status === "vencido").reduce((s, c) => s + c.valor, 0);

  return (
    <div>
      <GestaoHeader
        title="Cobranças"
        subtitle="Gestão de cobranças para clubes do distrito"
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "Financeiro", to: "/gestao/financeiro" }, { label: "Cobranças" }]}
        actions={
          <button onClick={() => { setForm({ ...EMPTY_FORM }); setDrawer(true); }} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Nova Cobrança
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
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Pendente</div>
            <div className="mt-1 text-xl font-bold text-amber-400">{formatBRL(totalPendente)}</div>
            <div className="mt-0.5 text-xs text-slate-500">{(cobrancas ?? []).filter((c) => c.status === "pendente").length} cobranças</div>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Recebido</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">{formatBRL(totalPago)}</div>
            <div className="mt-0.5 text-xs text-slate-500">{(cobrancas ?? []).filter((c) => c.status === "pago").length} cobranças</div>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Vencido</div>
            <div className="mt-1 text-xl font-bold text-red-400">{formatBRL(totalVencido)}</div>
            <div className="mt-0.5 text-xs text-slate-500">{(cobrancas ?? []).filter((c) => c.status === "vencido").length} cobranças</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white outline-none focus:border-primary">
            <option value="">Todos os status</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-slate-500">Carregando...</div>
          ) : (cobrancas ?? []).length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">Nenhuma cobrança encontrada.</div>
          ) : (
            <div className="w-full overflow-x-auto"><table className="min-w-[760px] w-full text-sm">
              <thead className="border-b border-white/8 bg-white/[0.02] text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Clube</th>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3">Referência</th>
                  <th className="px-4 py-3">Vencimento</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 w-20">Ações</th>
                </tr>
              </thead>
              <tbody>
                {(cobrancas ?? []).map((c) => (
                  <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-slate-300">{(c as any).clube?.name ?? "—"}</td>
                    <td className="px-4 py-3 font-medium text-white">{c.descricao}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{(c as any).referencia ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-300">{formatDate(c.vencimento)}</td>
                    <td className="px-4 py-3 text-right font-mono text-white">{formatBRL(c.valor)}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(c)} className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setConfirmDelete(c.id)} className="rounded p-1 text-slate-400 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
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

      <Drawer open={drawer} onClose={() => setDrawer(false)} title={form.id ? "Editar Cobrança" : "Nova Cobrança"}>
        <form onSubmit={(e) => { e.preventDefault(); saveMut.mutate(form); }} className="space-y-5">
          <Field label="Descrição" required>
            <FormInput value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} placeholder="Ex: Cota Mensal Outubro 2025" required />
          </Field>

          <FormRow>
            <Field label="Valor" required>
              <CurrencyInput value={form.valor} onChange={(v) => setForm((f) => ({ ...f, valor: v }))} />
            </Field>
            <Field label="Vencimento" required>
              <FormInput type="date" value={form.vencimento} onChange={(e) => setForm((f) => ({ ...f, vencimento: e.target.value }))} required />
            </Field>
          </FormRow>

          <FormRow>
            <Field label="Status">
              <FormSelect value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </FormSelect>
            </Field>
            <Field label="Referência">
              <FormInput value={form.referencia ?? ""} onChange={(e) => setForm((f) => ({ ...f, referencia: e.target.value }))} placeholder="Ex: Cota 2025-06" />
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
