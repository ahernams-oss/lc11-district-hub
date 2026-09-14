import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Award } from "lucide-react";
import { useLeader } from "@/lib/leaders";
import { useEffect, useState } from "react";
import { BreakableText } from "@/components/BreakableText";

export const Route = createFileRoute("/grandes-leoes/$id")({
  head: () => ({
    meta: [
      { title: "Grande Leão — História e Trajetória | Distrito LC-11" },
      {
        name: "description",
        content:
          "Conheça a história, o clube e a trajetória de serviço de um Grande Leão do Distrito LC-11.",
      },
      { property: "og:title", content: "Grande Leão — História e Trajetória" },
      {
        property: "og:description",
        content: "Biografia, clube e galeria de fotos de um Grande Leão do Distrito LC-11.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GrandeLeaoBio,
});

function GrandeLeaoBio() {
  const { id } = useParams({ from: "/grandes-leoes/$id" });
  const { data: leader, isLoading } = useLeader(id);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const gallery = (leader?.gallery_urls ?? []).filter(Boolean);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (gallery.length <= 1) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % gallery.length), 4000);
    return () => clearInterval(t);
  }, [gallery.length]);

  if (isLoading) {
    return <div className="mx-auto max-w-5xl px-4 py-16">Carregando...</div>;
  }

  if (!leader) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <Link
          to="/clubes/grandes-leoes"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <p className="mt-6">Grande Leão não encontrado.</p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/clubes/grandes-leoes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar aos Grandes Leões
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-[220px_1fr]">
        <div className="flex flex-col items-center text-center">
          {leader.photo_url ? (
            <img
              src={leader.photo_url}
              alt={leader.name}
              className="h-40 w-40 rounded-full object-cover shadow-elegant ring-4 ring-primary/15"
            />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-surface">
              <Award className="h-14 w-14 text-muted-foreground/60" />
            </div>
          )}
          <div className="mt-4 w-full max-w-[15rem] rounded-xl border border-gold/40 bg-gradient-to-b from-gold/10 to-gold/5 p-4 text-center shadow-elegant">
            <h1 className="font-display text-lg font-bold leading-tight text-foreground">
              {leader.name}
            </h1>
            {leader.role && (
              <div className="mt-1 text-xs font-semibold text-primary">{leader.role}</div>
            )}
            {leader.club_name && (
              <div className="mt-1 text-xs font-medium text-muted-foreground">
                {leader.club_name}
              </div>
            )}
            {leader.year_label && (
              <div className="mt-2 inline-block rounded-full bg-background px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm">
                {leader.year_label}
              </div>
            )}
            {leader.motto && (
              <div className="mt-3 border-t border-gold/30 pt-2 text-xs font-bold italic text-muted-foreground">
                {leader.motto}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl font-bold text-foreground">História e Trajetória</h2>
          {leader.bio ? (
            <div className="mt-3 whitespace-pre-line leading-relaxed text-foreground/90">
              {normalizeBreaks(leader.bio)}
            </div>
          ) : (
            <p className="mt-3 text-muted-foreground">História ainda não cadastrada.</p>
          )}
          {leader.message && (
            <div className="mt-6 rounded-xl border border-border bg-surface p-5 text-sm italic leading-relaxed text-foreground/90">
              <BreakableText text={leader.message} />
            </div>
          )}
        </div>
      </div>

      {gallery.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-bold text-foreground">Galeria de Fotos</h2>
          <div className="mx-auto mt-4 max-w-2xl overflow-hidden rounded-xl border border-border shadow-card">
            <div className="relative aspect-[4/3] bg-muted">
              {gallery.map((url, i) => (
                <img
                  key={url + i}
                  src={url}
                  alt={`Foto ${i + 1} de ${leader.name}`}
                  onClick={() => setLightbox(url)}
                  className={`absolute inset-0 h-full w-full cursor-pointer object-contain object-center transition-opacity duration-700 ${i === slide ? "opacity-100" : "opacity-0"}`}
                />
              ))}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setSlide((s) => (s - 1 + gallery.length) % gallery.length)}
                    aria-label="Foto anterior"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-1.5 text-foreground hover:bg-background"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlide((s) => (s + 1) % gallery.length)}
                    aria-label="Próxima foto"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-1.5 text-foreground hover:bg-background"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {gallery.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSlide(i)}
                        aria-label={`Ir para foto ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all ${i === slide ? "w-5 bg-primary" : "w-1.5 bg-background/70"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </section>
  );
}
