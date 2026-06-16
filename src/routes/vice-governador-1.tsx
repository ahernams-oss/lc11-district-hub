import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Mail, Phone } from "lucide-react";
import { useSiteContent } from "@/lib/content";
import { useLeaders } from "@/lib/leaders";

export const Route = createFileRoute("/vice-governador-1")({
  head: () => ({ meta: [{ title: "1º Vice-Governador — Distrito LC-11" }] }),
  component: Page,
});

function Page() {
  const content = useSiteContent("vice-governador-1", {
    eyebrow: "Liderança ano Lionistico 2026–2027",
    title: "1º Vice-Governador do Distrito LC-11",
    description: "Apoiando o Governador e preparando o próximo ano leonístico.",
  });
  const { data: leaders = [] } = useLeaders("vice1");
  const v = leaders[0];

  return (
    <>
      <PageHero eyebrow={content.eyebrow} title={content.title} description={content.description} />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {v?.photo_url && (
          <img src={v.photo_url} alt={v.name} className="mb-6 h-48 w-48 rounded-2xl object-cover shadow-elegant" />
        )}
        <div className="rounded-xl bg-surface p-6">
          <p className="font-semibold text-foreground">
            {v?.name?.split(" // ").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && <br />}
              </span>
            )) ?? "CL Nome do 1º Vice-Governador"}
          </p>
          <p className="mt-1 text-muted-foreground">{v?.role ?? "1º Vice-Governador do Distrito LC-11"}</p>
          <div className="mt-4 space-y-2 text-muted-foreground">
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{v?.email ?? "1vice@distritolc11.org"}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{v?.phone ?? "(00) 00000-0000"}</p>
          </div>
        </div>
        {(v?.bio || true) && (
          <div className="prose prose-lg mt-8 max-w-none text-foreground">
            <h2 className="font-display text-2xl font-bold">Trajetória</h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {v?.bio ?? "Companheiro Leão com ampla experiência no movimento leonístico."}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
