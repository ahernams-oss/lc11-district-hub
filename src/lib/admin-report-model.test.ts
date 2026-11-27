import { test } from "node:test";
import assert from "node:assert/strict";
import { ADMIN_REPORT_SOURCES, flattenReportRecord, readAllReportPages } from "./admin-report-model";

test("catálogo inclui informações de todos os menus administrativos", () => {
  for (const id of ["inicio", "conteudo", "subpaginas", "lideres", "grandes-leoes", "regioes", "divisoes", "clubes", "noticias", "eventos", "projetos", "popups", "musica", "conexao", "documentos", "campanhas", "doacoes", "auditoria", "usuarios"]) assert.ok(ADMIN_REPORT_SOURCES.some((source) => source.id === id), id);
});
test("exporta todas as páginas, inclusive mais de mil registros", async () => {
  const records = Array.from({ length: 1234 }, (_, id) => ({ id }));
  const offsets: number[] = [];
  const result = await readAllReportPages(async (offset, size) => { offsets.push(offset); return records.slice(offset, offset + size); });
  assert.equal(result.length, 1234); assert.deepEqual(offsets, [0, 500, 1000]); assert.deepEqual(result.at(-1), { id: 1233 });
});
test("preserva todos os campos, links, códigos, anos e números sem converter em moeda", () => {
  const result = flattenReportRecord({ codigo: "1.1.01", ano: "2035/2036", quantidade: 40, data: { texto: "**Ação** // Serviço", fotos: ["https://example.org/foto.jpg"] } });
  assert.equal(result["codigo"], "1.1.01"); assert.equal(result["ano"], "2035/2036"); assert.equal(result["quantidade"], 40);
  assert.equal(result["data.texto"], "**Ação** // Serviço"); assert.equal(result["data.fotos.1"], "https://example.org/foto.jpg");
});
test("não perde conteúdo maior que o limite de uma célula do Excel", () => {
  const text = "á".repeat(40_000); const row = flattenReportRecord({ bio: text });
  assert.equal(String(row["bio.parte 1"]) + String(row["bio.parte 2"]), text);
});