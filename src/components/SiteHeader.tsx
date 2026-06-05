import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Início" },
  { to: "/sobre", label: "Sobre" },
  { to: "/governador", label: "Governador" },
  { to: "/projetos", label: "Projetos" },
  { to: "/clubes", label: "Clubes" },
  { to: "/noticias", label: "Notícias" },
  { to: "/eventos", label: "Eventos" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-display font-bold">
            L
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-bold text-foreground">Distrito LC-11</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Lions Clubs International</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-primary"
              activeProps={{ className: "text-primary bg-surface" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/doar"
            className="ml-2 inline-flex items-center justify-center rounded-md bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground shadow-card transition-transform hover:scale-105"
          >
            Doar
          </Link>
          <a
            href="https://lionsclubs.org/pt/resources-for-members/member-resource-center/lion-account"
            target="_blank"
            rel="noreferrer"
            className="ml-1 inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground/80 hover:border-primary hover:text-primary"
          >
            Lions Connect <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground lg:hidden"
          aria-label="Abrir menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className={cn("border-t border-border lg:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-surface"
              activeProps={{ className: "text-primary bg-surface" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/doar"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center justify-center rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground"
          >
            Doar agora
          </Link>
          <a
            href="https://lionsclubs.org/pt/resources-for-members/member-resource-center/lion-account"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1 rounded-md border border-border px-4 py-2.5 text-sm font-medium"
          >
            Acessar Lions Connect <ExternalLink className="h-4 w-4" />
          </a>
        </nav>
      </div>
    </header>
  );
}
