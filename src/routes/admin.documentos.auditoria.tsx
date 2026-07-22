import { createFileRoute, Link } from "@tanstack/react-router";
import { useDocumentAuditLogs } from "@/lib/documents.audit";
import { ShieldCheck, FileText, ArrowLeft, RefreshCw, Eye, Download } from "lucide-react";

export const Route = createFileRoute("/admin/documentos/auditoria")({
  head: () => ({
    meta: [
      { title: "Trilha de Auditoria — Documentos — Painel Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DocumentAuditPage,
});

function DocumentAuditPage() {
  const { data: logs = [], isLoading, refetch } = useDocumentAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/documentos"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar aos documentos
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" /> Auditoria de Acesso a Documentos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Histórico de quem visualizou ou baixou os documentos sensíveis e restritos do Distrito LC-11.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium hover:bg-surface"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando logs de auditoria...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Nenhum registro de acesso registrado até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Data e Hora</th>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Usuário</th>
                  <th className="px-4 py-3">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <span className="font-medium text-foreground">{log.document_title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="font-medium text-foreground">{log.user_email}</span>
                    </td>
                    <td className="px-4 py-3">
                      {log.action === "DOWNLOAD" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <Download className="h-3 w-3" /> Download
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                          <Eye className="h-3 w-3" /> Visualizou
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
