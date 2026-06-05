import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/vice-governador-2")({
  head: () => ({
    meta: [
      { title: "2º Vice-Governador — Distrito LC-11" },
      { name: "description", content: "Conheça o 2º Vice-Governador do Distrito LC-11." },
    ],
    links: [{ rel: "canonical", href: "/vice-governador-2" }],
  }),
  component: ViceGovernador2,
});

function ViceGovernador2() {
  return (
    <>
      <PageHero
        eyebrow="Liderança 2025–2026"
        title="2º Vice-Governador do Distrito LC-11"
        description="Contribuindo com a liderança distrital e a formação de novos Leões."
      />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-surface p-6">
          <p className="font-semibold text-foreground">CL Nome do 2º Vice-Governador</p>
          <p className="mt-1 text-muted-foreground">2º Vice-Governador do Distrito LC-11</p>
          <div className="mt-4 space-y-2 text-muted-foreground">
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />2vice@distritolc11.org</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />(00) 00000-0000</p>
          </div>
        </div>
        <div className="prose prose-lg mt-8 max-w-none text-foreground">
          <h2 className="font-display text-2xl font-bold">Trajetória</h2>
          <p className="text-muted-foreground">
            Líder dedicado às causas globais do Lions, com atuação destacada em projetos
            de impacto comunitário e formação de quadros associativos.
          </p>
        </div>
      </section>
    </>
  );
}
