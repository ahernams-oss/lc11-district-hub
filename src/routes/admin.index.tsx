import { createFileRoute, Link } from "@tanstack/react-router";
import { CONTENT_LABELS, type ContentKey } from "@/lib/content";
import { CATEGORY_LABELS } from "@/lib/leaders";
import { FileText, Users } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Bem-vindo ao Painel</h1>
      <p className="mt-2 text-muted-foreground">
        Edite os textos das páginas e os dados dos líderes do Distrito LC-11.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          to="/admin/conteudo"
          className="rounded-xl border bg-card p-6 shadow-card transition-transform hover:-translate-y-1"
        >
          <FileText className="h-8 w-8 text-primary" />
          <h2 className="mt-3 font-display text-lg font-bold">Conteúdo das Páginas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Edite títulos, descrições e textos de cada página do site.
          </p>
        </Link>
        <Link
          to="/admin/lideres"
          className="rounded-xl border bg-card p-6 shadow-card transition-transform hover:-translate-y-1"
        >
          <Users className="h-8 w-8 text-primary" />
          <h2 className="mt-3 font-display text-lg font-bold">Líderes & Fotos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie Governador, Vice-Governadores, GAT, Assessoria e Ex-Governadores.
          </p>
        </Link>
      </div>

      <div className="mt-10">
        <h3 className="font-semibold text-foreground">Atalhos rápidos</h3>
        <ul className="mt-3 space-y-1 text-sm">
          {(Object.keys(CONTENT_LABELS) as ContentKey[]).map((k) => (
            <li key={k}>
              <Link to="/admin/conteudo/$key" params={{ key: k }} className="text-primary hover:underline">
                {CONTENT_LABELS[k]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
