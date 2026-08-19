import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Heart, Eye, Leaf, Users, Calendar, Trophy, Mail, Phone, Activity, Droplet, LifeBuoy, HandHeart, Utensils, Sparkles, Brain } from "lucide-react";
import heroImg from "@/assets/hero-service.jpg";
import envImg from "@/assets/project-environment.jpg";
import visionImg from "@/assets/project-vision.jpg";
import hungerImg from "@/assets/project-hunger.jpg";
import cancerImg from "@/assets/cause-cancer-infantil.jpg";
import diabetesImg from "@/assets/cause-diabetes.jpg";
import catastrofesImg from "@/assets/cause-catastrofes.jpg";
import humanitariosImg from "@/assets/cause-humanitarios.jpg";
import juventudeImg from "@/assets/cause-juventude.jpg";
import saudeMentalImg from "@/assets/cause-saude-mental.jpg";
import { useSiteContent } from "@/lib/content";
import { useLeaders } from "@/lib/leaders";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Distrito LC-11 — Lions Clubs International" },
      { name: "description", content: "Distrito LC-11: clubes Lions servindo nossas comunidades com projetos de visão, combate à fome, meio ambiente, diabetes e câncer infantil." },
      { property: "og:title", content: "Distrito LC-11 — Lions Clubs International" },
      { property: "og:description", content: "Nós Servimos. Conheça os clubes, projetos e eventos do Distrito LC-11." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

export const CAUSE_ICONS = {
  Heart, Droplet, LifeBuoy, Leaf, HandHeart, Utensils, Eye, Sparkles, Brain, Activity, Users, Calendar, Trophy,
} as const;
export type CauseIconKey = keyof typeof CAUSE_ICONS;

type CauseItem = { icon: CauseIconKey; title: string; desc: string; img?: string };

const DEFAULT_CAUSES: CauseItem[] = [
  { icon: "Heart", title: "Câncer infantil", desc: "Apoio a crianças com câncer e suas famílias, ampliando acesso a tratamento e qualidade de vida.", img: cancerImg },
  { icon: "Droplet", title: "Diabetes", desc: "Prevenção, conscientização e suporte a portadores de diabetes em nossas comunidades.", img: diabetesImg },
  { icon: "LifeBuoy", title: "Socorro após catástrofes", desc: "Resposta rápida a emergências, ajuda humanitária e reconstrução pós-desastres.", img: catastrofesImg },
  { icon: "Leaf", title: "Meio ambiente", desc: "Plantio de árvores, mutirões de limpeza e educação ambiental nas escolas.", img: envImg },
  { icon: "HandHeart", title: "Esforços humanitários", desc: "Ações de solidariedade que atendem necessidades urgentes de populações vulneráveis.", img: humanitariosImg },
  { icon: "Utensils", title: "Fome", desc: "Distribuição de alimentos e apoio a famílias em situação de vulnerabilidade.", img: hungerImg },
  { icon: "Eye", title: "Visão", desc: "Triagens oftalmológicas, doação de óculos e prevenção da cegueira evitável.", img: visionImg },
  { icon: "Sparkles", title: "Juventude", desc: "Programas que inspiram liderança e protagonismo em crianças e jovens.", img: juventudeImg },
  { icon: "Brain", title: "Saúde mental e Bem-estar", desc: "Iniciativas de acolhimento, prevenção e promoção da saúde mental.", img: saudeMentalImg },
];


function Index() {
  const hero = useSiteContent<{
    hero_eyebrow: string;
    hero_title: string;
    hero_description: string;
    hero_image_url: string;
    hero_images: string[];
    hero_image_links: string[];
    hero_rotation_seconds: number;
    stat1_value: string; stat1_label: string;
    stat2_value: string; stat2_label: string;
    stat3_value: string; stat3_label: string;
    stat4_value: string; stat4_label: string;
    mission_eyebrow: string; mission_title: string;
    mission_text1: string; mission_text2: string; mission_cta: string;
    mission_card1: string; mission_card2: string; mission_card3: string; mission_card4: string;
    causes_title: string; causes_eyebrow: string;
    causes: CauseItem[];
  }>("home", {
    hero_eyebrow: "Lions Clubs International · Distrito LC-11",
    hero_title: "Onde há uma necessidade, há um Leão.",
    hero_description:
      "Somos voluntários de mais de 40 clubes unidos por uma causa: servir nossa comunidade com integridade, compaixão e união. Junte-se a nós.",
    hero_image_url: "",
    hero_images: [],
    hero_image_links: [],
    hero_rotation_seconds: 5,
    stat1_value: "40+", stat1_label: "Clubes ativos",
    stat2_value: "2.400", stat2_label: "Leões servindo",
    stat3_value: "150k", stat3_label: "Vidas impactadas/ano",
    stat4_value: "100+", stat4_label: "Cidades atendidas",
    mission_eyebrow: "Nossa missão",
    mission_title: "Servir com propósito, transformar com compromisso.",
    mission_text1: "Há mais de 100 anos, os Leões do mundo todo agem onde é necessário. No Distrito LC-11, transformamos solidariedade em ação concreta — escola por escola, bairro por bairro, cidade por cidade.",
    mission_text2: "Atuamos nas causas globais do Lions Clubs International: câncer infantil, diabetes, socorro após catástrofes, meio ambiente, esforços humanitários, fome, visão, juventude e saúde mental e bem-estar.",
    mission_cta: "Saiba mais sobre o distrito",
    mission_card1: "40+ clubes",
    mission_card2: "9 causas",
    mission_card3: "300+ ações/ano",
    mission_card4: "100 anos de história",
    causes_eyebrow: "Causas",
    causes_title: "Onde estamos fazendo a diferença",
    causes: DEFAULT_CAUSES,
  });

  const causesList: CauseItem[] = (Array.isArray(hero.causes) && hero.causes.length > 0 ? hero.causes : DEFAULT_CAUSES)
    .map((c) => ({ ...c, icon: (CAUSE_ICONS[c.icon as CauseIconKey] ? c.icon : "Heart") as CauseIconKey }));


  const stats = [
    { value: hero.stat1_value, label: hero.stat1_label },
    { value: hero.stat2_value, label: hero.stat2_label },
    { value: hero.stat3_value, label: hero.stat3_label },
    { value: hero.stat4_value, label: hero.stat4_label },
  ];

  const { data: leaders = [] } = useLeaders("governador");
  const gov = leaders[0];

  const images = (Array.isArray(hero.hero_images) ? hero.hero_images : [])
    .filter((u) => typeof u === "string" && u.trim().length > 0)
    .slice(0, 10);
  const linksArr = Array.isArray(hero.hero_image_links) ? hero.hero_image_links : [];
  const slides = images.length > 0
    ? images.map((src, i) => ({ src, link: (linksArr[i] || "").trim() }))
    : [{ src: hero.hero_image_url || heroImg, link: "" }];

  const rotationMs = Math.max(1, Number(hero.hero_rotation_seconds) || 5) * 1000;

  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % slides.length), rotationMs);
    return () => clearInterval(id);
  }, [slides.length, rotationMs]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="relative mx-auto max-w-7xl px-4 pt-4 pb-16 sm:px-6 sm:pt-6 sm:pb-24 lg:px-8 lg:pt-8 lg:pb-28">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* LEFT: PIN + Message */}
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
              {/* Governor PIN image */}
              {gov?.pin_url && (
                <div className="w-full max-w-[220px] shrink-0 sm:max-w-[260px] 2xl:-translate-x-[4cm] 2xl:translate-y-[4cm]">
                  <img
                    src={gov.pin_url}
                    alt={`PIN do ${gov.name}`}
                    className="mx-auto max-h-56 w-auto rounded-xl shadow-elegant sm:max-h-72"
                  />
                </div>
              )}

              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                  {hero.hero_eyebrow}
                </p>
                <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl whitespace-pre-line">
                  {hero.hero_title}
                </h1>
                <p className="mt-6 text-lg leading-relaxed opacity-95 sm:text-xl whitespace-pre-line">
                  {hero.hero_description}
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    to="/clubes"
                    className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-base font-semibold text-gold-foreground shadow-elegant transition-transform hover:scale-105"
                  >
                    Encontre um clube <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/doar"
                    className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/10 px-6 py-3 text-base font-semibold text-primary-foreground backdrop-blur hover:bg-white/20"
                  >
                    Faça uma doação
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT: Dynamic banner carousel */}
            <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl bg-white shadow-elegant ring-1 ring-white/20 2xl:translate-x-[5cm]">
              {slides.map((slide, i) => {
                const img = (
                  <img
                    src={slide.src}
                    alt="Banner do Distrito LC-11"
                    width={1200}
                    height={900}
                    className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}
                  />
                );
                if (!slide.link) return <div key={slide.src + i}>{img}</div>;
                const isExternal = /^https?:\/\//i.test(slide.link);
                return (
                  <a
                    key={slide.src + i}
                    href={slide.link}
                    {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={`absolute inset-0 ${i === current ? "z-[1]" : "pointer-events-none"}`}
                  >
                    {img}
                  </a>
                );
              })}
              {slides.length > 1 && (
                <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Ir para imagem ${i + 1}`}
                      onClick={() => setCurrent(i)}
                      className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-gold" : "w-2 bg-white/60 hover:bg-white"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* STATS */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-4xl font-bold text-primary sm:text-5xl">{s.value}</div>
              <div className="mt-1 text-sm font-medium uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{hero.mission_eyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl whitespace-pre-line">
              {hero.mission_title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
              {hero.mission_text1}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
              {hero.mission_text2}
            </p>
            <Link to="/sobre" className="mt-6 inline-flex items-center gap-2 font-semibold text-primary hover:gap-3 transition-all">
              {hero.mission_cta || "Saiba mais sobre o distrito"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, label: hero.mission_card1 },
              { icon: Heart, label: hero.mission_card2 },
              { icon: Calendar, label: hero.mission_card3 },
              { icon: Trophy, label: hero.mission_card4 },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <item.icon className="h-8 w-8 text-primary" />
                <div className="mt-3 font-semibold text-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAUSES */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{hero.causes_eyebrow}</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
                {hero.causes_title}
              </h2>
            </div>
            <Link to="/projetos" className="inline-flex items-center gap-2 font-semibold text-primary hover:gap-3 transition-all">
              Todos os projetos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {causesList.map((c, i) => {
              const Icon = CAUSE_ICONS[c.icon] ?? Heart;
              return (
              <article key={c.title + i} className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-transform hover:-translate-y-1">
                {c.img ? (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={c.img}
                      alt={c.title}
                      width={1024}
                      height={768}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-accent/40">
                    <Icon className="h-16 w-16 text-primary" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground">{c.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
                </div>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-primary-deep px-8 py-14 text-primary-foreground sm:px-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                Pronto para servir? Torne-se um Leão.
              </h2>
              <p className="mt-4 max-w-xl text-lg opacity-90">
                Encontre o clube mais próximo de você e descubra como sua dedicação pode transformar
                vidas — começando pela sua.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/contato" className="inline-flex items-center rounded-md bg-gold px-6 py-3 font-semibold text-gold-foreground shadow-elegant hover:scale-105 transition-transform">
                Quero participar
              </Link>
              <Link to="/clubes" className="inline-flex items-center rounded-md border border-white/40 px-6 py-3 font-semibold hover:bg-white/10">
                Ver clubes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
