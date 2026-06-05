import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Eye, Leaf, Users, Calendar, Trophy } from "lucide-react";
import heroImg from "@/assets/hero-service.jpg";
import envImg from "@/assets/project-environment.jpg";
import visionImg from "@/assets/project-vision.jpg";
import hungerImg from "@/assets/project-hunger.jpg";

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

const causes = [
  { icon: Eye, title: "Visão", desc: "Triagens oftalmológicas, doação de óculos e prevenção da cegueira evitável.", img: visionImg },
  { icon: Heart, title: "Combate à Fome", desc: "Distribuição de alimentos e apoio a famílias em situação de vulnerabilidade.", img: hungerImg },
  { icon: Leaf, title: "Meio Ambiente", desc: "Plantio de árvores, mutirões de limpeza e educação ambiental nas escolas.", img: envImg },
];

const stats = [
  { value: "65+", label: "Clubes ativos" },
  { value: "2.400", label: "Leões servindo" },
  { value: "150k", label: "Vidas impactadas/ano" },
  { value: "100+", label: "Cidades atendidas" },
];

function Index() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Voluntários do Lions Clubs servindo a comunidade"
            width={1920}
            height={1080}
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Lions Clubs International · Distrito LC-11
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight sm:text-6xl lg:text-7xl">
            Onde há uma necessidade, há um <span className="text-gold">Leão</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed opacity-95 sm:text-xl">
            Somos voluntários de mais de 65 clubes unidos por uma causa: servir nossa comunidade
            com integridade, compaixão e união. Junte-se a nós.
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Nossa missão</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Servir com propósito, transformar com compromisso.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Há mais de 100 anos, os Leões do mundo todo agem onde é necessário. No Distrito LC-11,
              transformamos solidariedade em ação concreta — escola por escola, bairro por bairro,
              cidade por cidade.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Atuamos nas cinco causas globais do Lions Clubs International: <strong className="text-foreground">visão,
              fome, meio ambiente, câncer infantil e diabetes</strong>.
            </p>
            <Link to="/sobre" className="mt-6 inline-flex items-center gap-2 font-semibold text-primary hover:gap-3 transition-all">
              Saiba mais sobre o distrito <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, label: "65+ clubes" },
              { icon: Heart, label: "5 causas" },
              { icon: Calendar, label: "300+ ações/ano" },
              { icon: Trophy, label: "100 anos de história" },
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Causas</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
                Onde estamos fazendo a diferença
              </h2>
            </div>
            <Link to="/projetos" className="inline-flex items-center gap-2 font-semibold text-primary hover:gap-3 transition-all">
              Todos os projetos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {causes.map((c) => (
              <article key={c.title} className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-transform hover:-translate-y-1">
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
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-primary">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground">{c.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
                </div>
              </article>
            ))}
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
