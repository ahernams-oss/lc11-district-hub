import { createFileRoute, Link } from "@tanstack/react-router";
import { CONTENT_LABELS, type ContentKey } from "@/lib/content";
import { FileText, Users, MapPin, Newspaper, Calendar, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

const CARDS = [
  { to: "/admin/conteudo", title: "Conteúdo das Páginas", desc: "Edite títulos, descrições e textos de cada página.", icon: FileText },
  { to: "/admin/lideres", title: "Líderes & Ex-Governadores", desc: "Governador, Vices, GAT, Assessoria e galeria de ex-governadores.", icon: Users },
  { to: "/admin/regioes", title: "Regiões, Divisões e Clubes", desc: "Cadastre regiões, divisões dentro de cada região e clubes de cada divisão.", icon: MapPin },
  { to: "/admin/noticias", title: "Notícias", desc: "Publique e edite notícias do distrito.", icon: Newspaper },
  { to: "/admin/eventos", title: "Eventos", desc: "Calendário oficial de eventos e ações.", icon: Calendar },
  { to: "/admin/projetos", title: "Projetos", desc: "Projetos sociais e iniciativas em destaque.", icon: Sparkles },
] as const;

function AdminHome() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Bem-vindo ao Painel</h1>
      <p className="mt-2 text-muted-foreground">
        Gerencie todo o conteúdo do site do Distrito LC-11.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="rounded-xl border bg-card p-6 shadow-card transition-transform hover:-translate-y-1"
          >
            <c.icon className="h-8 w-8 text-primary" />
            <h2 className="mt-3 font-display text-lg font-bold">{c.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
          </Link>
        ))}
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
