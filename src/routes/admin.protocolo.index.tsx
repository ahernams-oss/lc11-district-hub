import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileText, Image as ImageIcon } from "lucide-react";
import { PROTOCOL_MENU_ITEMS } from "@/lib/protocol-menu";
import {
  fetchAllProtocolTopics,
  protocolTopicStatus,
  type ProtocolTopicStatus,
} from "@/lib/protocol-content";

export const Route = createFileRoute("/admin/protocolo/")({
  head: () => ({ meta: [
    { title: "Protocolo Leonístico — Painel Admin LC-11" },
    { name: "description", content: "Edição dos temas de Protocolo Leonístico do Distrito LC-11." },
    { property: "og:title", content: "Protocolo Leonístico — Painel Admin LC-11" },
    { property: "og:description", content: "Edição dos temas de Protocolo Leonístico." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: ProtocolTopicsList,
});

const STATUS_STYLE: Record<ProtocolTopicStatus, string> = {
  vazio: "bg-muted text-muted-foreground",
  rascunho: "bg-amber-500/15 text-amber-700",
  publicado: "bg-primary/10 text-primary",
};

const STATUS_LABEL: Record<ProtocolTopicStatus, string> = {
  vazio: "Sem conteúdo",
  rascunho: "Rascunho",
  publicado: "Publicado",
};

function ProtocolTopicsList() {
  const query = useQuery({ queryKey: ["protocol-topics", "admin"], queryFn: fetchAllProtocolTopics });
  const topics = query.data ?? {};

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Protocolo Leonístico</h1>
      <p className="mt-2 text-muted-foreground">
        Edite o conteúdo de cada tema do menu Protocolo Leonístico. Só aparece no site o que estiver publicado.
      </p>

      <div className="mt-6 flex items-center gap-2">
        <Link
          to="/admin/protocolo/visao-geral"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-primary"
        >
          <FileText className="h-4 w-4" /> Página de visão geral
        </Link>
        <Link
          to="/protocolo-leonistico"
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-primary"
        >
          Ver no site →
        </Link>
      </div>

      {query.isLoading ? (
        <p className="mt-6 text-muted-foreground">Carregando...</p>
      ) : (
        <div className="mt-6 grid gap-3">
          {PROTOCOL_MENU_ITEMS.map((item, index) => {
            const content = topics[item.slug];
            const status = protocolTopicStatus(content ?? { eyebrow: "", title: "", description: "", body: "", images: [], published: false });
            return (
              <Link
                key={item.slug}
                to="/admin/protocolo/$slug"
                params={{ slug: item.slug }}
                className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 hover:border-primary"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-foreground">{item.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">/protocolo-leonistico/{item.slug}</span>
                </span>
                {status === "publicado" && content && content.images.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <ImageIcon className="h-3.5 w-3.5" /> {content.images.length}
                  </span>
                )}
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLE[status]}`}>
                  {STATUS_LABEL[status]}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
