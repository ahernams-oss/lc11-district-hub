import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, User } from "lucide-react";
import { useLeader } from "@/lib/leaders";
import { useState } from "react";

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

  const gallery = (leader.gallery_urls ?? []).filter(Boolean);

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/ex-governadores"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar aos Ex-Governadores
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-[280px_1fr]">
        <div className="flex flex-col items-center text-center">
          {leader.photo_url ? (
            <img
              src={leader.photo_url}
              alt={leader.name}
              className="h-56 w-56 rounded-full object-cover shadow-elegant"
            />
          ) : (
            <div className="flex h-56 w-56 items-center justify-center rounded-full bg-surface">
              <User className="h-24 w-24 text-muted-foreground/60" />
            </div>
          )}
          <h1 className="mt-4 font-display text-2xl font-bold text-foreground">{leader.name}</h1>
          {leader.year_label && (
            <div className="mt-1 text-sm font-semibold text-primary">{leader.year_label}</div>
          )}
          {leader.motto && (
            <div className="mt-2 text-sm italic text-muted-foreground">"{leader.motto}"</div>
          )}
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
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {gallery.map((url, i) => (
              <button
                key={i}
                onClick={() => setLightbox(url)}
                className="group overflow-hidden rounded-lg border border-border bg-card"
              >
                <img
                  src={url}
                  alt={`Foto ${i + 1} de ${leader.name}`}
                  className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                />
              </button>
            ))}
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
