import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ExternalLink, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import lionsLogo from "@/assets/lions-logo.png.asset.json";
import { useLeaders } from "@/lib/leaders";

const inicioSubmenu = [
  { to: "/lions-internacional", label: "Sobre o Lions Internacional" },
  { to: "/sobre", label: "Sobre o Distrito LC-11" },
  { to: "/historia", label: "Nossa História" },
] as const;

const lideresSubmenu = [
  { to: "/governador", label: "Governador" },
  { to: "/vice-governador-1", label: "1º Vice-Governador" },
  { to: "/vice-governador-2", label: "2º Vice-Governador" },
  { to: "/gat", label: "GAT" },
  { to: "/assessoria", label: "Assessoria" },
  { to: "/ex-governadores", label: "Galeria de Ex-Governadores" },
] as const;

const regioesSubmenu = [
  { to: "/clubes/regiao/a", label: "Região A" },
  { to: "/clubes/regiao/b", label: "Região B" },
  { to: "/clubes/regiao/c", label: "Região C" },
  { to: "/clubes/regiao/d", label: "Região D" },
  { to: "/clubes/regiao/e", label: "Região E" },
  { to: "/clubes/regiao/f", label: "Região F" },
] as const;

const nav = [
  { to: "/projetos", label: "Projetos" },
  { to: "/noticias", label: "Notícias" },
  { to: "/eventos", label: "Eventos" },
] as const;


