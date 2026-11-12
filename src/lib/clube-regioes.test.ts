import { describe, test } from "node:test";
import { deepStrictEqual, strictEqual } from "node:assert";
import { correspondeRegiao, opcoesRegioes } from "./clube-regioes";

describe("filtro de regiões dos clubes", () => {
  test("inclui todas as regiões de A a F mesmo sem clubes", () => {
    deepStrictEqual(opcoesRegioes([]), ["Região A", "Região B", "Região C", "Região D", "Região E", "Região F"]);
  });

  for (const [regiao, filtro] of [
    ["Região A — Metropolitana Central", "Região A"],
    ["Região B — Metropolitana Sul/Leste", "Região B"],
    ["Região C ", "Região C"],
    ["Região D — ABC Paulista", "Região D"],
    ["Região E — Campinas e Sorocaba", "Região E"],
    ["Região F — Ribeirão Preto", "Região F"],
  ]) {
    test(`filtra ${filtro} com o nome cadastrado`, () => {
      strictEqual(correspondeRegiao(regiao, filtro), true);
      strictEqual(correspondeRegiao(regiao, filtro === "Região A" ? "Região B" : "Região A"), false);
    });
  }

  test("todas as regiões não exclui clubes sem região", () => {
    strictEqual(correspondeRegiao(null, "todos"), true);
    strictEqual(correspondeRegiao(null, "Região A"), false);
  });

  test("preserva regiões adicionais e elimina duplicatas", () => {
    deepStrictEqual(opcoesRegioes([{ regiao: "Região A — Metropolitana Central" }, { regiao: "Região G" }]),
      ["Região A", "Região B", "Região C", "Região D", "Região E", "Região F", "Região G"]);
  });
});