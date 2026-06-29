import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/PageHero";
import { CheckCircle, XCircle, Download, Loader2 } from "lucide-react";
import { getDonationReceipt, type DonationReceipt } from "@/utils/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import jsPDF from "jspdf";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({
    meta: [{ title: "Recibo de Doação — Distrito LC-11" }],
  }),
  component: CheckoutReturn,
});

function formatCurrency(amountCents: number, currency: string) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(amountCents / 100);
  } catch {
    return `${currency} ${(amountCents / 100).toFixed(2)}`;
  }
}

function formatDate(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toLocaleString("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function downloadReceiptPdf(receipt: DonationReceipt) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = 64;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Recibo de Doação", margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(120);
  doc.text("Distrito LC-11 — Lions Clubs International", margin, (y += 18));
  doc.setTextColor(0);

  y += 24;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 28;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Detalhes da doação", margin, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const rows: Array<[string, string]> = [
    ["Nº do recibo", receipt.receiptNumber],
    ["Data", formatDate(receipt.createdAt)],
    ["Descrição", receipt.description],
    ["Valor", formatCurrency(receipt.amount, receipt.currency)],
    ["Status do pagamento", receipt.paymentStatus === "paid" ? "Pago" : receipt.paymentStatus],
    ["Doador", receipt.customerName ?? "—"],
    ["E-mail", receipt.customerEmail ?? "—"],
    ["ID da sessão", receipt.sessionId],
    ...(receipt.paymentIntentId ? [["ID do pagamento", receipt.paymentIntentId] as [string, string]] : []),
  ];

  rows.forEach(([label, value]) => {
    doc.setTextColor(120);
    doc.text(label, margin, y);
    doc.setTextColor(0);
    const wrapped = doc.splitTextToSize(value, pageWidth - margin * 2 - 160);
    doc.text(wrapped, margin + 160, y);
    y += 18 * (Array.isArray(wrapped) ? wrapped.length : 1);
  });

  y += 16;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  doc.setFontSize(10);
  doc.setTextColor(90);
  const note = doc.splitTextToSize(
    "Agradecemos sua contribuição. Este recibo comprova a doação realizada via processamento seguro Stripe. " +
      "Em caso de dúvidas, entre em contato com a tesouraria distrital.",
    pageWidth - margin * 2,
  );
  doc.text(note, margin, y);

  doc.save(`recibo-doacao-${receipt.receiptNumber}.pdf`);
}

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["donation-receipt", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const result = await getDonationReceipt({
        data: { sessionId, environment: getStripeEnvironment() },
      });
      if ("error" in result) throw new Error(result.error);
      return result.receipt;
    },
    enabled: !!sessionId,
    retry: 1,
  });

  if (!sessionId) {
    return (
      <>
        <PageHero eyebrow="Doação" title="Status da doação" description="Não foi possível confirmar o status da sua doação." />
        <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center space-y-6">
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
          <p className="text-muted-foreground">
            Se você acabou de fazer uma doação, entre em contato com a tesouraria distrital para confirmar.
          </p>
          <Link to="/doar" className="inline-block rounded-lg bg-gold px-6 py-3 font-display font-bold text-gold-foreground shadow-card transition-transform hover:scale-[1.02]">
            Tentar novamente
          </Link>
        </section>
      </>
    );
  }

  const paid = data?.paymentStatus === "paid";

  return (
    <>
      <PageHero
        eyebrow="Doação"
        title={paid ? "Obrigado pela sua contribuição!" : "Processando sua doação..."}
        description={paid
          ? "Sua doação foi confirmada com sucesso. Abaixo está o seu recibo."
          : "Estamos confirmando o pagamento junto ao Stripe."}
      />

      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        {isLoading && (
          <div className="text-center space-y-4">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Carregando recibo...</p>
          </div>
        )}

        {isError && (
          <div className="text-center space-y-4">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <p className="text-muted-foreground">Não foi possível carregar o recibo. Tente recarregar a página.</p>
          </div>
        )}

        {data && (
          <div className="space-y-8">
            <div className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
              <div className="flex items-start justify-between border-b pb-4 mb-4">
                <div>
                  <h2 className="font-display text-xl font-bold">Recibo de Doação</h2>
                  <p className="text-sm text-muted-foreground">Distrito LC-11</p>
                </div>
                <div className="text-right text-sm">
                  <div className="text-muted-foreground">Nº</div>
                  <div className="font-mono font-semibold">{data.receiptNumber}</div>
                </div>
              </div>

              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <Field label="Data" value={formatDate(data.createdAt)} />
                <Field label="Status" value={paid ? "Pago" : data.paymentStatus} />
                <Field label="Descrição" value={data.description} />
                <Field label="Valor" value={formatCurrency(data.amount, data.currency)} highlight />
                <Field label="Doador" value={data.customerName ?? "—"} />
                <Field label="E-mail" value={data.customerEmail ?? "—"} />
              </dl>

              <div className="mt-6 border-t pt-4 text-xs text-muted-foreground break-all">
                ID da sessão: {data.sessionId}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => downloadReceiptPdf(data)}
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-display font-bold text-gold-foreground shadow-card transition-transform hover:scale-[1.02]"
              >
                <Download className="h-4 w-4" />
                Baixar recibo em PDF
              </button>
              <Link
                to="/"
                className="inline-block rounded-lg border px-6 py-3 font-display font-semibold transition-colors hover:bg-muted"
              >
                Voltar ao início
              </Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={highlight ? "text-lg font-display font-bold text-foreground" : "font-medium text-foreground"}>
        {value}
      </dd>
    </div>
  );
}
