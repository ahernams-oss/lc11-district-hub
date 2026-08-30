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
  { to: "/protocolo-leonistico", label: "Protocolo Leonístico" },
] as const;

const lideresSubmenu = [
  { to: "/governador", label: "Governador" },
  { to: "/vice-governador-1", label: "1º Vice-Governador" },
  { to: "/vice-governador-2", label: "2º Vice-Governador" },
  { to: "/ex-governadores", label: "Galeria de Ex-Governadores" },
] as const;

const equipeGovernadorSubmenu = [
  { to: "/secretario", label: "Secretário Distrital" },
  { to: "/tesoureiro", label: "Tesoureiro Distrital" },
  { to: "/gat", label: "GAT" },
  { to: "/assessoria", label: "Assessorias" },
] as const;

const regioesSubmenu = [
  { to: "/clubes/regiao/a", label: "Região A" },
  { to: "/clubes/regiao/b", label: "Região B" },
  { to: "/clubes/regiao/c", label: "Região C" },
  { to: "/clubes/regiao/d", label: "Região D" },
  { to: "/clubes/regiao/e", label: "Região E" },
  { to: "/clubes/regiao/f", label: "Região F" },
] as const;

const atosGovernadorSubmenu = [
  { to: "/documentos/atos-governador/al-2026-2027", label: "AL 2026-2027" },
  { to: "/documentos/atos-governador/al-2027-2028", label: "AL 2027-2028" },
] as const;

const rgdYears = ["2026-2027", "2027-2028", "2028-2029"] as const;
const rgdItems = [
  { suffix: "1-rgd", label: "1ª RGD" },
  { suffix: "2-rgd", label: "2ª RGD" },
  { suffix: "3-rgd", label: "3ª RGD" },
  { suffix: "4-rgd", label: "4ª RGD" },
  { suffix: "convencao", label: "Convenção" },
] as const;
const rgdsConvencaoSubmenu = rgdYears.map((y) => ({
  label: `AL ${y}`,
  items: rgdItems.map((it) => ({
    to: `/documentos/rgds-convencao/al-${y}/${it.suffix}`,
    label: it.label,
  })),
}));

const documentosSubmenu = [
  { to: "/documentos/estatuto-lions-internacional", label: "Estatuto Lions Internacional" },
  { to: "/documentos/estatuto-dmlc", label: "Estatuto DMLC" },
  { to: "/documentos/estatuto-distrito-lc-11", label: "Estatuto Distrito LC-11" },
  { to: "/documentos/estatuto-padrao-clubes", label: "Estatuto Padrão dos Clubes" },
  { to: "/documentos/regulamento-sede", label: "Regulamento da Sede" },
] as const;

const nav = [
  { to: "/projetos", label: "Projetos" },
  { to: "/noticias", label: "Notícias" },
  { to: "/eventos", label: "Eventos" },
] as const;

