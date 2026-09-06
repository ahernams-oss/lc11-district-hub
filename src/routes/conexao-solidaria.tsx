import { createFileRoute, Link } from "@tanstack/react-router";
import { useSiteContent } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { BreakableText, normalizeBreaks } from "@/components/BreakableText";
import { HandHeart } from "lucide-react";

const DEFAULTS = {
  eyebrow: "Solidariedade",
  title: "Conexão Solidária",
  description: "Conectando quem quer ajudar a quem mais precisa.",
  intro:
    "O Conexão Solidária é a iniciativa do Distrito LC-11 que aproxima pessoas, empresas e comunidades em torno de ações sociais. Aqui você encontra oportunidades de apoiar campanhas, participar de projetos e transformar realidades.\n\nJunte-se a nós nessa corrente do bem.",
  highlights_title: "Como participar",
  highlights:
    "Doe para nossas campanhas ativas\nSeja voluntário em projetos do distrito\nDivulgue nossas ações na sua comunidade\nProponha parcerias com empresas e instituições",
  footer_text:
    "Para propor parcerias ou saber mais sobre o Conexão Solidária, entre em contato com o Distrito LC-11.",
  image_url: "",
};

export const Route = createFileRoute("/conexao-solidaria")({
  head: () => ({
    meta: [
      { title: "Conexão Solidária — Distrito LC-11" },
      { name: "description", content: "Conexão Solidária: ações sociais e campanhas do Distrito LC-11." },
      { property: "og:title", content: "Conexão Solidária — Distrito LC-11" },
      { property: "og:description", content: "Conexão Solidária: ações sociais e campanhas do Distrito LC-11." },
    ],
  }),
  component: ConexaoSolidariaPage,
});

function ConexaoSolidariaPage() {
  const c = useSiteContent("conexao-solidaria", DEFAULTS);
  const highlights = normalizeBreaks(c.highlights || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const paragraphs = normalizeBreaks(c.intro || "").split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {c.image_url && (
          <img
            src={c.image_url}
            alt="Conexão Solidária"
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
