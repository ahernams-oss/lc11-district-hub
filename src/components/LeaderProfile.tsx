import { Mail, Phone, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { Leader, LeaderCategory } from "@/lib/leaders";
import { useLeaders } from "@/lib/leaders";
import { PageHero } from "@/components/PageHero";

interface Defaults {
  eyebrow: string;
  title: string;
  description: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  message: string;
  bio: string;
  photo: string;
}

export function LeaderProfile({
  category,
  defaults,
}: {
  category: LeaderCategory;
  defaults: Defaults;
}) {
  const { data: leaders = [] } = useLeaders(category);
  const leader: Leader | undefined = leaders[0];

  const name = leader?.name ?? defaults.name;
  const role = leader?.role ?? defaults.role;
  const email = leader?.email ?? defaults.email;
  const phone = leader?.phone ?? defaults.phone;
  const photo = leader?.photo_url ?? defaults.photo;
  const message = leader?.message ?? defaults.message;
  const bio = leader?.bio ?? defaults.bio;
  const gallery = (leader?.gallery_urls ?? []).filter(Boolean);

  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (gallery.length <= 1) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % gallery.length), 4000);
    return () => clearInterval(t);
  }, [gallery.length]);

  return (
    <>
      <PageHero eyebrow={defaults.eyebrow} title={defaults.title} description={defaults.description} />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-start">
          <div className="mx-auto w-full max-w-sm">
            <div className="overflow-hidden rounded-2xl border border-border shadow-elegant">
              <img src={photo} alt={name} className="h-full w-full object-cover" />
            </div>
            <div className="mt-6 rounded-xl bg-surface p-5 text-sm">
              <p className="font-semibold text-foreground">
                {name.split(" // ").map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </p>
              <p className="mt-1 text-muted-foreground">{role}</p>
              <div className="mt-4 space-y-2 text-muted-foreground">
                {email && (
                  <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{email}</p>
                )}
                {phone && (
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{phone}</p>
                )}
              </div>
            </div>

            {gallery.length > 0 && (
              <div className="mt-6 overflow-hidden rounded-xl border border-border shadow-card">
                <div className="relative aspect-[4/3] bg-muted">
                  {gallery.map((url, i) => (
                    <img
                      key={url + i}
                      src={url}
                      alt={`${name} — foto ${i + 1}`}
                      className={`absolute inset-0 h-full w-full object-contain object-center transition-opacity duration-700 ${i === slide ? "opacity-100" : "opacity-0"}`}
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
            )}
          </div>

          <div>
            {message && (
              <div className="rounded-xl bg-primary p-6 text-primary-foreground shadow-card">
                <Quote className="h-8 w-8 text-gold" />
                <p className="mt-3 font-display text-xl italic leading-relaxed sm:text-2xl whitespace-pre-line">
                  {message}
                </p>
              </div>
            )}

            <div className="prose prose-lg mt-10 max-w-none text-foreground">
              <h2 className="font-display text-2xl font-bold">Trajetória</h2>
              <p className="text-muted-foreground whitespace-pre-line">{bio}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
