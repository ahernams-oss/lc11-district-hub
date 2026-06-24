import { createFileRoute, Link } from "@tanstack/react-router";
import { useSiteContent } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { Heart } from "lucide-react";

const DEFAULTS = {
  eyebrow: "Fundação",
  title: "LCIF",
  description: "Lions Clubs International Foundation",
  intro:
    "A LCIF (Lions Clubs International Foundation) é a organização filantrópica oficial dos Lions Clubs. Fundada em 1968, a LCIF apoia projetos humanitários em todo o mundo, financiando iniciativas nas áreas de saúde, educação, meio ambiente e alívio de desastres.\n\nO Distrito LC-11 orgulha-se de colaborar com a LCIF em diversas campanhas e projetos que impactam positivamente as comunidades que servimos.",
  campaigns_title: "Campanhas em Destaque",
  campaigns:
    "Combate à cegueira e problemas visuais\nApoio à educação e alfabetização infantil\nAuxílio em desastres naturais\nProgramas de combate à fome\nDiabetes e saúde pública",
  footer_text:
    "Para mais informações ou para contribuir com a LCIF, entre em contato com o Distrito LC-11 ou visite o site oficial da LCIF.",
  image_url: "",
};

export const Route = createFileRoute("/lcif")({
  head: () => ({
    meta: [
      { title: "LCIF — Distrito LC-11" },
      { name: "description", content: "Lions Clubs International Foundation - Distrito LC-11" },
      { property: "og:title", content: "LCIF — Distrito LC-11" },
      { property: "og:description", content: "Lions Clubs International Foundation - Distrito LC-11" },
    ],
  }),
  component: LcifPage,
});

function LcifPage() {
  const c = useSiteContent("lcif", DEFAULTS);
  const campaigns = (c.campaigns || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const paragraphs = (c.intro || "").split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {c.image_url && (
          <img
            src={c.image_url}
            alt=""
            className="mx-auto mb-8 max-h-[480px] w-auto max-w-full rounded-lg object-contain"
          />
        )}
        <div className="space-y-6 text-foreground/80">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {campaigns.length > 0 && (
            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="font-display text-xl font-semibold text-foreground">
                {c.campaigns_title}
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-foreground/80">
                {campaigns.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {c.footer_text && <p>{c.footer_text}</p>}

          <div className="mt-10 rounded-2xl border border-border bg-primary p-8 text-primary-foreground shadow-elegant">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-gold-foreground">
                <Heart className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl font-bold">Apoie a LCIF</h3>
                <p className="mt-1 text-sm opacity-90">
                  Sua contribuição financia projetos humanitários que transformam vidas ao redor do mundo.
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
