import { test, expect } from "bun:test";
import { CLUBE_STATUS, CLUBE_STATUS_VALUES, clubeStatusInfo } from "./clube-status";

test("status do clube inclui as cinco opções", () => {
  expect(CLUBE_STATUS_VALUES).toEqual([
    "ativo",
    "inativo",
    "em_processo",
    "status_quo",
    "suspenso",
  ]);
});

test("rótulos exibidos na tela", () => {
  expect(CLUBE_STATUS.status_quo.label).toBe("Status quo");
  expect(CLUBE_STATUS.suspenso.label).toBe("Suspenso");
  expect(CLUBE_STATUS.em_processo.label).toBe("Em Processo de Fundação");
});

test("status desconhecido ou vazio cai em Ativo", () => {
  expect(clubeStatusInfo("").label).toBe("Ativo");
  expect(clubeStatusInfo(null).label).toBe("Ativo");
  expect(clubeStatusInfo("qualquer_coisa").label).toBe("Ativo");
});
