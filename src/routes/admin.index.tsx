import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CONTENT_LABELS, type ContentKey } from "@/lib/content";
import {
  FileText, Users, MapPin, Newspaper, Calendar, Sparkles,
  Building2, ExternalLink, ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

const ALL_CARDS = [
  { to: "/admin/conteudo", title: "Conteúdo das Páginas", desc: "Edite títulos, descrições e textos de cada página.", icon: FileText, requires: "panel" as const },
  { to: "/admin/lideres", title: "Líderes & Ex-Governadores", desc: "Governador, Vices, GAT, Assessorias e galeria de ex-governadores.", icon: Users, requires: "panel" as const },
  { to: "/admin/regioes", title: "Regiões, Divisões e Clubes", desc: "Cadastre regiões, divisões dentro de cada região e clubes de cada divisão.", icon: MapPin, requires: "panel" as const },
  { to: "/admin/noticias", title: "Notícias", desc: "Publique e edite notícias do distrito.", icon: Newspaper, requires: "panel" as const },
  { to: "/admin/eventos", title: "Eventos", desc: "Calendário oficial de eventos e ações.", icon: Calendar, requires: "panel" as const },
  { to: "/admin/projetos", title: "Projetos", desc: "Projetos sociais e iniciativas em destaque.", icon: Sparkles, requires: "panel" as const },
  { to: "/admin/usuarios", title: "Usuários & Acessos", desc: "Aprove novos logins e gerencie quem tem acesso ao painel.", icon: ShieldCheck, requires: "users" as const },
] as const;

function useCount(table: string, filter?: { col: string; val: string }) {
  return useQuery({
    queryKey: ["admin-count", table, filter?.col, filter?.val],
    queryFn: async () => {
      let q = (supabase as any).from(table).select("*", { count: "exact", head: true });
      if (filter) q = q.eq(filter.col, filter.val);
      const { count, error } = await q;
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 30_000,
  });
}

function StatCard({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-card">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold text-foreground">
        {loading ? "—" : value}
      </div>
    </div>
  );
}

function AdminHome() {
  const { canViewUsers } = useAuth();
  const CARDS = ALL_CARDS.filter((c) => c.requires === "panel" || (c.requires === "users" && canViewUsers));
  const clubsTotal = useCount("clubs");
  const clubsES = useCount("clubs", { col: "state", val: "ES" });
  const clubsRJ = useCount("clubs", { col: "state", val: "RJ" });
  const regions = useCount("regions");
  const divisions = useCount("divisions");
  const leaders = useCount("leaders");
  const news = useCount("news");
  const events = useCount("events");
  const projects = useCount("projects");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Bem-vindo ao Painel</h1>
      <p className="mt-2 text-muted-foreground">
        Gerencie todo o conteúdo do site do Distrito LC-11.
      </p>

      {/* Estatísticas */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Clubes (total)" value={clubsTotal.data ?? 0} loading={clubsTotal.isLoading} />
        <StatCard label="Clubes ES" value={clubsES.data ?? 0} loading={clubsES.isLoading} />
        <StatCard label="Clubes RJ" value={clubsRJ.data ?? 0} loading={clubsRJ.isLoading} />
        <StatCard label="Regiões / Divisões" value={(regions.data ?? 0) + (divisions.data ?? 0)} loading={regions.isLoading || divisions.isLoading} />
        <StatCard label="Líderes" value={leaders.data ?? 0} loading={leaders.isLoading} />
        <StatCard label="Notícias" value={news.data ?? 0} loading={news.isLoading} />
        <StatCard label="Eventos" value={events.data ?? 0} loading={events.isLoading} />
        <StatCard label="Projetos" value={projects.data ?? 0} loading={projects.isLoading} />
      </div>

      {/* Atalhos Clubes por Estado */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a
          href="/clubes/es"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-card transition-transform hover:-translate-y-1"
        >
          <Building2 className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <div className="font-display text-lg font-bold">Clubes do ES</div>
            <div className="text-xs text-muted-foreground">
              {clubsES.data ?? 0} clube(s) — abrir página pública
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </a>
        <a
          href="/clubes/rj"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-card transition-transform hover:-translate-y-1"
        >
          <Building2 className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <div className="font-display text-lg font-bold">Clubes do RJ</div>
            <div className="text-xs text-muted-foreground">
              {clubsRJ.data ?? 0} clube(s) — abrir página pública
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </a>
      </div>

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
