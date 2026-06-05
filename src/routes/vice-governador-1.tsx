import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/vice-governador-1")({
  head: () => ({
    meta: [
      { title: "1º Vice-Governador — Distrito LC-11" },
      { name: "description", content: "Conheça o 1º Vice-Governador do Distrito LC-11." },
    ],
    links: [{ rel: "canonical", href: "/vice-governador-1" }],
  }),
  component: ViceGovernador1,
});

function ViceGovernador1() {
  return (
    <>
      <PageHero
        eyebrow="Liderança 2025–2026"
        title="1º Vice-Governador do Distrito LC-11"
        description="Apoiando o Governador e preparando o próximo ano leonístico."
      />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-surface p-6">
          <p className="font-semibold text-foreground">CL Nome do 1º Vice-Governador</p>
          <p className="mt-1 text-muted-foreground">1º Vice-Governador do Distrito LC-11</p>
          <div className="mt-4 space-y-2 text-muted-foreground">
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />1vice@distritolc11.org</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />(00) 00000-0000</p>
          </div>
        </div>
        <div className="prose prose-lg mt-8 max-w-none text-foreground">
          <h2 className="font-display text-2xl font-bold">Trajetória</h2>
          <p className="text-muted-foreground">
            Companheiro Leão com ampla experiência no movimento leonístico, atua diretamente
            no apoio às ações distritais e no planejamento estratégico do próximo ano.
          </p>
        </div>
      </section>
    </>
  );
}
