import { useState } from "react";
import { FileDown, FileSpreadsheet } from "lucide-react";
import {
  exportReportToExcel,
  exportReportToPdf,
  type ReportSpec,
} from "@/lib/report-export";

type Props = {
  getSpec: () => ReportSpec;
  disabled?: boolean;
};

export function ExportButtons({ getSpec, disabled }: Props) {
  const [busy, setBusy] = useState<"pdf" | "xlsx" | null>(null);

  async function run(kind: "pdf" | "xlsx") {
    setBusy(kind);
    try {
      const spec = getSpec();
      if (kind === "pdf") await exportReportToPdf(spec);
      else await exportReportToExcel(spec);
    } finally {
      setBusy(null);
    }
  }

  const base =
    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled || busy !== null}
        onClick={() => run("pdf")}
        className={`${base} border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20`}
      >
        <FileDown className="h-4 w-4" />
        {busy === "pdf" ? "Gerando..." : "PDF"}
      </button>
      <button
        type="button"
        disabled={disabled || busy !== null}
        onClick={() => run("xlsx")}
        className={`${base} border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20`}
      >
        <FileSpreadsheet className="h-4 w-4" />
        {busy === "xlsx" ? "Gerando..." : "Excel"}
      </button>
    </div>
  );
}
