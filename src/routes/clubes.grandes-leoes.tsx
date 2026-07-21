import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { useLeaders } from "@/lib/leaders";
import { Award, Sparkles, Shield, Heart, Landmark, Compass, UserCheck } from "lucide-react";

export const Route = createFileRoute("/clubes/grandes-leoes")({
  head: () => ({
    meta: [
      { title: "Grandes Leões — Distrito LC-11" },
      { name: "description", content: "Conheça as figuras inspiradoras e a história dos Grandes Leões do Lions Clubs International e do Distrito LC-11." },
      { property: "og:title", content: "Grandes Leões — Distrito LC-11" },
      { property: "og:description", content: "Conheça os Grandes Leões, fundadores e leões de destaque que inspiram nossa jornada de serviço." },
      { property: "og:url", content: "/clubes/grandes-leoes" },
    ],
    links: [{ rel: "canonical", href: "/clubes/grandes-leoes" }],
  }),
  component: GrandesLeoes,
});

interface FigureDisplay {
  name: string;
  role: string;
  desc: string;
  badge: string;
  photo_url?: string | null;
  gradient?: string;
  iconColor?: string;
  icon?: any;
}

const staticFigures: FigureDisplay[] = [
  {
    icon: Compass,
    badge: "Fundador",
    name: "Melvin Jones",
    role: "Fundador do Lions Clubs International (1879–1961)",
    desc: "Um empresário de Chicago que desafiou os membros de clubes locais a direcionarem seus talentos para a melhoria de suas comunidades. Fundou o Lions em 1917, estabelecendo a premissa eterna: 'Você não pode ir muito longe a menos que comece a fazer algo por outra pessoa'.",
    gradient: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
    iconColor: "text-blue-500",
  },
  {
    icon: Sparkles,
    badge: "Inspiradora",
    name: "Helen Keller",
    role: "Defensora das Pessoas com Deficiência (1880–1968)",
    desc: "Em 1925, na Convenção Internacional do Lions, ela desafiou os Leões a se tornarem os 'Cavaleiros dos Cegos na cruzada contra a escuridão'. Seu apelo transformou a preservação da visão e o apoio aos deficientes visuais na principal causa global do Lions.",
    gradient: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
    iconColor: "text-amber-500",
  },
  {
    icon: Shield,
    badge: "Reconhecimento Máximo",
    name: "Companheiro de Melvin Jones",
    role: "Reconhecimento de Serviço Humanitário (MJF)",
    desc: "Criado em 1973, este título é o maior reconhecimento da Fundação de Lions Clubs International (LCIF). Ele honra indivíduos que demonstram profundo compromisso com o serviço humanitário e dedicação em ajudar o próximo.",
    gradient: "from-yellow-500/20 to-gold/20 border-gold/30",
    iconColor: "text-gold",
  },
  {
    icon: UserCheck,
    badge: "Liderança Regional",
    name: "Leões de Destaque no Distrito LC-11",
    role: "Voluntários e Governadores que Marcaram Época",
    desc: "Homenageamos os companheiros Leões dos estados do Espírito Santo e Rio de Janeiro que, através de liderança exemplar e horas incansáveis de serviço comunitário, mantêm viva a chama do leonismo em nosso território.",
    gradient: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
    iconColor: "text-emerald-500",
  },
];

const pillars = [
  {
    icon: Heart,
    title: "Serviço Incondicional",
    desc: "O verdadeiro 'Grande Leão' coloca as necessidades da comunidade acima de si mesmo, liderando projetos que geram impacto real e duradouro.",
  },
  {
    icon: Award,
    title: "Companheirismo e Ética",
    desc: "Fomentar a harmonia entre os associados e agir estritamente de acordo com o Código de Ética do Leão em todas as esferas da vida.",
  },
  {
    icon: Landmark,
    title: "Legado e Continuidade",
    desc: "Inspirar e orientar as novas gerações (LEOs e novos associados) para que a missão de servir continue viva e forte.",
  },
];

function GrandesLeoes() {
  const { data: dbLeaders = [], isLoading } = useLeaders("grande_leao");

  const displayFigures: FigureDisplay[] = dbLeaders.length > 0
    ? dbLeaders.map((l) => ({
        name: l.name,
        role: l.role ?? "Grande Leão",
        desc: l.bio ?? "",
        badge: l.year_label ?? "Grande Leão",
        photo_url: l.photo_url,
        gradient: "from-primary/10 to-gold/10 border-primary/20",
        iconColor: "text-primary",
        icon: Award,
      }))
    : staticFigures;

  return (
    <>
      <PageHero
        eyebrow="História & Reconhecimento"
        title="Grandes Leões da Nossa História"
        description="Conheça os grandes nomes, as inspirações históricas e os títulos de reconhecimento que sustentam a maior organização de serviço humanitário do mundo."
      />

      {/* Seção das Figuras Inspiradoras */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Inspirando Gerações</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Quem nos inspira a servir?
          </h2>
          <p className="mt-4 text-muted-foreground">
            A grandiosidade do Leonismo é construída sobre o exemplo de pessoas extraordinárias que moldaram nossa visão global de compaixão e solidariedade.
          </p>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Carregando...</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {displayFigures.map((fig) => {
              const Icon = fig.icon || Award;
              return (
                <div
                  key={fig.name}
                  className={`flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-card transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 bg-gradient-to-br ${fig.gradient}`}
                >
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {fig.photo_url ? (
                      <img
                        src={fig.photo_url}
                        alt={fig.name}
                        className="h-28 w-28 shrink-0 rounded-full object-cover ring-4 ring-primary/20 shadow-md self-center sm:self-start"
                      />
                    ) : (
                      <div className="rounded-full bg-background p-4 h-16 w-16 flex items-center justify-center shadow-sm shrink-0 self-center sm:self-start">
                        <Icon className={`h-8 w-8 ${fig.iconColor}`} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-primary shadow-sm inline-block">
                        {fig.badge}
                      </span>
                      <h3 className="mt-3 font-display text-2xl font-bold text-foreground truncate-2-lines">{fig.name}</h3>
                      <p className="mt-1 text-sm font-semibold text-primary">{fig.role}</p>
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{fig.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Seção dos Pilares */}
      <section className="bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">O Espírito Leonístico</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Pilares de um Grande Leão
            </h2>
            <p className="mt-4 text-muted-foreground">
              Mais do que um título, ser um Leão de destaque é adotar um estilo de vida focado na empatia, no companheirismo e no desenvolvimento social.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="rounded-xl border border-border bg-card p-6 shadow-card flex flex-col items-center text-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-foreground">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Chamada para Ação */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-deep p-8 md:p-12 text-primary-foreground shadow-elegant relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" aria-hidden>
            <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-gold blur-2xl" />
            <div className="absolute right-10 bottom-0 h-40 w-40 rounded-full bg-white blur-2xl" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Quer fazer parte desta história?</h2>
            <p className="mt-4 text-sm md:text-base opacity-95">
              O Distrito LC-11 está sempre de braços abertos para novos voluntários que queiram colocar o lema "Nós Servimos" em prática. Encontre um clube próximo a você e comece hoje mesmo.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/clubes"
                className="inline-flex items-center justify-center rounded-md bg-gold px-5 py-3 text-sm font-bold text-gold-foreground transition-all hover:scale-105 hover:shadow-lg"
              >
                Encontrar um Clube
              </a>
              <a
                href="/sobre"
                className="inline-flex items-center justify-center rounded-md border border-primary-foreground/35 px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-white/10 transition-colors"
              >
                Conhecer o Distrito
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
