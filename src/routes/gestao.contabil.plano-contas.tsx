import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, Search, Folder, FileText, Sparkles } from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { Drawer, Field, FormInput, FormSelect, FormRow, FormActions } from "@/components/gestao/GestaoForm";
import { listPlanoContas, upsertPlanoConta, deletePlanoConta, seedPlanoContasPadrao } from "@/lib/contabil.functions";

export const Route = createFileRoute("/gestao/contabil/plano-contas")({
  component: PlanoContasPage,
});

type Conta = Awaited<ReturnType<typeof listPlanoContas>>[number];

const TIPO_OPTIONS = [
  { value: "ativo", label: "Ativo", natureza: "devedora" },
  { value: "passivo", label: "Passivo", natureza: "credora" },
  { value: "patrimonio_liquido", label: "Patrimônio Líquido", natureza: "credora" },
  { value: "receita", label: "Receita", natureza: "credora" },
  { value: "despesa", label: "Despesa", natureza: "devedora" },
] as const;

const TIPO_BADGE: Record<string, string> = {
  ativo: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  passivo: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  patrimonio_liquido: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  receita: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  despesa: "bg-red-500/10 text-red-400 border-red-500/20",
};

const EMPTY_FORM = {
  id: undefined as string | undefined,
  codigo: "",
  nome: "",
  tipo: "ativo" as Conta["tipo"],
  natureza: "devedora" as Conta["natureza"],
  nivel: 1,
  sintetica: false,
  pai_id: "" as string | undefined,
  ativo: true,
};

