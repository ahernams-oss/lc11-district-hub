import { describe, test } from "node:test";
import { deepStrictEqual, strictEqual } from "node:assert";
import { CLUBE_STATUS, CLUBE_STATUS_VALUES, clubeStatusInfo } from "./clube-status";

describe("status do clube", () => {
  test("inclui as cinco opções", () => {
    deepStrictEqual(CLUBE_STATUS_VALUES, [
      "ativo",
      "inativo",
      "em_processo",
      "status_quo",
      "suspenso",
    ]);
  });

  test("rótulos exibidos na tela", () => {
    strictEqual(CLUBE_STATUS.status_quo.label, "Status quo");
    strictEqual(CLUBE_STATUS.suspenso.label, "Suspenso");
    strictEqual(CLUBE_STATUS.em_processo.label, "Em Processo de Fundação");
  });

  test("status desconhecido ou vazio cai em Ativo", () => {
    strictEqual(clubeStatusInfo("").label, "Ativo");
    strictEqual(clubeStatusInfo(null).label, "Ativo");
    strictEqual(clubeStatusInfo("qualquer_coisa").label, "Ativo");
  });
});
