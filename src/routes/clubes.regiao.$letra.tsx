import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { MapPin, Users, Mail, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/clubes/regiao/$letra")({
  head: ({ params }) => {
    const letra = (params.letra || "").toUpperCase();
    return {
      meta: [
        { title: `Região ${letra} — Distrito LC-11` },
        { name: "description", content: `Clubes Lions da Região ${letra} do Distrito LC-11.` },
        { property: "og:title", content: `Região ${letra} — Distrito LC-11` },
        { property: "og:description", content: `Clubes Lions da Região ${letra} do Distrito LC-11.` },
      ],
    };
  },
  component: RegiaoDetalhe,
});

function useRegionDetail(letra: string) {
  return useQuery({
    queryKey: ["region", "detail", letra],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("*, divisions(*, clubs(id, division_id, name, city, state, address, meetings, website, instagram, facebook, president, logo_url, order_index))")
        .eq("letter", letra)
        .maybeSingle();


      if (error) throw error;
      return data;
    },
  });
}

function RegiaoDetalhe() {
  const { letra } = Route.useParams();
  const key = letra.toUpperCase();
  const { data: regiao, isLoading } = useRegionDetail(key);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16">
        <p className="text-muted-foreground">Carregando...</p>
      </section>
    );
  }
  if (!regiao) throw notFound();

  const divisions = (regiao as any).divisions ?? [];
  const allCities = Array.from(
    new Set(divisions.flatMap((d: any) => (d.clubs ?? []).map((c: any) => c.city).filter(Boolean))),
  ) as string[];

  return (
    <>
      <PageHero
        eyebrow={`Região ${regiao.letter}`}
        title={regiao.name}
        description={regiao.description ?? ""}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <OrgChart
          regionPresident={(regiao as any).president}
          regionPhoto={(regiao as any).president_photo_url}
          divisions={divisions
            .slice()
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((d: any) => ({
              code: d.code,
              name: d.name,
              president: d.president_name,
              photo: d.president_photo_url,
            }))}
        />

        {allCities.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground">Cidades atendidas</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {allCities.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-sm text-foreground/80"
                >
                  <MapPin className="h-3.5 w-3.5 text-primary" /> {c}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 space-y-10">
          {divisions
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((d: any) => (
              <div key={d.id}>
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-primary px-3 py-1 font-display text-sm font-bold text-primary-foreground">
                    {d.code}
                  </span>
                  <h2 className="font-display text-xl font-bold text-foreground">{d.name}</h2>
                </div>
                {d.description && <p className="mt-2 text-sm text-muted-foreground">{d.description}</p>}
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(d.clubs ?? [])
                    .sort((a: any, b: any) => a.order_index - b.order_index)
                    .map((c: any) => (
                      <article
                        key={c.id}
                        className="rounded-xl border border-border bg-card p-5 shadow-card"
                      >
                        <h3 className="font-display text-lg font-bold text-foreground">{c.name}</h3>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {c.city && (
                            <p className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary" /> {c.city}
                            </p>
                          )}
                          {c.meetings && <p>📅 {c.meetings}</p>}
                          {c.email && (
                            <p className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-primary" /> {c.email}
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  {(d.clubs ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum clube cadastrado nesta divisão.</p>
                  )}
                </div>
              </div>
            ))}
        </div>
      </section>
    </>
  );
}

interface OrgNode {
  code: string;
  name: string;
  president: string | null;
  photo: string | null;
}

function OrgChart({
  regionPresident,
  regionPhoto,
  divisions,
}: {
  regionPresident: string | null;
  regionPhoto: string | null;
  divisions: OrgNode[];
}) {
  if (!regionPresident && !regionPhoto && divisions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
      <h2 className="mb-8 text-center font-display text-xl font-bold text-foreground">
        Estrutura de Liderança
      </h2>

      <div className="flex flex-col items-center">
        <OrgNodeCard
          label="Presidente de Região"
          name={regionPresident}
          photo={regionPhoto}
        />

        {divisions.length > 0 && (
          <>
            <div className="h-8 w-px bg-primary/40" aria-hidden />
            {divisions.length > 1 && (
              <div
                className="h-px bg-primary/40"
                style={{ width: `calc((100% / ${divisions.length}) * ${divisions.length - 1})` }}
                aria-hidden
              />
            )}
            <div
              className="grid w-full gap-6"
              style={{ gridTemplateColumns: `repeat(${divisions.length}, minmax(0, 1fr))` }}
            >
              {divisions.map((d) => (
                <div key={d.code} className="flex flex-col items-center">
                  <div className="h-8 w-px bg-primary/40" aria-hidden />
                  <OrgNodeCard
                    label={`Presidente de Divisão ${d.code}`}
                    name={d.president}
                    photo={d.photo}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function OrgNodeCard({
  label,
  name,
  photo,
}: {
  label: string;
  name: string | null;
  photo: string | null;
}) {
  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-2xl bg-primary px-5 py-5 text-center text-primary-foreground shadow-md ring-1 ring-primary/30">
      {photo ? (
        <img
          src={photo}
          alt={name ?? label}
          className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-white/60"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/40">
          <User className="h-8 w-8 text-white/80" />
        </div>
      )}
      <div className="min-w-0">
        <p className="font-display text-sm font-bold leading-tight sm:text-base">{label}</p>
        {name && <p className="mt-1 text-xs font-medium text-white/90 sm:text-sm">{name}</p>}
      </div>
    </div>
  );
}


