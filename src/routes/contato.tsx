import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { useSiteContent } from "@/lib/content";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Distrito LC-11" },
      { name: "description", content: "Entre em contato com o Distrito LC-11. Tire dúvidas, conheça nossos clubes ou descubra como se tornar um Leão." },
      { property: "og:title", content: "Contato — Distrito LC-11" },
      { property: "og:description", content: "Fale com o Distrito LC-11." },
      { property: "og:url", content: "/contato" },
    ],
    links: [{ rel: "canonical", href: "/contato" }],
  }),
  component: Contato,
});

const DEFAULTS = {
  eyebrow: "Fale conosco",
  title: "Estamos prontos para receber você.",
  description: "Tire dúvidas, conheça melhor o trabalho dos Leões ou descubra como participar.",
  email: "contato@distritolc11.org",
  phone: "(00) 0000-0000",
  address: "Endereço da sede — Cidade, Estado",
  form_title: "Envie sua mensagem",
  success_message: "Em breve um membro do distrito entrará em contato.",
};

function Contato() {
  const [sent, setSent] = useState(false);
  const c = useSiteContent("contato", DEFAULTS);

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} description={c.description} />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <Mail className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold text-foreground">E-mail</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.email}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <Phone className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold text-foreground">Telefone</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.phone}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <MapPin className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold text-foreground">Sede do Distrito</h3>
              <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{c.address}</p>
            </div>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="rounded-2xl border border-border bg-card p-8 shadow-card"
          >
            {sent ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold">Mensagem enviada!</h3>
                <p className="mt-2 text-muted-foreground">{c.success_message}</p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold text-foreground">{c.form_title}</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Nome completo" name="nome" required />
                  <Field label="E-mail" name="email" type="email" required />
                  <Field label="Cidade" name="cidade" />
                  <Field label="Assunto" name="assunto" required />
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-foreground">Mensagem</label>
                  <textarea
                    name="mensagem"
                    required
                    rows={5}
                    className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.01] sm:w-auto"
                >
                  <Send className="h-4 w-4" /> Enviar mensagem
                </button>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-foreground">{label}{required && " *"}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
      />
    </div>
  );
}
