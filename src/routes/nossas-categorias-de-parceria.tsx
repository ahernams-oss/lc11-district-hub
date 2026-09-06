import { createFileRoute, Link } from "@tanstack/react-router";
import { useSiteContent } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { BreakableText, normalizeBreaks } from "@/components/BreakableText";
import { HandHeart } from "lucide-react";

const DEFAULTS = {
  eyebrow: "Conexão Solidária",
  title: "Nossas Categorias de Parceria",
  description: "Conheça as formas de parceria do programa Conexão Solidária do Distrito LC-11.",
  intro:
    "O Conexão Solidária oferece diferentes categorias de parceria para empresas, instituições e pessoas que desejam apoiar as ações sociais dos Lions Clubes do Distrito LC-11.\n\nCada categoria reconhece o nível de contribuição do parceiro e multiplica o impacto nas comunidades atendidas.",
  highlights_title: "Categorias de parceria",
  highlights:
    "Parceiro Bronze — apoiador inicial das campanhas do distrito\nParceiro Prata — contribuição recorrente em projetos sociais\nParceiro Ouro — patrocínio de grandes ações e eventos\nParceiro Diamante — aliança estratégica de longo prazo",
  footer_text:
    "Quer saber qual categoria combina com a sua empresa? Entre em contato e vamos conversar.",
  image_url: "",
};

export const Route = createFileRoute("/nossas-categorias-de-parceria")({
  head: () => ({
    meta: [
      { title: "Nossas Categorias de Parceria — Distrito LC-11" },
      { name: "description", content: "Categorias de parceria do programa Conexão Solidária do Distrito LC-11." },
      { property: "og:title", content: "Nossas Categorias de Parceria — Distrito LC-11" },
      { property: "og:description", content: "Categorias de parceria do programa Conexão Solidária do Distrito LC-11." },
    ],
  }),
  component: NossasCategoriasDeParceriaPage,
});

function NossasCategoriasDeParceriaPage() {
  const c = useSiteContent("nossas-categorias-de-parceria", DEFAULTS);
  const highlights = normalizeBreaks(c.highlights || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const paragraphs = normalizeBreaks(c.intro || "").split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {c.image_url && (
          <img
            src={c.image_url}
            alt="Nossas Categorias de Parceria"
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

          <div className="mt-10 rounded-2xl border border-border bg-primary p-8 text-primary-foreground shadow-elegant">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-gold-foreground">
                <HandHeart className="h-6 w-6" />
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
