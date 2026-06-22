import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { User } from "lucide-react";
import { useSiteContent } from "@/lib/content";
import { useLeaders } from "@/lib/leaders";

export const Route = createFileRoute("/ex-governadores")({
  head: () => ({
    meta: [
      { title: "Galeria de Ex-Governadores — Distrito LC-11" },
      { name: "description", content: "Conheça os ex-governadores do Distrito LC-11." },
    ],
    links: [{ rel: "canonical", href: "/ex-governadores" }],
  }),
  component: ExGovernadores,
});

const fallback = [
  { id: "1", name: "CL Carlos Alberto Silva", year_label: "2024–2025", motto: "Servir com visão", photo_url: null },
  { id: "2", name: "CL Maria Fernanda Costa", year_label: "2023–2024", motto: "Unidos pelo bem", photo_url: null },
];

function ExGovernadores() {
  const content = useSiteContent("ex-governadores", {
    eyebrow: "História do distrito",
    title: "Galeria de Ex-Governadores",
    description: "Líderes que dedicaram seu tempo e talento para fortalecer o Distrito LC-11.",
  });
  const { data: leaders = [] } = useLeaders("ex_governador");
  const list = leaders.length ? leaders : (fallback as any);

  return (
    <>
      <PageHero eyebrow={content.eyebrow} title={content.title} description={content.description} />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((g: any) => (
            <Link
              key={g.id}
              to="/ex-governadores/$id"
              params={{ id: String(g.id) }}
              className="group flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-card transition-transform hover:-translate-y-1 hover:shadow-elegant"
            >
              {g.photo_url ? (
                <img src={g.photo_url} alt={g.name} className="h-24 w-24 rounded-full object-cover" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface">
                  <User className="h-12 w-12 text-muted-foreground/60" />
                </div>
              )}
              <div className="mt-4 font-display text-lg font-bold text-foreground">
                {g.name?.split(" // ").map((part: string, i: number, arr: string[]) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </div>
              {g.year_label && <div className="mt-1 text-sm font-semibold text-primary">{g.year_label}</div>}
              {g.motto && <div className="mt-2 text-sm italic text-muted-foreground">"{g.motto}"</div>}
              <div className="mt-3 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Ver biografia →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
