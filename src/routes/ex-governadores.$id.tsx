import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, User } from "lucide-react";
import { useLeader } from "@/lib/leaders";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/ex-governadores/$id")({
  head: () => ({
    meta: [
      { title: "Biografia do Ex-Governador — Distrito LC-11" },
      { name: "description", content: "Biografia e galeria de fotos do ex-governador." },
    ],
  }),
  component: ExGovernadorBio,
});

function ExGovernadorBio() {
  const { id } = useParams({ from: "/ex-governadores/$id" });
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
        <Link to="/ex-governadores" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <p className="mt-6">Ex-governador não encontrado.</p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/ex-governadores"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar aos Ex-Governadores
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-[180px_1fr]">
        <div className="flex flex-col items-center text-center">
          {leader.photo_url ? (
            <img
              src={leader.photo_url}
              alt={leader.name}
              className="h-28 w-28 rounded-full object-cover shadow-elegant"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-surface">
              <User className="h-12 w-12 text-muted-foreground/60" />
            </div>
          )}
          <div className="mt-4 w-full max-w-[14rem] rounded-xl border border-gold/40 bg-gradient-to-b from-gold/10 to-gold/5 p-3 text-center shadow-elegant">
            <h1 className="font-display text-base font-bold leading-tight text-foreground">{leader.name}</h1>
            {leader.year_label && (
              <div className="mt-1 text-xs font-semibold tracking-wide text-primary uppercase">{leader.year_label}</div>
            )}
            {leader.motto && (
              <div className="mt-2 border-t border-gold/30 pt-2 text-xs italic text-muted-foreground">{leader.motto}</div>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Biografia</h2>
          {leader.bio ? (
            <div className="mt-3 whitespace-pre-line text-foreground/90 leading-relaxed">
              {leader.bio}
            </div>
          ) : (
            <p className="mt-3 text-muted-foreground">Biografia ainda não cadastrada.</p>
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
