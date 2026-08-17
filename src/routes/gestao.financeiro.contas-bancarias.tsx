import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { Drawer, Field, FormInput, FormSelect, FormRow, FormActions } from "@/components/gestao/GestaoForm";
import { CurrencyInput } from "@/components/gestao/CurrencyInput";
import { listContasBancarias, upsertContaBancaria, deleteContaBancaria } from "@/lib/financeiro.functions";
import { formatBRL } from "@/lib/financeiro.utils";

export const Route = createFileRoute("/gestao/financeiro/contas-bancarias")({
  component: ContasBancariasPage,
});

type Conta = Awaited<ReturnType<typeof listContasBancarias>>[number];

const TIPO_OPTIONS = [
  { value: "corrente", label: "Conta Corrente" },
  { value: "poupanca", label: "Poupança" },
  { value: "investimento", label: "Investimento" },
  { value: "caixa", label: "Caixa Físico" },
];

const EMPTY_FORM = {
  id: undefined as string | undefined,
  nome: "",
  banco: "",
  agencia: "",
  conta: "",
  tipo: "corrente" as const,
  saldo_inicial: 0,
  ativo: true,
};

const TIPO_BADGE: Record<string, string> = {
  corrente: "bg-blue-500/10 text-blue-400",
  poupanca: "bg-emerald-500/10 text-emerald-400",
  investimento: "bg-violet-500/10 text-violet-400",
  caixa: "bg-amber-500/10 text-amber-400",
};

function ContasBancariasPage() {
  const qc = useQueryClient();
  const list = useServerFn(listContasBancarias);
  const upsert = useServerFn(upsertContaBancaria);
  const del = useServerFn(deleteContaBancaria);

  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: contas, isLoading } = useQuery({
    queryKey: ["fin-bancarias"],
    queryFn: () => list({}),
  });

  const saveMut = useMutation({
    mutationFn: (d: typeof form) => upsert({ data: {
      ...d,
      agencia: d.agencia || undefined,
      conta: d.conta || undefined,
    } as any }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Conta bancária salva." });
      setDrawer(false);
      qc.invalidateQueries({ queryKey: ["fin-bancarias"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro" }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Conta excluída." });
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["fin-bancarias"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro" }),
  });

  function openEdit(c: Conta) {
    setForm({
      id: c.id,
      nome: c.nome,
      banco: c.banco,
      agencia: (c as any).agencia ?? "",
      conta: (c as any).conta ?? "",
      tipo: c.tipo as any,
      saldo_inicial: c.saldo_inicial,
      ativo: c.ativo,
    });
    setDrawer(true);
  }

  const totalSaldo = (contas ?? []).filter((c) => c.ativo).reduce((s, c) => s + c.saldo_inicial, 0);

  return (
    <div>
      <GestaoHeader
        title="Contas Bancárias"
        subtitle="Gerencie as contas bancárias e caixas do distrito"
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "Financeiro", to: "/gestao/financeiro" }, { label: "Contas Bancárias" }]}
        actions={
          <button onClick={() => { setForm({ ...EMPTY_FORM }); setDrawer(true); }} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Nova Conta
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

        {/* Cards */}
        {!isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(contas ?? []).filter((c) => c.ativo).map((c) => (
              <div key={c.id} className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                <div className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${TIPO_BADGE[c.tipo] ?? "bg-slate-500/10 text-slate-400"}`}>
                  {TIPO_OPTIONS.find((t) => t.value === c.tipo)?.label ?? c.tipo}
                </div>
                <div className="mt-2 font-display text-lg font-bold text-white">{c.nome}</div>
                <div className="text-xs text-slate-500">{c.banco}</div>
                <div className="mt-2 font-mono text-sm text-slate-300">{formatBRL(c.saldo_inicial)} saldo inicial</div>
                <div className="mt-3 flex gap-1">
                  <button onClick={() => openEdit(c)} className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => setConfirmDelete(c.id)} className="rounded p-1 text-slate-400 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
            {(contas ?? []).filter((c) => c.ativo).length === 0 && !isLoading && (
              <div className="col-span-4 py-12 text-center text-sm text-slate-500">
                Nenhuma conta bancária cadastrada.{" "}
                <button onClick={() => { setForm({ ...EMPTY_FORM }); setDrawer(true); }} className="text-primary underline">Adicionar agora</button>
              </div>
            )}
          </div>
        )}

        {isLoading && <div className="py-12 text-center text-sm text-slate-500">Carregando...</div>}
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

      <Drawer open={drawer} onClose={() => setDrawer(false)} title={form.id ? "Editar Conta Bancária" : "Nova Conta Bancária"}>
        <form onSubmit={(e) => { e.preventDefault(); saveMut.mutate(form); }} className="space-y-5">
          <Field label="Nome da Conta" required>
            <FormInput value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Ex: Conta Principal Banco do Brasil" required />
          </Field>

          <FormRow>
            <Field label="Banco" required>
              <FormInput value={form.banco} onChange={(e) => setForm((f) => ({ ...f, banco: e.target.value }))} placeholder="Ex: Banco do Brasil" required />
            </Field>
            <Field label="Tipo">
              <FormSelect value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as any }))}>
                {TIPO_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </FormSelect>
            </Field>
          </FormRow>

          <FormRow>
            <Field label="Agência">
              <FormInput value={form.agencia} onChange={(e) => setForm((f) => ({ ...f, agencia: e.target.value }))} placeholder="0001" />
            </Field>
            <Field label="Conta / Número">
              <FormInput value={form.conta} onChange={(e) => setForm((f) => ({ ...f, conta: e.target.value }))} placeholder="12345-6" />
            </Field>
          </FormRow>

          <Field label="Saldo Inicial" hint="Informe o saldo na data de início do uso do sistema">
            <CurrencyInput value={form.saldo_inicial} onChange={(v) => setForm((f) => ({ ...f, saldo_inicial: v }))} />
          </Field>

          <Field label="Status">
            <div className="flex items-center gap-2 mt-1">
              <input type="checkbox" id="ativo" checked={form.ativo} onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))} className="accent-primary h-4 w-4" />
              <label htmlFor="ativo" className="text-sm text-slate-300">Conta ativa</label>
            </div>
          </Field>

          <FormActions onCancel={() => setDrawer(false)} loading={saveMut.isPending} />
        </form>
      </Drawer>
    </div>
  );
}
