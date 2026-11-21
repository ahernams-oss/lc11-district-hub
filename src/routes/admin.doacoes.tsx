import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, RefreshCw, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { donationKindLabels, formatDonationMoney, isPaymentConfirmed, paymentStatusLabels } from "@/lib/donation-flow";
import { exportReportToExcel } from "@/lib/report-export";

export const Route = createFileRoute("/admin/doacoes")({
  head: () => ({ meta: [
    { title: "Doações e comprovantes — Administração LC-11" },
    { name: "description", content: "Acompanhamento administrativo das contribuições ao Distrito LC-11." },
    { property: "og:title", content: "Doações e comprovantes — Administração LC-11" },
    { property: "og:description", content: "Relatórios de contribuições, campanhas e comprovantes do Distrito LC-11." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: AdminDoacoes,
});

type Donation = {
  id: string; amount: number; currency: string; customer_name: string | null;
  customer_email: string | null; created_at: string; payment_status: string;
  status: string; kind: string; description: string | null; receipt_number: string;
  reference_label: string | null; stripe_session_id: string; environment: string;
};
const columns = "id,amount,currency,customer_name,customer_email,created_at,payment_status,status,kind,description,receipt_number,reference_label,stripe_session_id,environment";
const inputClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

function AdminDoacoes() {
  const { isAdmin, loading } = useAuth();
  const [environment, setEnvironment] = useState("live");
  const [status, setStatus] = useState("all");
  const [kind, setKind] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);
  const invalidDates = Boolean(from && to && from > to);
  const { data = [], isPending, isError, isFetching, refetch } = useQuery({
    queryKey: ["admin-donations", environment, status, kind, from, to],
    enabled: isAdmin && !invalidDates,
    queryFn: async () => {
      const rows: Donation[] = [];
      // Fetch every matching page so totals and exports never silently stop at 1,000 rows.
      for (let offset = 0; ; offset += 500) {
        let query = supabase.from("donations").select(columns).eq("environment", environment)
          .order("created_at", { ascending: false }).order("id").range(offset, offset + 499);
        if (status === "confirmed") query = query.in("payment_status", ["paid", "no_payment_required"]);
        if (status === "pending") query = query.eq("payment_status", "unpaid");
        if (kind !== "all") query = query.eq("kind", kind);
        if (from) query = query.gte("created_at", new Date(`${from}T00:00:00`).toISOString());
        if (to) {
          const nextDay = new Date(`${to}T00:00:00`);
          nextDay.setDate(nextDay.getDate() + 1);
          query = query.lt("created_at", nextDay.toISOString());
        }
        const { data: batch, error } = await query;
        if (error) throw error;
        rows.push(...(batch ?? []));
        if (!batch || batch.length < 500) break;
      }
      return rows;
    },
  });
  if (loading) return <p>Carregando…</p>;
  if (!isAdmin) return <p role="alert">Acesso restrito a administradores.</p>;

  const term = search.trim().toLocaleLowerCase("pt-BR");
  const filtered = data.filter((row) => [row.customer_name, row.customer_email, row.receipt_number, row.reference_label, row.description]
    .some((value) => value?.toLocaleLowerCase("pt-BR").includes(term)));
  const confirmed = filtered.filter((row) => isPaymentConfirmed(row.payment_status));
  const total = confirmed.filter((row) => row.currency.toUpperCase() === "BRL").reduce((sum, row) => sum + row.amount, 0);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 20));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * 20, currentPage * 20 + 20);

  async function exportExcel() {
    setExporting(true); setExportError(false);
    try {
      await exportReportToExcel({
        filename: `doacoes-${environment}-${new Date().toISOString().slice(0, 10)}`,
        title: "Doações — Distrito LC-11",
        subtitle: `${environment === "live" ? "Produção" : "Teste"} · ${from || "Início"} a ${to || "Hoje"} · ${filtered.length} contribuições`,
        columns: [
          { key: "date", label: "Data" }, { key: "donor", label: "Doador" }, { key: "email", label: "E-mail" },
          { key: "kind", label: "Tipo" }, { key: "campaign", label: "Campanha / descrição" },
          { key: "amount", label: "Valor" }, { key: "currency", label: "Moeda" },
          { key: "status", label: "Status" }, { key: "receipt", label: "Comprovante" }, { key: "session", label: "Referência Stripe" },
        ],
        rows: filtered.map((row) => ({ date: new Date(row.created_at).toLocaleString("pt-BR"),
          donor: row.customer_name ?? "", email: row.customer_email ?? "", kind: donationKindLabels[row.kind] ?? row.kind,
          campaign: row.reference_label ?? row.description ?? "", amount: row.amount / 100, currency: row.currency,
          status: paymentStatusLabels[row.payment_status] ?? row.payment_status, receipt: row.receipt_number, session: row.stripe_session_id,
        })),
      });
    } catch { setExportError(true); } finally { setExporting(false); }
  }

  return <div className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="font-display text-2xl font-bold">Doações & Comprovantes</h1><p className="mt-1 text-sm text-muted-foreground">Distrito LC-11 · {environment === "live" ? "Pagamentos reais" : "Ambiente de teste"}</p></div>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" aria-label="Atualizar doações" title="Atualizar doações" disabled={isFetching} onClick={() => void refetch()}><RefreshCw className={isFetching ? "animate-spin" : ""} /></Button>
        <Button variant="outline" onClick={() => void exportExcel()} disabled={!filtered.length || exporting || isFetching || invalidDates || isError}><Download /> {exporting ? "Exportando…" : "Excel"}</Button>
      </div>
    </header>
    <div className="grid gap-4 border-y border-border py-5 sm:grid-cols-3">
      <div><p className="text-xs text-muted-foreground">Total confirmado (BRL)</p><p className="mt-1 text-2xl font-bold">{formatDonationMoney(total)}</p></div>
      <div><p className="text-xs text-muted-foreground">Contribuições confirmadas</p><p className="mt-1 text-2xl font-bold">{confirmed.length}</p></div>
      <div><p className="text-xs text-muted-foreground">Aguardando pagamento</p><p className="mt-1 text-2xl font-bold">{filtered.filter((row) => row.payment_status === "unpaid").length}</p></div>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <label className="space-y-1 text-xs font-medium">Ambiente<select aria-label="Ambiente" className={inputClass} value={environment} onChange={(e) => { setEnvironment(e.target.value); setPage(0); }}><option value="live">Produção</option><option value="sandbox">Teste</option></select></label>
      <label className="space-y-1 text-xs font-medium">Status<select aria-label="Status" className={inputClass} value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}><option value="all">Todos</option><option value="confirmed">Confirmado</option><option value="pending">Pendente</option></select></label>
      <label className="space-y-1 text-xs font-medium">Tipo<select aria-label="Tipo" className={inputClass} value={kind} onChange={(e) => { setKind(e.target.value); setPage(0); }}><option value="all">Todos</option>{Object.entries(donationKindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="space-y-1 text-xs font-medium">De<input aria-label="Data inicial" type="date" className={inputClass} value={from} onChange={(e) => { setFrom(e.target.value); setPage(0); }} /></label>
      <label className="space-y-1 text-xs font-medium">Até<input aria-label="Data final" type="date" className={inputClass} value={to} onChange={(e) => { setTo(e.target.value); setPage(0); }} /></label>
      <label className="space-y-1 text-xs font-medium">Buscar<div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input aria-label="Buscar doações" placeholder="Doador, e-mail ou comprovante" className={`${inputClass} pl-9`} value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} /></div></label>
    </div>
    {invalidDates && <p role="alert" className="text-sm text-destructive">A data final deve ser igual ou posterior à inicial.</p>}
    {exportError && <p role="alert" className="text-sm text-destructive">Não foi possível exportar. Tente novamente.</p>}
    {isError ? <p role="alert" className="text-destructive">Não foi possível consultar as doações. Atualize para tentar novamente.</p> : isPending ? <p role="status">Carregando doações…</p> : !visible.length ? <p className="border-y py-10 text-center text-muted-foreground">Nenhuma contribuição encontrada neste período.</p> : <div className="overflow-x-auto">
      <table className="w-full text-left text-sm"><thead className="border-b text-xs text-muted-foreground"><tr>{["Data", "Doador", "Contribuição", "Valor", "Status", "Comprovante"].map((label) => <th className="px-3 py-3 font-medium" key={label}>{label}</th>)}</tr></thead>
        <tbody>{visible.map((row) => <tr key={row.id} className="border-b align-top hover:bg-muted/50">
          <td className="whitespace-nowrap px-3 py-4">{new Date(row.created_at).toLocaleDateString("pt-BR")}<span className="block text-xs text-muted-foreground">{new Date(row.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></td>
          <td className="max-w-56 break-words px-3 py-4">{row.customer_name ?? "Não informado"}<span className="block break-all text-xs text-muted-foreground">{row.customer_email ?? "—"}</span></td>
          <td className="min-w-36 max-w-64 break-words px-3 py-4">{row.reference_label ?? row.description ?? "Doação"}<span className="block text-xs text-muted-foreground">{donationKindLabels[row.kind] ?? row.kind}</span></td>
          <td className="whitespace-nowrap px-3 py-4 font-semibold">{formatDonationMoney(row.amount, row.currency)}</td>
          <td className="px-3 py-4"><span className={isPaymentConfirmed(row.payment_status) ? "text-primary" : "text-muted-foreground"}>{row.status === "expired" ? "Expirado" : paymentStatusLabels[row.payment_status] ?? row.payment_status}</span></td>
          <td className="px-3 py-4 font-mono text-xs">{row.receipt_number}</td>
        </tr>)}</tbody></table>
    </div>}
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"><span>{filtered.length} contribuições · Página {currentPage + 1} de {pageCount}</span><div className="flex gap-2"><Button variant="outline" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Anterior</Button><Button variant="outline" disabled={currentPage + 1 >= pageCount} onClick={() => setPage(currentPage + 1)}>Próxima</Button></div></div>
  </div>;
}