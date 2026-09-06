import { createFileRoute, Link } from "@tanstack/react-router";
import { useSiteContent } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { BreakableText, normalizeBreaks } from "@/components/BreakableText";
import { PartnerLogosSection } from "@/components/PartnerLogosSection";
import { Building2 } from "lucide-react";

const DEFAULTS = {
  eyebrow: "Conexão Solidária",
  title: "Parceria Institucional",
  description: "Alianças entre o Distrito LC-11 e instituições públicas e privadas para ampliar o impacto social.",
  intro:
    "A Parceria Institucional é o elo entre o Distrito LC-11 e órgãos públicos, empresas e entidades da sociedade civil que compartilham o compromisso com o bem-estar das comunidades.\n\nPor meio dessas alianças, unimos forças, recursos e experiências para realizar ações sociais de maior alcance em todo o estado.",
  highlights_title: "Como funciona",
  highlights:
    "Acordos de cooperação com órgãos públicos e privados\nProjetos sociais desenvolvidos em conjunto\nApoio institucional a campanhas do distrito\nTransparência e prestação de contas em todas as ações",
  footer_text: "Sua instituição quer caminhar junto com o Distrito LC-11? Entre em contato e vamos conversar.",
  image_url: "",
  partner_logos_title: "Nossos Parceiros Institucionais",
  partner_logos: [] as string[],
  partner_logos_links: [] as string[],
};

export const Route = createFileRoute("/parceria-institucional")({
  head: () => ({
    meta: [
      { title: "Parceria Institucional — Distrito LC-11" },
      { name: "description", content: "Alianças entre o Distrito LC-11 e instituições públicas e privadas para ampliar o impacto social." },
      { property: "og:title", content: "Parceria Institucional — Distrito LC-11" },
      { property: "og:description", content: "Alianças entre o Distrito LC-11 e instituições públicas e privadas para ampliar o impacto social." },
    ],
  }),
  component: ParceriaInstitucionalPage,
});

function ParceriaInstitucionalPage() {
  const c = useSiteContent("parceria-institucional", DEFAULTS);
  const highlights = normalizeBreaks(c.highlights || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const paragraphs = normalizeBreaks(c.intro || "").split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {c.image_url && (
          <img
            src={c.image_url}
            alt="Parceria Institucional"
            className="mx-auto mb-8 max-h-[480px] w-auto max-w-full rounded-lg object-contain"
          />
        )}
        <div className="space-y-6 text-foreground/80">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {highlights.length > 0 && (
            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="font-display text-xl font-semibold text-foreground">
                <BreakableText text={c.highlights_title} />
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-foreground/80">
                {highlights.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {c.footer_text && (
            <p>
              <BreakableText text={c.footer_text} />
            </p>
          )}

          <PartnerLogosSection
            title={c.partner_logos_title}
            images={c.partner_logos}
            links={c.partner_logos_links}
            categoryLabel="Institucionais"
          />

          <div className="mt-10 rounded-2xl border border-border bg-primary p-8 text-primary-foreground shadow-elegant">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-gold-foreground">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl font-bold">Faça parte dessa corrente</h3>
                <p className="mt-1 text-sm opacity-90">
                  Sua doação fortalece as ações sociais do Distrito LC-11 em todo o estado.
                </p>
              </div>
              <Link
                to="/doar"
                className="inline-flex items-center justify-center rounded-lg bg-gold px-6 py-3 font-display font-semibold text-gold-foreground shadow-card transition-transform hover:scale-105"
              >
                Doar agora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
