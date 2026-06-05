import { createFileRoute } from "@tanstack/react-router";

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
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold text-foreground">LCIF</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Lions Clubs International Foundation
      </p>
      <div className="mt-8 space-y-6 text-foreground/80">
        <p>
          A LCIF (Lions Clubs International Foundation) é a organização filantrópica oficial dos Lions Clubs. Fundada em 1968, a LCIF apoia projetos humanitários em todo o mundo, financiando iniciativas nas áreas de saúde, educação, meio ambiente e alívio de desastres.
        </p>
        <p>
          O Distrito LC-11 orgulha-se de colaborar com a LCIF em diversas campanhas e projetos que impactam positivamente as comunidades que servimos.
        </p>
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="font-display text-xl font-semibold text-foreground">Campanhas em Destaque</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-foreground/80">
            <li>Combate à cegueira e problemas visuais</li>
            <li>Apoio à educação e alfabetização infantil</li>
            <li>Auxílio em desastres naturais</li>
            <li>Programas de combate à fome</li>
            <li>Diabetes e saúde pública</li>
          </ul>
        </div>
        <p>
          Para mais informações ou para contribuir com a LCIF, entre em contato com o Distrito LC-11 ou visite o site oficial da LCIF.
        </p>
      </div>
    </div>
  );
}
