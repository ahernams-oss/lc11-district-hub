import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users2, Award, MapPin, Plus, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { GestaoStatCard } from "@/components/gestao/GestaoStatCard";
import { getClubesMetrics, listClubes, listAssociados } from "@/lib/clubes-associados.functions";

export const Route = createFileRoute("/gestao/clubes-associados/")({
  component: ClubesAssociadosIndexPage,
});

function ClubesAssociadosIndexPage() {
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ["clubes-metrics"],
    queryFn: () => getClubesMetrics(),
  });

  const { data: clubes, isLoading: loadingClubes } = useQuery({
    queryKey: ["dist-clubes"],
    queryFn: () => listClubes(),
  });

  const { data: associados, isLoading: loadingAssociados } = useQuery({
    queryKey: ["dist-associados"],
    queryFn: () => listAssociados(),
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-12">
      <GestaoHeader title="Clubes & Associados" breadcrumbs={["Gestão", "Clubes & Associados"]} />

      <div className="p-6 space-y-6">
        {/* Banner de Boas Vindas */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              Gestão de Clubes e Associados do Distrito LC-11
            </h2>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              Cadastro centralizado de todos os Lions Clubes, Regiões, Divisões e Companheiros Leões integrantes do Distrito.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/gestao/clubes-associados/clubes"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-deep transition-all"
            >
              <Building2 className="h-4 w-4" />
              Gerenciar Clubes
            </Link>
            <Link
              to="/gestao/clubes-associados/associados"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 transition-all"
            >
              <Users2 className="h-4 w-4" />
              Ver Associados
            </Link>
          </div>
        </div>

        {/* Métrica Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <GestaoStatCard
            label="Total de Clubes"
            value={loadingMetrics ? "..." : (metrics?.totalClubes ?? 0).toString()}
            icon={Building2}
            variant="info"
          />
          <GestaoStatCard
            label="Clubes Ativos"
            value={loadingMetrics ? "..." : (metrics?.clubesAtivos ?? 0).toString()}
            icon={CheckCircle2}
            variant="success"
          />
          <GestaoStatCard
            label="Total de Associados"
            value={loadingMetrics ? "..." : (metrics?.totalAssociados ?? 0).toString()}
            icon={Users2}
            variant="warning"
          />
          <GestaoStatCard
            label="Regiões / Divisões"
            value={loadingMetrics ? "..." : `${metrics?.totalRegioes ?? 0} R / ${metrics?.totalDivisoes ?? 0} D`}
            icon={MapPin}
            variant="default"
          />
        </div>

        {/* Grid Principal: Resumo de Clubes & Liderança */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Clubes em Destaque */}
          <div className="lg:col-span-2 rounded-xl border border-white/8 bg-[#0d1321] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-white">Clubes Cadastrados no Distrito</h3>
                <p className="text-xs text-slate-400">Clubes por região e cidade de abrangência</p>
              </div>
              <Link
                to="/gestao/clubes-associados/clubes"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                Ver todos os clubes <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {loadingClubes ? (
              <div className="py-8 text-center text-sm text-slate-500">Carregando clubes...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {clubes?.slice(0, 6).map((clube) => (
                  <div
                    key={clube.id}
                    className="flex flex-col justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4 hover:border-primary/30 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {clube.regiao} • {clube.divisao}
                        </span>
                        <span className="text-[10px] text-slate-500">Código: {clube.codigo_lions}</span>
                      </div>
                      <h4 className="mt-2 font-display text-sm font-bold text-white">{clube.nome}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-500" /> {clube.cidade} - {clube.estado}
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Reuniões: {clube.dia_reuniao || "A definir"}</span>
                      <span className="text-emerald-400 font-medium capitalize">● {clube.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Liderança Distrital & Quadro Social */}
          <div className="rounded-xl border border-white/8 bg-[#0d1321] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-white">Quadro Social em Destaque</h3>
                <p className="text-xs text-slate-400">Lideranças e dirigentes dos clubes</p>
              </div>
              <Link
                to="/gestao/clubes-associados/associados"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                Ver associados <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {loadingAssociados ? (
              <div className="py-8 text-center text-sm text-slate-500">Carregando associados...</div>
            ) : (
              <div className="space-y-3">
                {associados?.slice(0, 5).map((assoc) => (
                  <div
                    key={assoc.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
                        {assoc.nome.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{assoc.nome}</div>
                        <div className="text-[11px] text-slate-400">
                          {assoc.cargo_clube} • {assoc.dist_clubes?.nome || "Clube"}
                        </div>
                      </div>
                    </div>
                    {assoc.cargo_distrital && (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-medium">
                        {assoc.cargo_distrital}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