function PlanoContasPage() {
  const qc = useQueryClient();
  const list = useServerFn(listPlanoContas);
  const upsert = useServerFn(upsertPlanoConta);
  const del = useServerFn(deletePlanoConta);
  const seed = useServerFn(seedPlanoContasPadrao);

  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: contas, isLoading } = useQuery({
    queryKey: ["plano-contas"],
    queryFn: () => list({}),
  });

  const seedMut = useMutation({
    mutationFn: () => seed({}),
    onSuccess: (res) => {
      setMsg({ type: "ok", text: `Plano de contas padrão gerado com sucesso! (${res.count} contas)` });
      qc.invalidateQueries({ queryKey: ["plano-contas"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao gerador plano padrão." }),
  });

  const saveMut = useMutation({
    mutationFn: (d: typeof form) => upsert({ data: {
      ...d,
      pai_id: d.pai_id || null,
    } as any }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Conta contábil salva." });
      setDrawer(false);
      qc.invalidateQueries({ queryKey: ["plano-contas"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao salvar." }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Conta excluída." });
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["plano-contas"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao excluir." }),
  });

  function openNew(pai?: Conta) {
    if (pai) {
      setForm({
        ...EMPTY_FORM,
        codigo: `${pai.codigo}.`,
        tipo: pai.tipo as any,
        natureza: pai.natureza as any,
        nivel: Math.min(pai.nivel + 1, 5),
        sintetica: false,
        pai_id: pai.id,
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
    setDrawer(true);
  }

  function openEdit(c: Conta) {
    setForm({
      id: c.id,
      codigo: c.codigo,
      nome: c.nome,
      tipo: c.tipo as any,
      natureza: c.natureza as any,
      nivel: c.nivel,
      sintetica: c.sintetica,
      pai_id: (c as any).pai_id ?? "",
      ativo: c.ativo,
    });
    setDrawer(true);
  }

  function handleTipoChange(t: Conta["tipo"]) {
    const opt = TIPO_OPTIONS.find((o) => o.value === t);
    setForm((f) => ({
      ...f,
      tipo: t,
      natureza: (opt?.natureza ?? "devedora") as any,
    }));
  }

  function handleCodigoChange(c: string) {
    // Auto-calculate level based on dots count
    const parts = c.split(".").filter(Boolean);
    const nivel = Math.max(1, Math.min(parts.length, 5));

    // Auto-detect type by first digit
    let tipo = form.tipo;
    if (parts.length > 0) {
      const firstDigit = parts[0];
      if (firstDigit === "1") tipo = "ativo";
      else if (firstDigit === "2") tipo = "passivo";
      else if (firstDigit === "3") tipo = "receita";
      else if (firstDigit === "4") tipo = "despesa";
    }

    const opt = TIPO_OPTIONS.find((o) => o.value === tipo);

    setForm((f) => ({
      ...f,
      codigo: c,
      nivel,
      tipo,
      natureza: (opt?.natureza ?? f.natureza) as any,
    }));
  }

  const filtered = (contas ?? []).filter((c) => {
    if (tipoFilter && c.tipo !== tipoFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.codigo.toLowerCase().includes(q) || c.nome.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div>
      <GestaoHeader
        title="Plano de Contas"
        subtitle="Estrutura hierárquica das contas contábeis do distrito"
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "Contábil", to: "/gestao/contabil" }, { label: "Plano de Contas" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => seedMut.mutate()}
              disabled={seedMut.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/10 disabled:opacity-50"
              title="Gerar estrutura padrão de contas para Distrito Lions"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {seedMut.isPending ? "Gerando..." : "Gerar Plano Padrão"}
            </button>
            <button onClick={() => openNew()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Nova Conta
            </button>
          </div>
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

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por código ou nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTipoFilter("")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${!tipoFilter ? "bg-primary text-white" : "border border-white/10 text-slate-400 hover:bg-white/5"}`}
            >
              Todas ({(contas ?? []).length})
            </button>
            {TIPO_OPTIONS.map((t) => {
              const count = (contas ?? []).filter((c) => c.tipo === t.value).length;
              return (
                <button
                  key={t.value}
                  onClick={() => setTipoFilter(t.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${tipoFilter === t.value ? "bg-primary text-white" : "border border-white/10 text-slate-400 hover:bg-white/5"}`}
                >
                  {t.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Tree Table */}
        <div className="rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-slate-500">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Nenhuma conta encontrada. <button onClick={() => openNew()} className="text-primary underline">Cadastrar conta</button>
            </div>
          ) : (
            <div className="w-full overflow-x-auto"><table className="min-w-[760px] w-full text-sm">
              <thead className="border-b border-white/8 bg-white/[0.02] text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 w-40">Código</th>
                  <th className="px-4 py-3">Nome da Conta</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Natureza</th>
                  <th className="px-4 py-3 text-center">Classe</th>
                  <th className="px-4 py-3 w-24">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const indent = (c.nivel - 1) * 20;

                  return (
                    <tr
                      key={c.id}
                      className={`border-t border-white/5 transition-colors hover:bg-white/[0.02] ${c.sintetica ? "font-semibold text-white bg-white/[0.01]" : "text-slate-300"}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs">{c.codigo}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2" style={{ paddingLeft: `${indent}px` }}>
                          {c.sintetica ? (
                            <Folder className="h-4 w-4 shrink-0 text-amber-400" />
                          ) : (
                            <FileText className="h-4 w-4 shrink-0 text-slate-500" />
                          )}
                          <span>{c.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${TIPO_BADGE[c.tipo]}`}>
                          {TIPO_OPTIONS.find((t) => t.value === c.tipo)?.label ?? c.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize text-xs text-slate-400">{c.natureza}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] ${c.sintetica ? "bg-amber-500/10 text-amber-400 font-bold" : "bg-slate-800 text-slate-400"}`}>
                          {c.sintetica ? "Sintética" : "Analítica"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {c.sintetica && (
                            <button
                              onClick={() => openNew(c)}
                              className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-emerald-400"
                              title="Adicionar subconta"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => openEdit(c)}
                            className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white"
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(c.id)}
                            className="rounded p-1 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setConfirmDelete(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0d1321] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">Confirmar exclusão</h3>
            <p className="mt-2 text-sm text-slate-400">Tem certeza que deseja excluir esta conta contábil? Lançamentos associados podem ser afetados.</p>
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
      <Drawer open={drawer} onClose={() => setDrawer(false)} title={form.id ? "Editar Conta Contábil" : "Nova Conta Contábil"}>
        <form onSubmit={(e) => { e.preventDefault(); saveMut.mutate(form); }} className="space-y-5">
          <FormRow>
            <Field label="Código" required hint="Ex: 1.1.01.001">
              <FormInput
                value={form.codigo}
                onChange={(e) => handleCodigoChange(e.target.value)}
                placeholder="1.1.01.001"
                required
              />
            </Field>
            <Field label="Nível (1 a 5)">
              <FormInput
                type="number"
                min={1} max={5}
                value={form.nivel}
                onChange={(e) => setForm((f) => ({ ...f, nivel: parseInt(e.target.value) || 1 }))}
              />
            </Field>
          </FormRow>

          <Field label="Nome da Conta" required>
            <FormInput
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Bancos Conta Movimento"
              required
            />
          </Field>

          <FormRow>
            <Field label="Tipo da Conta" required>
              <FormSelect
                value={form.tipo}
                onChange={(e) => handleTipoChange(e.target.value as any)}
              >
                {TIPO_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </FormSelect>
            </Field>
            <Field label="Natureza Contábil">
              <FormSelect
                value={form.natureza}
                onChange={(e) => setForm((f) => ({ ...f, natureza: e.target.value as any }))}
              >
                <option value="devedora">Devedora</option>
                <option value="credora">Credora</option>
              </FormSelect>
            </Field>
          </FormRow>

          <Field label="Classe da Conta">
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                <input
                  type="radio"
                  name="sintetica"
                  checked={form.sintetica}
                  onChange={() => setForm((f) => ({ ...f, sintetica: true }))}
                  className="accent-primary"
                />
                <span>Sintética (Grupo de contas)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                <input
                  type="radio"
                  name="sintetica"
                  checked={!form.sintetica}
                  onChange={() => setForm((f) => ({ ...f, sintetica: false }))}
                  className="accent-primary"
                />
                <span>Analítica (Recebe lançamentos)</span>
              </label>
            </div>
          </Field>

          <Field label="Conta Pai (Hierarquia)">
            <FormSelect
              value={form.pai_id ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, pai_id: e.target.value || undefined }))}
            >
              <option value="">Nenhuma (Raiz / Nível 1)</option>
              {(contas ?? [])
                .filter((c) => c.sintetica && c.id !== form.id)
                .map((c) => <option key={c.id} value={c.id}>{c.codigo} — {c.nome}</option>)}
            </FormSelect>
          </Field>

          <FormActions onCancel={() => setDrawer(false)} loading={saveMut.isPending} />
        </form>
      </Drawer>
    </div>
  );
}
