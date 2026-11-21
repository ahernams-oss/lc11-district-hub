export function donationAmountInCents(value: string): number {
  const normalized = value.trim().replace(/\s/g, "");
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(normalized)) return 0;
  const cents = Math.round(Number(normalized.replace(",", ".")) * 100);
  return Number.isSafeInteger(cents) ? cents : 0;
}

export function isValidDonationAmount(cents: number): boolean {
  return Number.isSafeInteger(cents) && cents >= 500;
}

export function isPaymentConfirmed(status: string): boolean {
  return status === "paid" || status === "no_payment_required";
}

export const paymentStatusLabels: Record<string, string> = {
  paid: "Confirmado", unpaid: "Pendente", no_payment_required: "Confirmado",
};

export const donationKindLabels: Record<string, string> = {
  doacao_unica: "Doação única", campanha: "Campanha", apoio_mensal: "Apoio mensal", inscricao_evento: "Inscrição em evento",
};

export function formatDonationMoney(cents: number, currency = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(cents / 100);
}