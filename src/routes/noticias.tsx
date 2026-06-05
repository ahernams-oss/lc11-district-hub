import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/noticias")({
  head: () => ({
    meta: [
      { title: "Notícias — Distrito LC-11" },
      { name: "description", content: "Últimas notícias e comunicados do Distrito LC-11." },
      { property: "og:title", content: "Notícias — Distrito LC-11" },
      { property: "og:description", content: "Acompanhe as últimas notícias do distrito." },
      { property: "og:url", content: "/noticias" },
    ],
    links: [{ rel: "canonical", href: "/noticias" }],
  }),
  component: Noticias,
});

const posts = [
  { data: "20 Maio 2026", tag: "Distrito", titulo: "Convenção Distrital reúne mais de 800 Leões", resumo: "Encontro anual fortaleceu laços e celebrou os melhores projetos do ano leonístico." },
  { data: "05 Maio 2026", tag: "Visão", titulo: "Mutirão atende 1.200 crianças em escolas públicas", resumo: "Triagem oftalmológica resultou em 380 encaminhamentos médicos e 220 óculos doados." },
  { data: "18 Abril 2026", tag: "Meio Ambiente", titulo: "Plantio coletivo recupera área de mata ciliar", resumo: "Voluntários de 8 clubes plantaram 1.500 mudas nativas em um único final de semana." },
  { data: "02 Abril 2026", tag: "LCIF", titulo: "Distrito atinge meta de doação à Fundação LCIF", resumo: "Recursos ampliam projetos globais nas cinco causas humanitárias do Lions." },
  { data: "15 Março 2026", tag: "Juventude", titulo: "LEO Clubes do distrito ganham novos quadros", resumo: "Mais de 60 jovens passaram a integrar o movimento leonístico jovem." },
  { data: "28 Fevereiro 2026", tag: "Combate à Fome", titulo: "Campanha arrecada 12 toneladas de alimentos", resumo: "Mobilização envolveu 30 clubes em ação coordenada no fim de semana." },
];

function Noticias() {
  return (
    <>
      <PageHero
        eyebrow="Notícias"
        title="Acompanhe o que acontece no Distrito."
        description="Histórias, conquistas e comunicados oficiais do Distrito LC-11."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <article key={p.titulo} className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="rounded-full bg-accent px-3 py-1 font-semibold uppercase tracking-wider text-primary">{p.tag}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.data}</span>
              </div>
              <h2 className="mt-4 font-display text-xl font-bold leading-snug text-foreground group-hover:text-primary">
                {p.titulo}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.resumo}</p>
              <a href="#" className="mt-5 text-sm font-semibold text-primary">Ler mais →</a>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