export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [inicioOpen, setInicioOpen] = useState(false);
  const [lideresOpen, setLideresOpen] = useState(false);
  const [clubesOpen, setClubesOpen] = useState(false);

  const { data: governadores } = useLeaders("governador");
  const governador = governadores?.[0];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 lg:-ml-20">
          <Link to="/" className="flex shrink-0 items-center gap-2" onClick={() => setOpen(false)}>
            <img src={lionsLogo.url} alt="Lions Clubs International" className="h-10 w-10 object-contain" />
            <div className="leading-tight">
              <div className="whitespace-nowrap font-display text-sm font-bold text-foreground">Distrito LC-11</div>
              <div className="hidden whitespace-nowrap text-[10px] uppercase tracking-wider text-muted-foreground xl:block">
                Lions Clubs International
              </div>
            </div>
          </Link>
          {governador?.photo_url && (
            <Link
              to="/governador"
              onClick={() => setOpen(false)}
              className="hidden shrink-0 items-center gap-2 rounded-lg border border-border bg-surface/50 px-2.5 py-1 transition-colors hover:bg-surface sm:flex"
              title={`Governador${governador.name ? `: ${governador.name}` : ""}`}
            >
              <img
                src={governador.photo_url}
                alt={governador.name ? `Governador ${governador.name}` : "Governador"}
                className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-primary/30"
              />
              <div className="hidden leading-tight xl:block">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-primary">Governador</div>
                <div className="whitespace-nowrap font-display text-xs font-semibold text-foreground">{governador.name}</div>
              </div>
              {governador.pin_url && (
                <img
                  src={governador.pin_url}
                  alt="PIN do Governador"
                  className="h-9 w-9 shrink-0 object-contain"
                />
              )}
            </Link>
          )}
        </div>


        <nav className="hidden items-center gap-1 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setInicioOpen(true)}
            onMouseLeave={() => setInicioOpen(false)}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-primary"
              activeProps={{ className: "text-primary bg-surface" }}
              activeOptions={{ exact: true }}
            >
              Início <ChevronDown className="h-3.5 w-3.5" />
            </Link>
            {inicioOpen && (
              <div className="absolute left-0 top-full w-64 rounded-md border border-border bg-background py-2 shadow-card">
                {inicioSubmenu.map((s) => (
                  <Link
                    key={s.to}
                    to={s.to}
                    className="block px-4 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-primary"
                    activeProps={{ className: "text-primary bg-surface" }}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => setLideresOpen(true)}
            onMouseLeave={() => setLideresOpen(false)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-primary"
            >
              Líderes <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {lideresOpen && (
              <div className="absolute left-0 top-full w-56 rounded-md border border-border bg-background py-2 shadow-card">
                {lideresSubmenu.map((s) => (
                  <Link
                    key={s.to}
                    to={s.to}
                    className="block px-4 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-primary"
                    activeProps={{ className: "text-primary bg-surface" }}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => setClubesOpen(true)}
            onMouseLeave={() => setClubesOpen(false)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-primary"
            >
              Clubes <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {clubesOpen && (
              <div className="absolute left-0 top-full w-56 rounded-md border border-border bg-background py-2 shadow-card">
                <Link
                  to="/clubes"
                  className="block px-4 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-primary"
                  activeProps={{ className: "text-primary bg-surface" }}
                  activeOptions={{ exact: true }}
                >
                  Geral
                </Link>
                <Link
                  to="/clubes/es"
                  className="block px-4 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-primary"
                  activeProps={{ className: "text-primary bg-surface" }}
                >
                  Clubes do ES
                </Link>
                <Link
                  to="/clubes/rj"
                  className="block px-4 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-primary"
                  activeProps={{ className: "text-primary bg-surface" }}
                >
                  Clubes do RJ
                </Link>
                <div className="group/regiao relative">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-primary"
                  >
                    Região <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                  </button>
                  <div className="absolute left-full top-0 hidden w-44 rounded-md border border-border bg-background py-2 shadow-card group-hover/regiao:block">
                    {regioesSubmenu.map((r) => (
                      <Link
                        key={r.to}
                        to={r.to}
                        className="block px-4 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-primary"
                        activeProps={{ className: "text-primary bg-surface" }}
                      >
                        {r.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          <Link
            to="/lcif"
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-primary"
            activeProps={{ className: "text-primary bg-surface" }}
          >
            LCIF
          </Link>

          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-primary"
              activeProps={{ className: "text-primary bg-surface" }}
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
            href="https://lovable.dev/projects/3c09d0df-b614-426e-b3c7-58ab2e837294"
            target="_blank"
            rel="noreferrer"
            className="ml-1 inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground/80 hover:border-primary hover:text-primary"
          >
            Lions Connecta <ExternalLink className="h-3.5 w-3.5" />
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
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-surface"
            activeProps={{ className: "text-primary bg-surface" }}
            activeOptions={{ exact: true }}
          >
            Início
          </Link>
          <div className="ml-3 flex flex-col gap-1 border-l border-border pl-3">
            {inicioSubmenu.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-surface"
                activeProps={{ className: "text-primary bg-surface" }}
              >
                {s.label}
              </Link>
            ))}
          </div>
          <div className="mt-1 px-3 py-2 text-base font-medium text-foreground">Líderes</div>
          <div className="ml-3 flex flex-col gap-1 border-l border-border pl-3">
            {lideresSubmenu.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-surface"
                activeProps={{ className: "text-primary bg-surface" }}
              >
                {s.label}
              </Link>
            ))}
      </div>



          <div className="mt-1 px-3 py-2 text-base font-medium text-foreground">Clubes</div>
          <div className="ml-3 flex flex-col gap-1 border-l border-border pl-3">
            <Link
              to="/clubes"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-surface"
              activeProps={{ className: "text-primary bg-surface" }}
              activeOptions={{ exact: true }}
            >
              Geral
            </Link>
            <Link
              to="/clubes/es"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-surface"
              activeProps={{ className: "text-primary bg-surface" }}
            >
              Clubes do ES
            </Link>
            <Link
              to="/clubes/rj"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-surface"
              activeProps={{ className: "text-primary bg-surface" }}
            >
              Clubes do RJ
            </Link>

            <div className="mt-1 px-3 py-1 text-sm font-medium text-foreground/70">Região</div>
            <div className="ml-3 flex flex-col gap-1 border-l border-border pl-3">
              {regioesSubmenu.map((r) => (
                <Link
                  key={r.to}
                  to={r.to}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-surface"
                  activeProps={{ className: "text-primary bg-surface" }}
                >
                  {r.label}
                </Link>
              ))}
            </div>
          </div>
          <Link
            to="/lcif"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-surface"
            activeProps={{ className: "text-primary bg-surface" }}
          >
            LCIF
          </Link>
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-surface"
              activeProps={{ className: "text-primary bg-surface" }}
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
            href="https://lovable.dev/projects/3c09d0df-b614-426e-b3c7-58ab2e837294"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1 rounded-md border border-border px-4 py-2.5 text-sm font-medium"
          >
            Acessar Lions Connecta <ExternalLink className="h-4 w-4" />
          </a>
        </nav>
      </div>
    </header>
  );
}
