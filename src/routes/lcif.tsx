import { createFileRoute } from "@tanstack/react-router";
import { useSiteContent } from "@/lib/content";
import { PageHero } from "@/components/PageHero";

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
        </div>
      </div>
    </>
  );
}
