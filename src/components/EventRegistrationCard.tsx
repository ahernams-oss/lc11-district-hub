import { useState } from "react";
import { Ticket } from "lucide-react";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";

interface Props {
  eventId: string;
  eventTitle: string;
  valorCents: number;
  encerrado: boolean;
}

const brl = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export function EventRegistrationCard({ eventId, eventTitle, valorCents, encerrado }: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [clube, setClube] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [aberto, setAberto] = useState(false);

  if (encerrado) return null;

  return (
    <section className="rounded-xl border border-gold/50 bg-primary p-6 text-primary-foreground shadow-elegant">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold">
        <Ticket className="h-5 w-5 text-gold" /> Inscrição no evento
      </h2>

      {!aberto ? (
        <>
          <p className="mt-2 text-sm opacity-90">
            Valor por participante: <strong>{brl(valorCents)}</strong>
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome completo"
              className="rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/60 focus:border-gold"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/60 focus:border-gold"
            />
            <input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="Telefone / WhatsApp"
              className="rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/60 focus:border-gold"
            />
            <input
              value={clube}
              onChange={(e) => setClube(e.target.value)}
              placeholder="Clube"
              className="rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/60 focus:border-gold"
            />
            <label className="text-sm">
              <span className="text-xs uppercase tracking-wider opacity-80">Participantes</span>
              <input
                type="number"
                min={1}
                max={20}
                value={quantidade}
                onChange={(e) => setQuantidade(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                className="mt-1 w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 outline-none focus:border-gold"
              />
            </label>
          </div>

          <button
            onClick={() => setAberto(true)}
            disabled={!nome || !email}
            className="mt-5 w-full rounded-lg bg-gold py-3 font-display text-base font-bold text-gold-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Inscrever-se — {brl(valorCents * quantidade)}
          </button>
        </>
      ) : (
        <>
          <div className="mt-4">
            <StripeEmbeddedCheckout
              tipo="inscricao_evento"
              eventId={eventId}
              quantidade={quantidade}
              nome={nome}
              clube={clube}
              telefone={telefone}
              customerEmail={email}
            />
          </div>
          <button onClick={() => setAberto(false)} className="mt-4 text-sm underline opacity-80">
            Voltar
          </button>
          <p className="sr-only">{eventTitle}</p>
        </>
      )}
    </section>
  );
}