function DesktopNav() {
  const [inicioOpen, setInicioOpen] = useState(false);
  const [lideresOpen, setLideresOpen] = useState(false);
  const [clubesOpen, setClubesOpen] = useState(false);
  const [documentosOpen, setDocumentosOpen] = useState(false);

  return (
    <nav className="flex min-w-0 items-center justify-center gap-1 2xl:gap-3">
      <div
        className="relative"
        onMouseEnter={() => setInicioOpen(true)}
        onMouseLeave={() => setInicioOpen(false)}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-primary 2xl:px-3"
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
          className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-primary 2xl:px-3"
        >
          Líderes <ChevronDown className="h-3.5 w-3.5" />
        </button>
        {lideresOpen && (
          <div className="absolute left-0 top-full w-56 rounded-md border border-border bg-background py-2 shadow-card">
            <div className="group/gov relative">
              <Link
                to="/governador"
                className="flex items-center justify-between px-4 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-primary"
                activeProps={{ className: "text-primary bg-surface" }}
              >
                Governador <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
              </Link>
              <div className="absolute left-full top-0 hidden w-56 rounded-md border border-border bg-background py-2 shadow-card group-hover/gov:block">
                {equipeGovernadorSubmenu.map((s) => (
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
            </div>
            {lideresSubmenu.slice(1).map((s) => (
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
          className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-primary 2xl:px-3"
        >
          Clubes e Leões <ChevronDown className="h-3.5 w-3.5" />
        </button>
        {clubesOpen && (
          <div className="absolute left-0 top-full w-56 rounded-md border border-border bg-background py-2 shadow-card">
            <Link
              to="/clubes/grandes-leoes"
              className="block px-4 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-primary"
              activeProps={{ className: "text-primary bg-surface" }}
            >
              Grandes Leões
            </Link>
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
                    to={r.to as any}
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

      <div
        className="relative"
        onMouseEnter={() => setDocumentosOpen(true)}
        onMouseLeave={() => setDocumentosOpen(false)}
      >
        <Link
          to="/documentos"
          className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-primary 2xl:px-3"
          activeProps={{ className: "text-primary bg-surface" }}
        >
          Documentos <ChevronDown className="h-3.5 w-3.5" />
        </Link>
        {documentosOpen && (
          <div className="absolute left-0 top-full w-72 rounded-md border border-border bg-background py-2 shadow-card">
            <div className="group/atos relative">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-primary"
              >
                Atos do(a) Governador(a) <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
              </button>
              <div className="absolute left-full top-0 hidden w-56 rounded-md border border-border bg-background py-2 shadow-card group-hover/atos:block">
                {atosGovernadorSubmenu.map((s) => (
                  <Link
                    key={s.to}
                    to={s.to as any}
                    className="block px-4 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-primary"
                    activeProps={{ className: "text-primary bg-surface" }}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="group/rgd relative">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-primary"
              >
                RGDs e Convenção <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
              </button>
              <div className="absolute left-full top-0 hidden w-56 rounded-md border border-border bg-background py-2 shadow-card group-hover/rgd:block">
                {rgdsConvencaoSubmenu.map((g) => (
                  <div key={g.label} className="group/rgdy relative">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-4 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-primary"
                    >
                      {g.label} <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                    </button>
                    <div className="absolute left-full top-0 hidden w-48 rounded-md border border-border bg-background py-2 shadow-card group-hover/rgdy:block">
                      {g.items.map((s) => (
                        <Link
                          key={s.to}
                          to={s.to as any}
                          className="block px-4 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-primary"
                          activeProps={{ className: "text-primary bg-surface" }}
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {documentosSubmenu.map((s) => (
              <Link
                key={s.to}
                to={s.to as any}
                className="block px-4 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-primary"
                activeProps={{ className: "text-primary bg-surface" }}
              >
                {s.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {nav.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="rounded-md px-2 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-primary 2xl:px-3"
          activeProps={{ className: "text-primary bg-surface" }}
        >
          {item.label}
        </Link>
      ))}
      <a
        href="https://lookerstudio.google.com/reporting/59bed738-bb40-496a-99a1-ff4b9dd931e3/page/dfKpF"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 rounded-md border-2 border-primary bg-gold px-3 py-2 text-sm font-semibold text-gold-foreground shadow-sm transition-colors hover:bg-gold/90 2xl:px-4"
      >
        Dados <ExternalLink className="h-3.5 w-3.5" />
      </a>
      <Link
        to="/lcif"
        className="rounded-md border-2 border-gold bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-deep 2xl:px-4"
        activeProps={{ className: "bg-primary-deep border-gold ring-2 ring-gold/50" }}
      >
        LCIF
      </Link>
    </nav>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  const { data: governadores } = useLeaders("governador");
  const governador = governadores?.[0];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-[1800px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="flex shrink-0 items-center gap-2" onClick={() => setOpen(false)}>
            <img src={lionsLogo.url} alt="Lions Clubs International" className="h-10 w-10 object-contain" />
            <div className="leading-tight">
              <div className="whitespace-nowrap font-display text-sm font-bold text-foreground">Distrito LC-11</div>
              <div className="hidden whitespace-nowrap text-[10px] uppercase tracking-wider text-muted-foreground 2xl:block">
                Lions Clubs International
              </div>
            </div>
          </Link>
        </div>
        <div className="flex justify-center">
          {governador?.photo_url && (
            <Link
              to="/governador"
              onClick={() => setOpen(false)}
              className="hidden shrink-0 items-center gap-3 rounded-lg border border-border bg-surface/50 px-3 py-2 transition-colors hover:bg-surface sm:flex"
              title={`Governador${governador.name ? `: ${governador.name}` : ""}`}
            >
              <img
                src={governador.photo_url}
                alt={governador.name ? `Governador ${governador.name}` : "Governador"}
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-primary/30"
              />
              <div className="hidden min-w-0 md:block">
                <div className="text-[9px] font-bold uppercase tracking-wider leading-tight text-primary">Governador</div>
                <div className={cn("font-display text-xs font-semibold leading-tight text-foreground mt-0.5", !governador.name?.includes(" // ") && "whitespace-nowrap")}>
                  {governador.name?.split(" // ").map((part, i) => (
                    <span key={i} className="block">
                      {part}
                    </span>
                  ))}
                </div>
              </div>
              {governador.pin_url && (
                <img
                  src={governador.pin_url}
                  alt="PIN do Governador"
                  className="h-10 w-auto max-w-10 shrink-0 object-contain"
                />
              )}
            </Link>
          )}
        </div>
        <div className="flex min-w-0 items-center justify-end gap-2">
          <Link
            to="/doar"
            className="ml-1 inline-flex items-center justify-center rounded-md bg-gold px-3 py-2 text-sm font-semibold text-gold-foreground shadow-card transition-transform hover:scale-105 2xl:ml-2 2xl:px-4"
          >
            Doar
          </Link>
          <a
            href="https://lovable.dev/projects/3c09d0df-b614-426e-b3c7-58ab2e837294"
            target="_blank"
            rel="noreferrer"
            className="ml-1 hidden items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold tracking-wide text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary-deep hover:shadow-md active:scale-95 group sm:inline-flex 2xl:px-5"
          >
            <span>Lions Connecta</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-90 transition-opacity group-hover:opacity-100" />
          </a>
          <a
            href="https://lionsinternational.my.site.com/s/login/?language=pt_BR"
            target="_blank"
            rel="noreferrer"
            className="ml-1 hidden items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold tracking-wide text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary-deep hover:shadow-md active:scale-95 group sm:inline-flex 2xl:px-5"
          >
            <span><span className="text-gold" style={{ fontFamily: 'var(--font-engraved)' }}>Lion</span>Portal</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-90 transition-opacity group-hover:opacity-100" />
          </a>

          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex shrink-0 items-center justify-center rounded-md p-2 text-foreground 2xl:hidden"
            aria-label="Abrir menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div className="hidden border-t border-border bg-background/95 2xl:block">
        <div className="mx-auto flex h-12 max-w-[1800px] items-center justify-center px-4 sm:px-6 lg:px-8">
          <DesktopNav />
        </div>
      </div>

      <div className={cn("border-t border-border 2xl:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-surface"
            activeProps={{ className: "text-primary bg-surface" }}
            activeOptions={{ exact: true }}
          >
            Início
          </Link>
          <div className="ml-3 flex flex-col gap-2 border-l border-border pl-3">
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
          <div className="mt-2 px-3 py-2 text-base font-medium text-foreground">Líderes</div>
          <div className="ml-3 flex flex-col gap-2 border-l border-border pl-3">
            <Link
              to="/governador"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-surface"
              activeProps={{ className: "text-primary bg-surface" }}
            >
              Governador
            </Link>
            <div className="ml-3 flex flex-col gap-2 border-l border-border pl-3">
              {equipeGovernadorSubmenu.map((s) => (
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
            {lideresSubmenu.slice(1).map((s) => (
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
          <div className="mt-1 px-3 py-2 text-base font-medium text-foreground">Clubes e Leões</div>
          <div className="ml-3 flex flex-col gap-1 border-l border-border pl-3">
            <Link
              to="/clubes/grandes-leoes"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-surface"
              activeProps={{ className: "text-primary bg-surface" }}
            >
              Grandes Leões
            </Link>
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
                  to={r.to as any}
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
            to="/documentos"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-surface"
            activeProps={{ className: "text-primary bg-surface" }}
          >
            Documentos
          </Link>
          <div className="ml-3 flex flex-col gap-1 border-l border-border pl-3">
            <div className="px-3 py-1 text-sm font-medium text-foreground/70">Atos do(a) Governador(a)</div>
            <div className="ml-3 flex flex-col gap-1 border-l border-border pl-3">
              {atosGovernadorSubmenu.map((s) => (
                <Link
                  key={s.to}
                  to={s.to as any}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-surface"
                  activeProps={{ className: "text-primary bg-surface" }}
                >
                  {s.label}
                </Link>
              ))}
            </div>
            <div className="px-3 py-1 text-sm font-medium text-foreground/70">RGDs e Convenção</div>
            <div className="ml-3 flex flex-col gap-2 border-l border-border pl-3">
              {rgdsConvencaoSubmenu.map((g) => (
                <div key={g.label}>
                  <div className="px-3 py-1 text-xs font-medium uppercase tracking-wide text-foreground/60">{g.label}</div>
                  <div className="ml-3 flex flex-col gap-1 border-l border-border pl-3">
                    {g.items.map((s) => (
                      <Link
                        key={s.to}
                        to={s.to as any}
                        onClick={() => setOpen(false)}
                        className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-surface"
                        activeProps={{ className: "text-primary bg-surface" }}
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {documentosSubmenu.map((s) => (
              <Link
                key={s.to}
                to={s.to as any}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-surface"
                activeProps={{ className: "text-primary bg-surface" }}
              >
                {s.label}
              </Link>
            ))}
          </div>
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
          <a
            href="https://lookerstudio.google.com/reporting/59bed738-bb40-496a-99a1-ff4b9dd931e3/page/dfKpF"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-primary bg-gold px-3 py-2 text-base font-semibold text-gold-foreground shadow-sm hover:bg-gold/90"
          >
            Dados <ExternalLink className="h-4 w-4" />
          </a>
          <Link
            to="/lcif"
            onClick={() => setOpen(false)}
            className="rounded-md border-2 border-gold bg-primary px-3 py-2 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary-deep"
            activeProps={{ className: "bg-primary-deep border-gold ring-2 ring-gold/50" }}
          >
            LCIF
          </Link>
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
          <a
            href="https://lionsinternational.my.site.com/s/login/?language=pt_BR"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold tracking-wide text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary-deep hover:shadow-md active:scale-95 group"
          >
            <span><span className="text-gold" style={{ fontFamily: 'var(--font-engraved)' }}>Lion</span>Portal</span>
            <ExternalLink className="h-4 w-4 opacity-90 transition-opacity group-hover:opacity-100" />
          </a>
        </nav>
      </div>

      {(governador?.message || governador?.motto) && (
        <div className="border-t border-primary/20 bg-gradient-to-r from-primary/90 via-primary to-primary/90">
          <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
            <p className="text-center font-display text-sm font-semibold italic tracking-wide text-primary-foreground sm:text-base">
              {governador?.message || `“${governador?.motto}”`}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
