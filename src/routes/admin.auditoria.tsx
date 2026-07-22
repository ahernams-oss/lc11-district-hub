import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useDocumentAuditLogs, type DocumentAuditLog } from "@/lib/documents.audit";
import {
  ShieldCheck, FileText, RefreshCw, Eye, Download, Users,
  BarChart3, Activity, Search, Filter, Lock, ArrowUpRight
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";

import { useSiteVisitsStats } from "@/lib/site-visits";

export const Route = createFileRoute("/admin/auditoria")({
  head: () => ({
    meta: [
      { title: "Dashboard de Auditoria & Tráfego — Painel Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminAuditDashboard,
});

const ACTION_COLORS = {
  VIEW: "#3b82f6", // Blue
  DOWNLOAD: "#10b981", // Emerald
};

function AdminAuditDashboard() {
  const { data: logs = [], isLoading, refetch } = useDocumentAuditLogs();
  const { data: visitStats, isLoading: visitsLoading } = useSiteVisitsStats();

  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<"ALL" | "VIEW" | "DOWNLOAD">("ALL");

  // KPI Calculations
  const totalLogs = logs.length;
  const totalDownloads = useMemo(() => logs.filter((l) => l.action === "DOWNLOAD").length, [logs]);
  const totalViews = useMemo(() => logs.filter((l) => l.action === "VIEW").length, [logs]);
  const uniqueUsers = useMemo(() => new Set(logs.map((l) => l.user_email)).size, [logs]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-4 w-4" /> Segurança & Métricas
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold text-foreground">
            Dashboard de Auditoria & Visitas
          </h1>
          <p className="text-xs text-muted-foreground">
            Monitoramento de tráfego do site, acessos a documentos restritos e métricas do Distrito LC-11.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold hover:bg-surface"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar Dados
          </button>
        </div>
      </div>

      {/* Visitor & Site Traffic Metrics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" /> Contador de Visitas ao Site
          </h2>
          <span className="text-xs text-muted-foreground">Visitas públicas e de membros</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total de Visitas ao Site
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Eye className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 font-display text-3xl font-bold text-foreground">
              {visitsLoading ? "—" : (visitStats?.totalVisits ?? 0).toLocaleString("pt-BR")}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Visualizações totais de páginas</p>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Visitas Hoje
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 font-display text-3xl font-bold text-foreground">
              {visitsLoading ? "—" : (visitStats?.visitsToday ?? 0).toLocaleString("pt-BR")}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Acessos nas últimas 24h</p>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Visitantes Únicos
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 font-display text-3xl font-bold text-foreground">
              {visitsLoading ? "—" : (visitStats?.uniqueVisitors ?? 0).toLocaleString("pt-BR")}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Dispositivos distintos</p>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Auditoria de Documentos
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Lock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 font-display text-3xl font-bold text-foreground">
              {isLoading ? "—" : totalLogs}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Acessos restritos registrados</p>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timeline Chart */}
        <div className="rounded-xl border bg-card p-5 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h2 className="font-display text-base font-semibold">Atividade de Acesso por Data</h2>
            </div>
            <span className="text-xs text-muted-foreground">Histórico recente</span>
          </div>

          <div className="h-64 w-full">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Carregando gráfico...</div>
            ) : timelineData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Sem histórico suficiente para exibir o gráfico.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", borderRadius: "8px", color: "#fff", border: "none", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="VIEW" name="Visualizações" fill={ACTION_COLORS.VIEW} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="DOWNLOAD" name="Downloads" fill={ACTION_COLORS.DOWNLOAD} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Action Type Pie Distribution */}
        <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="font-display text-base font-semibold">Proporção de Ações</h2>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {isLoading ? (
              <div className="text-xs text-muted-foreground">Carregando...</div>
            ) : totalLogs === 0 ? (
              <div className="text-xs text-muted-foreground">Sem dados</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={actionPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {actionPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top 5 Documents Chart */}
      {topDocsData.length > 0 && (
        <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="font-display text-base font-semibold">Top Documentos Mais Acessados</h2>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topDocsData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={180} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
                <Bar dataKey="total" name="Total de Acessos" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Audit Log Table & Filters */}
      <div className="space-y-4 rounded-xl border bg-card p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-bold">Registros Detalhados de Auditoria</h2>
          </div>
          <span className="text-xs text-muted-foreground">{filteredLogs.length} registro(s) exibido(s)</span>
        </div>

        {/* Filter Controls */}
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por e-mail do usuário ou título do documento..."
              className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as any)}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="ALL">Todas as Ações</option>
            <option value="VIEW">Apenas Visualizações (VIEW)</option>
            <option value="DOWNLOAD">Apenas Downloads (DOWNLOAD)</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Carregando registros...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Nenhum registro encontrado com os filtros selecionados.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Data & Hora</th>
                  <th className="px-4 py-3">Documento Acessado</th>
                  <th className="px-4 py-3">E-mail do Membro</th>
                  <th className="px-4 py-3">Tipo de Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground font-mono">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate max-w-md">{log.document_title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="font-semibold text-foreground">{log.user_email}</span>
                    </td>
                    <td className="px-4 py-3">
                      {log.action === "DOWNLOAD" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Download className="h-3 w-3" /> Download
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          <Eye className="h-3 w-3" /> Visualizou
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
