/**
 * Utilities to export management reports (DRE, balancete, etc.) to PDF and Excel.
 * Runs client-side only (dynamic imports keep the bundle light).
 */

export type ReportColumn = {
  key: string;
  label: string;
  align?: "left" | "right";
  /** relative width weight for the PDF layout (default 1) */
  weight?: number;
};

export type ReportRow = {
  [key: string]: string | number | boolean | null | undefined;
  __bold?: boolean;
  __indent?: number;
};

export type ReportSpec = {
  filename: string;
  title: string;
  subtitle?: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  /** Footer/total lines rendered in bold at the end */
  footerRows?: ReportRow[];
};

function cellText(row: ReportRow, col: ReportColumn): string {
  const v = row[col.key];
  if (v == null) return "";
  return String(v);
}

export async function exportReportToPdf(spec: ReportSpec) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 32;
  const usableW = pageW - margin * 2;

  const totalWeight = spec.columns.reduce((s, c) => s + (c.weight ?? 1), 0);
  const widths = spec.columns.map((c) => ((c.weight ?? 1) / totalWeight) * usableW);
  const xs: number[] = [];
  let acc = margin;
  for (const w of widths) {
    xs.push(acc);
    acc += w;
  }

  let y = margin;

  function header() {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text(spec.title, margin, y);
    y += 16;
    if (spec.subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(110, 110, 110);
      doc.text(spec.subtitle, margin, y);
      y += 12;
    }
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `Distrito LC-11 · Emitido em ${new Date().toLocaleString("pt-BR")}`,
      margin,
      y,
    );
    y += 14;
    columnsHeader();
  }

  function columnsHeader() {
    doc.setDrawColor(210, 210, 210);
    doc.setFillColor(240, 242, 246);
    doc.rect(margin, y, usableW, 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    spec.columns.forEach((c, i) => {
      const x = c.align === "right" ? xs[i] + widths[i] - 4 : xs[i] + 4;
      doc.text(c.label.toUpperCase(), x, y + 12, {
        align: c.align === "right" ? "right" : "left",
      });
    });
    y += 18;
  }

  function drawRow(row: ReportRow, bold = false) {
    if (y + 16 > pageH - margin) {
      doc.addPage();
      y = margin;
      columnsHeader();
    }
    doc.setFont("helvetica", bold || row.__bold ? "bold" : "normal");
    doc.setFontSize(8);
    doc.setTextColor(bold || row.__bold ? 20 : 60);
    spec.columns.forEach((c, i) => {
      const isRight = c.align === "right";
      const indent = i === 0 ? (row.__indent ?? 0) * 8 : 0;
      const x = isRight ? xs[i] + widths[i] - 4 : xs[i] + 4 + indent;
      const maxW = widths[i] - 8 - indent;
      const text = doc.splitTextToSize(cellText(row, c), maxW)[0] ?? "";
      doc.text(text, x, y + 11, { align: isRight ? "right" : "left" });
    });
    doc.setDrawColor(232, 232, 232);
    doc.line(margin, y + 15, margin + usableW, y + 15);
    y += 16;
  }

  header();
  for (const row of spec.rows) drawRow(row);
  if (spec.footerRows?.length) {
    y += 4;
    for (const row of spec.footerRows) drawRow(row, true);
  }

  doc.save(`${spec.filename}.pdf`);
}

/**
 * Converts a BRL-formatted display string ("R$ 1.234,56", "(R$ 10,00)", "—")
 * into a real number so spreadsheets can sum/sort the column.
 * Returns undefined when the value is not a currency/numeric string.
 */
function toSpreadsheetNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string") return undefined;
  const raw = value.trim();
  if (!raw) return undefined;
  // Only BRL currency strings become numbers: they must carry "R$" and, when
  // they group thousands, use strict 3-digit groups. Account codes like
  // "1.1.01", percentages and plain integers stay as text.
  const money = /^\(?\s*-?\s*R\$\s*(\d{1,3}(\.\d{3})*|\d+)(,\d{1,2})?\s*\)?$/;
  if (!money.test(raw)) return undefined;
  const negative = raw.startsWith("(") || /-/.test(raw);
  const digits = raw.replace(/[^\d,]/g, "").replace(",", ".");
  const n = Number(digits);
  if (!Number.isFinite(n)) return undefined;
  return negative ? -n : n;
}

export async function exportReportToExcel(spec: ReportSpec) {
  const XLSX = await import("xlsx");

  const head = spec.columns.map((c) => c.label);
  const allRows = [...spec.rows, ...(spec.footerRows ?? [])];
  const body = allRows.map((r) =>
    spec.columns.map((c) => {
      const v = r[c.key];
      if (v == null) return "";
      const n = toSpreadsheetNumber(v);
      return n ?? v;
    }),
  );

  const aoa: (string | number | boolean)[][] = [
    [spec.title],
    ...(spec.subtitle ? [[spec.subtitle]] : []),
    [`Emitido em ${new Date().toLocaleString("pt-BR")}`],
    [],
    head,
    ...(body as (string | number | boolean)[][]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Apply a currency number format to every numeric cell
  const headerRowIndex = aoa.length - body.length - 1; // 0-based row of the header
  body.forEach((row, rIdx) => {
    row.forEach((cell, cIdx) => {
      if (typeof cell !== "number") return;
      const ref = XLSX.utils.encode_cell({ r: headerRowIndex + 1 + rIdx, c: cIdx });
      const target = ws[ref];
      if (target) {
        target.t = "n";
        target.z = 'R$ #,##0.00;[Red](R$ #,##0.00);"—"';
      }
    });
  });

  ws["!cols"] = spec.columns.map((c) => ({ wch: Math.max(12, (c.weight ?? 1) * 16) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, spec.title.slice(0, 28) || "Relatório");
  XLSX.writeFile(wb, `${spec.filename}.xlsx`);
}
