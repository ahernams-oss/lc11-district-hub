import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Mail, Phone } from "lucide-react";
import { useLeaders } from "@/lib/leaders";

export const Route = createFileRoute("/tesoureiro")({
  head: () => ({
    meta: [
      { title: "Tesoureiro Distrital — Distrito LC-11" },
      { name: "description", content: "Tesoureiro Distrital do Distrito LC-11." },
    ],
    links: [{ rel: "canonical", href: "/tesoureiro" }],
  }),
  component: Tesoureiro,
});

function Tesoureiro() {
  const { data: members = [], isLoading } = useLeaders("tesoureiro");

  return (
    <>
      <PageHero
        eyebrow="Liderança ano Lionistico 2026–2027"
        title="Tesoureiro Distrital"
        description="Gestão financeira e tesouraria do Distrito LC-11."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none text-foreground">
          <h2 className="font-display text-2xl font-bold">Tesoureiro Distrital</h2>
          <p className="text-muted-foreground">
            O Tesoureiro Distrital administra os recursos financeiros do Distrito LC-11, zelando pela arrecadação, controle de despesas, prestação de contas e planejamento orçamentário em conformidade com as normas do Lions Clubs International.
          </p>
        </div>

        <h3 className="mt-12 font-display text-xl font-bold">Membros</h3>
        {isLoading ? (
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        ) : members.length === 0 ? (
          <p className="mt-4 text-muted-foreground">Em breve.</p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <div key={m.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
                {m.photo_url && (
                  <img src={m.photo_url} alt={m.name} className="mb-4 h-32 w-32 rounded-full object-cover" />
                )}
                <p className="font-semibold text-foreground">{m.name}</p>
                {m.role && <p className="mt-1 text-sm text-muted-foreground">{m.role}</p>}
                {m.bio && <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">{m.bio}</p>}
                <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                  {m.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{m.email}</p>}
                  {m.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{m.phone}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
