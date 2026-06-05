import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Mail, Phone, Quote } from "lucide-react";
import govImg from "@/assets/governador.jpg";

export const Route = createFileRoute("/governador")({
  head: () => ({
    meta: [
      { title: "Governador do Distrito — Distrito LC-11" },
      { name: "description", content: "Conheça o Governador do Distrito LC-11 e sua mensagem para os companheiros Leões." },
      { property: "og:title", content: "Governador — Distrito LC-11" },
      { property: "og:description", content: "Mensagem e biografia do Governador do Distrito LC-11." },
      { property: "og:url", content: "/governador" },
      { property: "og:image", content: "/src/assets/governador.jpg" },
    ],
    links: [{ rel: "canonical", href: "/governador" }],
  }),
  component: Governador,
});

function Governador() {
  return (
    <>
      <PageHero
        eyebrow="Liderança 2025–2026"
        title="Companheiro Governador do Distrito LC-11"
        description="Liderando com servir, inspirando com exemplo."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-start">
          <div className="mx-auto w-full max-w-sm">
            <div className="overflow-hidden rounded-2xl border border-border shadow-elegant">
              <img
                src={govImg}
                alt="Governador do Distrito LC-11"
                width={800}
                height={1024}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-6 rounded-xl bg-surface p-5 text-sm">
              <p className="font-semibold text-foreground">CL Nome do Governador</p>
              <p className="mt-1 text-muted-foreground">Governador do Distrito LC-11</p>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> governador@distritolc11.org</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> (00) 00000-0000</p>
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-xl bg-primary p-6 text-primary-foreground shadow-card">
              <Quote className="h-8 w-8 text-gold" />
              <p className="mt-3 font-display text-xl italic leading-relaxed sm:text-2xl">
                "Servir é o aluguel que pagamos pelo espaço que ocupamos. Que neste ano possamos
                pagar esse aluguel com generosidade, união e propósito."
              </p>
            </div>

            <div className="prose prose-lg mt-10 max-w-none text-foreground">
              <h2 className="font-display text-2xl font-bold">Mensagem</h2>
              <p className="text-muted-foreground">
                Companheiros e companheiras Leões, é com profunda honra que assumo a Governadoria
                do Distrito LC-11 neste ano leonístico. Recebemos um distrito forte, ativo e cheio
                de potencial — e nosso compromisso é ampliar o impacto das nossas ações nas
                comunidades que servimos.
              </p>
              <p className="text-muted-foreground">
                Vamos priorizar o fortalecimento dos quadros associativos, a formação de novos
                líderes e a execução de projetos de alto impacto nas cinco causas globais do Lions.
                Conto com cada um de vocês.
              </p>

              <h2 className="mt-8 font-display text-2xl font-bold">Trajetória</h2>
              <p className="text-muted-foreground">
                Membro do Lions há mais de 20 anos, ocupou posições de Presidente de Clube,
                Presidente de Divisão, Vice-Governador e participou ativamente de comissões
                distritais e múltiplas. Profissional reconhecido na sua área de atuação, leva ao
                distrito uma combinação de visão estratégica e compromisso humano.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-foreground">Gabinete Distrital</h2>
          <p className="mt-2 text-muted-foreground">Conheça a equipe que apoia a governadoria neste período.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "1º Vice-Governador", role: "CL Fulano de Tal" },
              { name: "2º Vice-Governador", role: "CL Beltrano de Tal" },
              { name: "Secretário Distrital", role: "CL Ciclano de Tal" },
              { name: "Tesoureiro Distrital", role: "CL Sicrano de Tal" },
            ].map((p) => (
              <div key={p.name} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">{p.name}</div>
                <div className="mt-2 font-semibold text-foreground">{p.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
