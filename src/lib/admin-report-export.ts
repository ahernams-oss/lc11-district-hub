import fontAsset from "@/assets/admin-report-font.ttf.asset.json";
import { reportFieldLabel, type AdminReportSection } from "./admin-report-model";

export function downloadAdminReport(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export async function deliverAdminReport(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type });
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return; }
    catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; }
  }
  downloadAdminReport(blob, filename);
}

export async function buildAdminExcel(sections: AdminReportSection[], context: string): Promise<Blob> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  const issued = new Date().toLocaleString("pt-BR");
  const summary = XLSX.utils.aoa_to_sheet([["Relatórios administrativos — Distrito LC-11"], [context], [`Emitido em ${issued}`], [], ["Área", "Registros"], ...sections.map((section) => [section.label, section.rows.length])]);
  summary["!cols"] = [{ wch: 55 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(workbook, summary, "Resumo");
  sections.forEach((section, index) => {
    const sheet = XLSX.utils.aoa_to_sheet([[section.label], [context], [`Emitido em ${issued} · ${section.rows.length} registros`], [], section.columns.map(reportFieldLabel), ...section.rows.map((row) => section.columns.map((key) => row[key] ?? ""))]);
    sheet["!cols"] = section.columns.map(() => ({ wch: 30 }));
    // Native numbers remain ordinary numbers; IDs, years and codes stay text.
    if (section.columns.length) sheet["!autofilter"] = { ref: XLSX.utils.encode_range({ r: 4, c: 0 }, { r: Math.max(4, section.rows.length + 4), c: section.columns.length - 1 }) };
    XLSX.utils.book_append_sheet(workbook, sheet, `${index + 1} ${section.label}`.replace(/[\\/?*\[\]:]/g, " ").slice(0, 31));
  });
  return new Blob([XLSX.write(workbook, { bookType: "xlsx", type: "array" })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

let fontPromise: Promise<string> | undefined;
function loadFont() {
  fontPromise ??= fetch(fontAsset.url).then(async (response) => {
    if (!response.ok) throw new Error("Não foi possível carregar a fonte do PDF.");
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
    return btoa(binary);
  }).catch((error: unknown) => { fontPromise = undefined; throw error; });
  return fontPromise;
}

/** Vertical record layout preserves long descriptions and URLs across pages. */
export async function buildAdminPdf(sections: AdminReportSection[], context: string): Promise<Blob> {
  const [{ jsPDF }, font] = await Promise.all([import("jspdf"), loadFont()]);
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  doc.addFileToVFS("Report.ttf", font); doc.addFont("Report.ttf", "Report", "normal"); doc.setFont("Report");
  const width = doc.internal.pageSize.getWidth(), height = doc.internal.pageSize.getHeight();
  const margin = 36, issued = new Date().toLocaleString("pt-BR");
  let y = margin;
  const nextPage = () => { doc.addPage(); y = margin; };
  const text = (value: string, size = 9) => {
    doc.setFontSize(size);
    const lines: string[] = doc.splitTextToSize(value.replace(/\r\n/g, "\n"), width - margin * 2);
    for (const line of lines) {
      if (y + size * 1.4 > height - 48) nextPage();
      doc.text(line, margin, y + size); y += size * 1.4;
    }
  };
  text("Relatórios administrativos — Distrito LC-11", 17); y += 10;
  text(context); text(`Emitido em ${issued}`); y += 12;
  text("Resumo", 13);
  sections.forEach((section) => text(`${section.label}: ${section.rows.length} registros`));
  for (const section of sections) {
    nextPage(); text(section.label, 15); y += 8;
    text(`${section.rows.length} registros · ${context}`); y += 12;
    if (!section.rows.length) text("Nenhum registro encontrado.");
    section.rows.forEach((row, index) => {
      if (y > height - 150) nextPage();
      const title = String(row["name"] ?? row["title"] ?? row["email"] ?? row["key"] ?? row["id"] ?? "Registro");
      text(`${index + 1}. ${title}`, 11); y += 6;
      for (const field of section.columns) {
        const value = row[field];
        text(`${reportFieldLabel(field)}: ${typeof value === "boolean" ? value ? "Sim" : "Não" : value === "" || value === undefined ? "—" : String(value)}`);
        y += 3;
      }
      y += 12;
    });
  }
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page); doc.setFontSize(8);
    doc.text(`Distrito LC-11 · ${page} / ${pages}`, margin, height - 22);
  }
  return doc.output("blob");
}