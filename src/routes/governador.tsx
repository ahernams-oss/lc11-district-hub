import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Mail, Phone, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import govImg from "@/assets/governador.jpg";
import { useSiteContent } from "@/lib/content";
import { useLeaders } from "@/lib/leaders";

export const Route = createFileRoute("/governador")({
  head: () => ({
    meta: [
      { title: "Governador do Distrito — Distrito LC-11" },
      { name: "description", content: "Conheça o Governador do Distrito LC-11." },
    ],
    links: [{ rel: "canonical", href: "/governador" }],
  }),
  component: Governador,
});

function Governador() {
  const content = useSiteContent("governador", {
    eyebrow: "Liderança ano Lionistico 2026–2027",
    title: "Governador ",
    description: "Liderando com servir, inspirando com exemplo.",
  });
  const { data: leaders = [] } = useLeaders("governador");
  const gov = leaders[0];

  const name = gov?.name ?? "CL Nome do Governador";
  const role = gov?.role ?? "Governador do Distrito LC-11";
  const email = gov?.email ?? "governador@distritolc11.org";
  const phone = gov?.phone ?? "(00) 00000-0000";
  const photo = gov?.photo_url ?? govImg;
  const message = gov?.message ?? "Servir é o aluguel que pagamos pelo espaço que ocupamos.";
  const bio = gov?.bio ?? "Companheiros e companheiras Leões, é com profunda honra que assumo a Governadoria do Distrito LC-11.";
  const gallery = (gov?.gallery_urls ?? []).filter(Boolean);

  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (gallery.length <= 1) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % gallery.length), 4000);
    return () => clearInterval(t);
  }, [gallery.length]);



  return (
    <>
      <PageHero eyebrow={content.eyebrow} title={content.title} description={content.description} />

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
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{email}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{phone}</p>
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
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === slide ? "opacity-100" : "opacity-0"}`}
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
            <div className="rounded-xl bg-primary p-6 text-primary-foreground shadow-card">
              <Quote className="h-8 w-8 text-gold" />
              <p className="mt-3 font-display text-xl italic leading-relaxed sm:text-2xl whitespace-pre-line">
                {message}
              </p>
            </div>

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
