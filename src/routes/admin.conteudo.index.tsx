import { createFileRoute, Link } from "@tanstack/react-router";
import { CONTENT_LABELS, type ContentKey } from "@/lib/content";

export const Route = createFileRoute("/admin/conteudo/")({
  component: ContentList,
});

function ContentList() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Conteúdo das Páginas</h1>
      <p className="mt-2 text-muted-foreground">Selecione a página que deseja editar.</p>
      <div className="mt-6 grid gap-3">
        {(Object.keys(CONTENT_LABELS) as ContentKey[]).map((k) => (
          <Link
            key={k}
            to="/admin/conteudo/$key"
            params={{ key: k }}
            className="rounded-md border bg-card px-4 py-3 hover:border-primary"
          >
            <div className="font-semibold text-foreground">{CONTENT_LABELS[k]}</div>
            <div className="text-xs text-muted-foreground">/{k === "home" ? "" : k}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
