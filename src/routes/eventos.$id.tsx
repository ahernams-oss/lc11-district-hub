import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/PageHero";
import { useEvent } from "@/lib/events";
import { ArrowLeft, MapPin, Clock, Calendar, Users, User, Pencil, Hotel, UtensilsCrossed, Compass, Info } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/eventos/$id")({
  component: EventDetail,
});

function Banner({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [images.length]);
  if (images.length === 0) return null;
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-white shadow-card">
      {images.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt={alt}
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Foto ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === idx ? "w-8 bg-primary" : "w-2 bg-primary/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
        <Icon className="h-5 w-5 text-primary" /> {title}
      </h2>
      <div className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{children}</div>
    </section>
  );
}

function EventDetail() {
  const { id } = Route.useParams();
  const { data: event, isLoading } = useEvent(id);
  const { canEditContent } = useAuth();

  if (isLoading) {
    return <p className="mx-auto max-w-7xl px-4 py-16 text-muted-foreground">Carregando...</p>;
  }
  if (!event) throw notFound();

  const start = event.starts_at ? new Date(event.starts_at) : null;
  const end = event.ends_at ? new Date(event.ends_at) : null;
  const now = new Date();
  const ended = (end ?? start) ? (end ?? start)!.getTime() < now.getTime() : false;

  const images = [event.cover_url, ...(event.gallery_urls ?? [])].filter(Boolean) as string[];
  const hasGeo = event.latitude != null && event.longitude != null;
  const mapsSrc = hasGeo
    ? `https://www.google.com/maps?q=${event.latitude},${event.longitude}&z=15&output=embed`
    : event.location
      ? `https://www.google.com/maps?q=${encodeURIComponent(event.location)}&z=14&output=embed`
      : null;

  return (
    <>
      <PageHero
        eyebrow={event.tag ?? "Evento"}
        title={event.title}
        description={event.description ?? undefined}
      />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/eventos"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Eventos
          </Link>
          {canEditContent && (
            <Link
              to="/admin/eventos/$id"
              params={{ id: event.id }}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-semibold hover:border-primary"
            >
              <Pencil className="h-4 w-4" /> Editar
            </Link>
          )}
        </div>

        {ended && (
          <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm font-semibold text-destructive">
            ⚠ Evento encerrado
          </div>
        )}

        {images.length > 0 && (
          <div className="mt-6">
            <Banner images={images} alt={event.title} />
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {event.location && (
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <MapPin className="h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Local</div>
                <div className="font-semibold text-foreground">{event.location}</div>
              </div>
            </div>
          )}
          {start && (
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <Calendar className="h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data e hora</div>
                <div className="font-semibold text-foreground">
                  {start.toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}
                  {end && (
                    <span className="block text-sm font-normal text-muted-foreground">
                      até {end.toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          {event.host_club && (
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <Users className="h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clube anfitrião</div>
                <div className="font-semibold text-foreground">{event.host_club}</div>
              </div>
            </div>
          )}
          {event.organizer && (
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <User className="h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Responsável</div>
                <div className="font-semibold text-foreground">{event.organizer}</div>
              </div>
            </div>
          )}
        </div>

        {mapsSrc && (
          <div className="mt-6 overflow-hidden rounded-xl border border-border shadow-card">
            <iframe
              title="Mapa do local"
              src={mapsSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-80 w-full"
            />
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {event.place_info && (
            <Section icon={Info} title="Sobre o lugar">{event.place_info}</Section>
          )}
          {event.lodging_tips && (
            <Section icon={Hotel} title="Dicas de hospedagem">{event.lodging_tips}</Section>
          )}
          {event.food_tips && (
            <Section icon={UtensilsCrossed} title="Dicas gastronômicas">{event.food_tips}</Section>
          )}
          {event.tourism_tips && (
            <Section icon={Compass} title="Dicas de turismo">{event.tourism_tips}</Section>
          )}
        </div>
      </section>
    </>
  );
}
