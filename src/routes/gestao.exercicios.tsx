import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  CalendarCheck,
  Lock,
  LockOpen,
  CheckCircle2,
  XCircle,
  Plus,
  History,
  Wallet,
  BookOpen,
} from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { useAuth } from "@/hooks/use-auth";
import { opcoesAnosLeonicos } from "@/lib/ano-leonico";
import {
  listExercicios,
  abrirExercicio,
  fecharExercicio,
  reabrirExercicio,
  previewApuracao,
} from "@/lib/exercicios.functions";

export const Route = createFileRoute("/gestao/exercicios")({
  component: ExerciciosPage,
});

type Modulo = "financeiro" | "contabil";

const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const anoLabel = (ano: string) => ano.replace("-", "/");

function ExerciciosPage() {
  const qc = useQueryClient();
  const { isAdmin, isGestorAdmin, isGestorFinanceiro, isGestorContabil } = useAuth();
  const master = isAdmin || isGestorAdmin;
  const podeVer = master || isGestorFinanceiro || isGestorContabil;

  const fetchExercicios = useServerFn(listExercicios);
  const abrir = useServerFn(abrirExercicio);
  const fechar = useServerFn(fecharExercicio);
  const reabrir = useServerFn(reabrirExercicio);
  const previa = useServerFn(previewApuracao);

  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [novoAno, setNovoAno] = useState(opcoesAnosLeonicos()[0]);
  const [dialog, setDialog] = useState<
    | { acao: "fechar" | "reabrir"; ano: string; modulo: Modulo }
    | null
  >(null);
  const [parecer, setParecer] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["exercicios"],
    queryFn: () => fetchExercicios({}),
    enabled: podeVer,
  });

  const { data: apuracao, isFetching: apurando } = useQuery({
    queryKey: ["exercicio-previa", dialog?.ano, dialog?.modulo],
    queryFn: () => previa({ data: { ano_leonico: dialog!.ano, modulo: dialog!.modulo } }),
    enabled: !!dialog && dialog.acao === "fechar",
  });

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ["exercicios"] });
    qc.invalidateQueries({ queryKey: ["contas-pagar"] });
    qc.invalidateQueries({ queryKey: ["financeiro-dashboard"] });
  };

  const abrirMut = useMutation({
    mutationFn: (ano: string) => abrir({ data: { ano_leonico: ano } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Ano leonístico aberto." });
      invalidar();
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao abrir o ano." }),
  });

  const fecharMut = useMutation({
    mutationFn: () => fechar({ data: { ano_leonico: dialog!.ano, modulo: dialog!.modulo, parecer } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Ano leonístico fechado e saldos de abertura gerados." });
      setDialog(null);
      setParecer("");
      invalidar();
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao fechar o ano." }),
  });

  const reabrirMut = useMutation({
    mutationFn: () => reabrir({ data: { ano_leonico: dialog!.ano, modulo: dialog!.modulo, parecer } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Ano leonístico reaberto." });
      setDialog(null);
      setParecer("");
      invalidar();
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao reabrir o ano." }),
  });

  if (!podeVer) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-slate-600" />
          <h2 className="mt-4 font-display text-lg font-bold text-white">Sem permissão</h2>
          <p className="mt-2 text-sm text-slate-400">
            Apenas Gestor Admin, Financeiro ou Contábil podem abrir e fechar o ano leonístico.
          </p>
        </div>
      </div>
    );
  }

  const exercicios = data?.exercicios ?? [];
  const anoAtual = data?.anoAtual;

  const podeFechar = (modulo: Modulo) =>
    master || (modulo === "financeiro" ? isGestorFinanceiro : isGestorContabil);

  function ModuloCard({ ex, modulo }: { ex: any; modulo: Modulo }) {
    const fechado = (modulo === "financeiro" ? ex.status_financeiro : ex.status_contabil) === "fechado";
    const em = modulo === "financeiro" ? ex.fin_fechado_em : ex.con_fechado_em;
    const resultado = modulo === "financeiro" ? ex.resultado_financeiro : ex.resultado_contabil;
    const saldos = (ex.saldos ?? []).filter((s: any) => s.modulo === modulo);
    const Icon = modulo === "financeiro" ? Wallet : BookOpen;

    return (
      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Icon className="h-4 w-4 text-primary" />
            {modulo === "financeiro" ? "Financeiro" : "Contábil"}
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              fechado
                ? "bg-amber-500/10 text-amber-400"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {fechado ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
            {fechado ? "Fechado" : "Aberto"}
          </span>
        </div>

        {resultado && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <div>
              <div className="text-slate-500">Receitas</div>
              <div className="font-semibold text-emerald-400">{brl(resultado.receitas ?? 0)}</div>
            </div>
            <div>
              <div className="text-slate-500">Despesas</div>
              <div className="font-semibold text-red-400">{brl(resultado.despesas ?? 0)}</div>
            </div>
            <div>
              <div className="text-slate-500">Resultado</div>
              <div
                className={`font-semibold ${
                  (resultado.resultado ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {brl(resultado.resultado ?? 0)}
              </div>
            </div>
          </div>
        )}

        {em && (
          <div className="mt-2 text-[11px] text-slate-500">
            Fechado em {new Date(em).toLocaleDateString("pt-BR")}
          </div>
        )}

        {saldos.length > 0 && (
          <div className="mt-3 rounded-lg border border-white/8 bg-black/20 p-2">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Saldos de abertura ({saldos.length})
            </div>
            <div className="max-h-32 space-y-1 overflow-y-auto">
              {saldos.map((s: any) => (
                <div key={s.id} className="flex justify-between gap-2 text-[11px]">
                  <span className="truncate text-slate-400">{s.descricao}</span>
                  <span className="shrink-0 font-medium text-slate-200">{brl(s.saldo)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 flex gap-2">
          {!fechado ? (
            <button
              disabled={!podeFechar(modulo)}
              onClick={() => {
                setParecer("");
                setDialog({ acao: "fechar", ano: ex.ano_leonico, modulo });
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-40"
            >
              <Lock className="h-3.5 w-3.5" /> Fechar período
            </button>
          ) : (
            <button
              disabled={!master}
              onClick={() => {
                setParecer("");
                setDialog({ acao: "reabrir", ano: ex.ano_leonico, modulo });
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/5 disabled:opacity-40"
              title={master ? undefined : "Somente o Gestor Admin pode reabrir"}
            >
              <LockOpen className="h-3.5 w-3.5" /> Reabrir
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <GestaoHeader
        title="Abertura e Fechamento do Ano Leonístico"
        subtitle="Encerre o exercício financeiro e contábil (1º de julho a 30 de junho) e gere os saldos de abertura"
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "Ano Leonístico" }]}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={novoAno}
              onChange={(e) => setNovoAno(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-slate-200"
            >
              {opcoesAnosLeonicos().map((a) => (
                <option key={a} value={a}>
                  {anoLabel(a)}
                </option>
              ))}
            </select>
            <button
              onClick={() => abrirMut.mutate(novoAno)}
              disabled={abrirMut.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Abrir exercício
            </button>
          </div>
        }
      />

      <div className="space-y-6 p-6">
        {msg && (
          <div
            className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
              msg.type === "ok"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {msg.type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {msg.text}
            <button onClick={() => setMsg(null)} className="ml-auto opacity-60 hover:opacity-100">
              ×
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-500">Carregando...</div>
        ) : exercicios.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Nenhum exercício aberto ainda. Escolha o ano leonístico acima e clique em “Abrir exercício”.
          </div>
        ) : (
          <div className="space-y-5">
            {exercicios.map((ex: any) => (
              <div
                key={ex.id}
                className="rounded-2xl border border-white/8 bg-white/[0.02] p-5"
              >
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <CalendarCheck className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-bold text-white">
                    Ano Leonístico {anoLabel(ex.ano_leonico)}
                  </h2>
                  {ex.ano_leonico === anoAtual && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      Ano corrente
                    </span>
                  )}
                  <span className="text-xs text-slate-500">
                    {new Date(ex.data_inicio + "T00:00:00").toLocaleDateString("pt-BR")} a{" "}
                    {new Date(ex.data_fim + "T00:00:00").toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <ModuloCard ex={ex} modulo="financeiro" />
                  <ModuloCard ex={ex} modulo="contabil" />
                </div>

                {(ex.eventos ?? []).length > 0 && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      <History className="h-3 w-3" /> Histórico
                    </div>
                    <div className="space-y-1">
                      {(ex.eventos ?? []).map((ev: any) => (
                        <div key={ev.id} className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                          <span className="text-slate-500">
                            {new Date(ev.created_at).toLocaleString("pt-BR")}
                          </span>
                          <span className="font-medium text-slate-200 capitalize">{ev.acao}</span>
                          <span className="capitalize">{ev.modulo}</span>
                          {ev.usuario_email && <span className="text-slate-500">· {ev.usuario_email}</span>}
                          {ev.parecer && <span className="text-slate-500">· {ev.parecer}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo de fechamento / reabertura */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1321] p-6">
            <h3 className="font-display text-lg font-bold text-white">
              {dialog.acao === "fechar" ? "Fechar" : "Reabrir"} {anoLabel(dialog.ano)} —{" "}
              {dialog.modulo === "financeiro" ? "Financeiro" : "Contábil"}
            </h3>

            {dialog.acao === "fechar" ? (
              <>
                <p className="mt-2 text-sm text-slate-400">
                  Após o fechamento, os lançamentos desse período ficam somente leitura e os saldos
                  finais viram saldo de abertura do ano seguinte.
                </p>
                <div className="mt-4 rounded-lg border border-white/8 bg-white/[0.03] p-3 text-sm">
                  {apurando ? (
                    <div className="text-slate-500">Apurando o período...</div>
                  ) : apuracao ? (
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Receitas</span>
                        <span className="font-semibold text-emerald-400">
                          {brl(apuracao.resultado.receitas)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Despesas</span>
                        <span className="font-semibold text-red-400">
                          {brl(apuracao.resultado.despesas)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-white/8 pt-1">
                        <span className="text-slate-300">Resultado do exercício</span>
                        <span
                          className={`font-bold ${
                            apuracao.resultado.resultado >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {brl(apuracao.resultado.resultado)}
                        </span>
                      </div>
                      <div className="pt-1 text-[11px] text-slate-500">
                        {apuracao.saldos.length} saldo(s) serão transportados para{" "}
                        {anoLabel(dialog.ano.replace(/^(\d+)/, (m) => String(Number(m) + 1)))}.
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-400">
                A reabertura libera novamente os lançamentos do período e apaga os saldos de abertura
                que haviam sido transportados. Informe o motivo.
              </p>
            )}

            <label className="mt-4 block text-xs font-medium text-slate-400">
              {dialog.acao === "fechar" ? "Parecer / observação (opcional)" : "Motivo da reabertura"}
            </label>
            <textarea
              value={parecer}
              onChange={(e) => setParecer(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200"
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setDialog(null);
                  setParecer("");
                }}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={() => (dialog.acao === "fechar" ? fecharMut.mutate() : reabrirMut.mutate())}
                disabled={
                  fecharMut.isPending ||
                  reabrirMut.isPending ||
                  (dialog.acao === "reabrir" && parecer.trim().length < 3)
                }
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {dialog.acao === "fechar" ? "Confirmar fechamento" : "Confirmar reabertura"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
