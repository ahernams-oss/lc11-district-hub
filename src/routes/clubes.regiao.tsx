import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { MapPin, Users } from "lucide-react";
import { useRegions } from "@/lib/regions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/clubes/regiao")({
  head: () => ({
    meta: [
      { title: "Clubes por Região — Distrito LC-11" },
      { name: "description", content: "Explore os clubes Lions do Distrito LC-11 organizados por região e divisão." },
      { property: "og:title", content: "Clubes por Região — Distrito LC-11" },
      { property: "og:description", content: "Explore os clubes Lions do Distrito LC-11 organizados por região e divisão." },
      { property: "og:url", content: "/clubes/regiao" },
    ],
    links: [{ rel: "canonical", href: "/clubes/regiao" }],
  }),
  component: ClubesRegiao,
});

function useRegionsSummary() {
  return useQuery({
    queryKey: ["regions", "summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("id, letter, name, description, order_index, divisions(id, code, name, clubs(id, city))")
        .order("order_index");
      if (error) throw error;
      return data ?? [];
    },
  });
}

function ClubesRegiao() {
  const { data: regions = [], isLoading } = useRegionsSummary();
  return (
    <>
      <PageHero
        eyebrow="Nossa rede"
        title="Clubes por Região."
        description="O Distrito LC-11 abrange diversas regiões, organizadas em divisões para melhor gestão e apoio aos clubes."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando regiões...</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regions.map((r: any) => {
              const totalClubs = (r.divisions ?? []).reduce(
                (s: number, d: any) => s + (d.clubs?.length ?? 0),
                0,
              );
              const cities = Array.from(
                new Set(
                  (r.divisions ?? []).flatMap((d: any) =>
                    (d.clubs ?? []).map((c: any) => c.city).filter(Boolean),
                  ),
                ),
              ).slice(0, 6) as string[];
              return (
                <Link
                  key={r.id}
                  to="/clubes/regiao/$letra"
                  params={{ letra: r.letter }}
                  className="rounded-xl border border-border bg-card p-5 shadow-card transition-transform hover:-translate-y-1 hover:border-primary"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-bold text-foreground">{r.name}</h3>
                    <span className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
                      <Users className="h-3 w-3" /> {totalClubs} clube{totalClubs === 1 ? "" : "s"}
                    </span>
                  </div>
                  {r.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
                  )}
                  <div className="mt-3 space-y-1">
                    {cities.map((c) => (
                      <p key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" /> {c}
                      </p>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
