import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { StatusBadge } from "@/components/gestao/StatusBadge";
import { Drawer, Field, FormInput, FormSelect, FormTextarea, FormActions } from "@/components/gestao/GestaoForm";
import { CurrencyInput } from "@/components/gestao/CurrencyInput";
import { listOrcamentos, upsertOrcamento, listCategorias } from "@/lib/financeiro.functions";
import { formatBRL } from "@/lib/financeiro.utils";

export const Route = createFileRoute("/gestao/financeiro/orcamento")({
  component: OrcamentoPage,
});

type Orcamento = Awaited<ReturnType<typeof listOrcamentos>>[number];

function OrcamentoPage() {
  const qc = useQueryClient();
  const listOrc = useServerFn(listOrcamentos);
  const upsert = useServerFn(upsertOrcamento);
  const listCats = useServerFn(listCategorias);

  const [drawer, setDrawer] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | undefined>();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Form state
  const [formAno, setFormAno] = useState(new Date().getFullYear());
  const [formDesc, setFormDesc] = useState("");
  const [formStatus, setFormStatus] = useState<"rascunho" | "aprovado" | "fechado">("rascunho");
  const [formItens, setFormItens] = useState<Record<string, number>>({});

  const { data: orcamentos, isLoading } = useQuery({
    queryKey: ["orcamentos"],
    queryFn: () => listOrc({}),
  });
  const { data: categorias } = useQuery({ queryKey: ["fin-categorias"], queryFn: () => listCats({}) });

  const saveMut = useMutation({
    mutationFn: () => upsert({ data: {
      id: editId,
      ano: formAno,
      descricao: formDesc || null,
      status: formStatus,
      itens: Object.entries(formItens)
        .filter(([, v]) => v > 0)
        .map(([categoria_id, valor_previsto]) => ({ categoria_id, valor_previsto })),
    }}),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Orçamento salvo." });
      setDrawer(false);
      qc.invalidateQueries({ queryKey: ["orcamentos"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro" }),
  });

  function openNew() {
    setEditId(undefined);
    setFormAno(new Date().getFullYear());
    setFormDesc("");
    setFormStatus("rascunho");
    setFormItens({});
    setDrawer(true);
  }

  function openEdit(o: Orcamento) {
    setEditId(o.id);
    setFormAno(o.ano);
    setFormDesc((o as any).descricao ?? "");
    setFormStatus(o.status as any);
    const itens: Record<string, number> = {};
    for (const item of (o as any).itens ?? []) {
      itens[item.categoria_id] = item.valor_previsto;
    }
    setFormItens(itens);
    setDrawer(true);
  }

  const catsReceita = (categorias ?? []).filter((c: any) => c.tipo === "receita");
  const catsDespesa = (categorias ?? []).filter((c: any) => c.tipo === "despesa");

  function totalPrevisto(o: Orcamento, tipo?: "receita" | "despesa") {
    const itens = (o as any).itens ?? [];
    return itens
      .filter((i: any) => !tipo || i.categoria?.tipo === tipo)
      .reduce((s: number, i: any) => s + i.valor_previsto, 0);
  }

  return (
    <div>
      <GestaoHeader
        title="Orçamento Anual"
        subtitle="Planejamento e acompanhamento orçamentário do distrito"
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "Financeiro", to: "/gestao/financeiro" }, { label: "Orçamento" }]}
        actions={
          <button onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Novo Orçamento
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

        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-500">Carregando...</div>
        ) : (orcamentos ?? []).length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Nenhum orçamento cadastrado.{" "}
            <button onClick={openNew} className="text-primary underline">Criar o primeiro orçamento</button>
          </div>
        ) : (
          <div className="space-y-4">
            {(orcamentos ?? []).map((o) => {
              const isExpanded = expanded === o.id;
              const receitas = totalPrevisto(o, "receita");
              const despesas = totalPrevisto(o, "despesa");

              return (
                <div key={o.id} className="rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden">
                  {/* Header */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : o.id)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-display font-bold text-white">{o.ano}</div>
                      {(o as any).descricao && <div className="text-sm text-slate-400">{(o as any).descricao}</div>}
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Receitas previstas</div>
                        <div className="text-emerald-400 font-semibold">{formatBRL(receitas)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Despesas previstas</div>
                        <div className="text-red-400 font-semibold">{formatBRL(despesas)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Superávit/Déficit</div>
                        <div className={`font-bold ${receitas - despesas >= 0 ? "text-white" : "text-red-400"}`}>{formatBRL(receitas - despesas)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(o); }}
                          className="rounded p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </div>
                    </div>
                  </button>

                  {/* Detail */}
                  {isExpanded && (
                    <div className="border-t border-white/8 px-6 py-5">
                      <div className="grid gap-6 lg:grid-cols-2">
                        {[{ label: "Receitas", items: (o as any).itens?.filter((i: any) => i.categoria?.tipo === "receita") ?? [], color: "text-emerald-400" },
                          { label: "Despesas", items: (o as any).itens?.filter((i: any) => i.categoria?.tipo === "despesa") ?? [], color: "text-red-400" }].map((section) => (
                          <div key={section.label}>
                            <div className={`mb-3 text-xs font-semibold uppercase tracking-wider ${section.color}`}>{section.label}</div>
                            <div className="space-y-2">
                              {section.items.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full" style={{ background: item.categoria?.cor }} />
                                    <span className="text-slate-300">{item.categoria?.nome}</span>
                                  </div>
                                  <span className="font-mono text-white">{formatBRL(item.valor_previsto)}</span>
                                </div>
                              ))}
                              {section.items.length === 0 && (
                                <div className="text-xs text-slate-600">Nenhum item cadastrado</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Drawer */}
      <Drawer open={drawer} onClose={() => setDrawer(false)} title={editId ? "Editar Orçamento" : "Novo Orçamento"} width="w-[560px]">
        <form onSubmit={(e) => { e.preventDefault(); saveMut.mutate(); }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ano" required>
              <FormInput
                type="number"
                value={formAno}
                onChange={(e) => setFormAno(parseInt(e.target.value))}
                min={2020} max={2050} required
              />
            </Field>
            <Field label="Status">
              <FormSelect value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)}>
                <option value="rascunho">Rascunho</option>
                <option value="aprovado">Aprovado</option>
                <option value="fechado">Fechado</option>
              </FormSelect>
            </Field>
          </div>

          <Field label="Descrição">
            <FormInput value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Ex: Orçamento Ano Leonístico 2025-2026" />
          </Field>

          {/* Receitas */}
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">Receitas Previstas</div>
            <div className="space-y-3">
              {catsReceita.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.cor }} />
                    <span className="text-sm text-slate-300 truncate">{c.nome}</span>
                  </div>
                  <div className="w-44 shrink-0">
                    <CurrencyInput value={formItens[c.id] ?? 0} onChange={(v) => setFormItens((prev) => ({ ...prev, [c.id]: v }))} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Despesas */}
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-red-400">Despesas Previstas</div>
            <div className="space-y-3">
              {catsDespesa.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.cor }} />
                    <span className="text-sm text-slate-300 truncate">{c.nome}</span>
                  </div>
                  <div className="w-44 shrink-0">
                    <CurrencyInput value={formItens[c.id] ?? 0} onChange={(v) => setFormItens((prev) => ({ ...prev, [c.id]: v }))} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals preview */}
          <div className="rounded-lg border border-white/8 bg-white/[0.02] p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Receitas</span>
              <span className="text-emerald-400 font-semibold">{formatBRL(catsReceita.reduce((s: number, c: any) => s + (formItens[c.id] ?? 0), 0))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Despesas</span>
              <span className="text-red-400 font-semibold">{formatBRL(catsDespesa.reduce((s: number, c: any) => s + (formItens[c.id] ?? 0), 0))}</span>
            </div>
            <div className="flex justify-between border-t border-white/8 pt-2">
              <span className="text-slate-300 font-medium">Superávit / Déficit</span>
              <span className={`font-bold ${
                catsReceita.reduce((s: number, c: any) => s + (formItens[c.id] ?? 0), 0) -
                catsDespesa.reduce((s: number, c: any) => s + (formItens[c.id] ?? 0), 0) >= 0
                  ? "text-white" : "text-red-400"
              }`}>
                {formatBRL(
                  catsReceita.reduce((s: number, c: any) => s + (formItens[c.id] ?? 0), 0) -
                  catsDespesa.reduce((s: number, c: any) => s + (formItens[c.id] ?? 0), 0)
                )}
              </span>
            </div>
          </div>

          <FormActions onCancel={() => setDrawer(false)} loading={saveMut.isPending} />
        </form>
      </Drawer>
    </div>
  );
}
