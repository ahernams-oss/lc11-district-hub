import { test } from "node:test";
import assert from "node:assert/strict";
import { CARD_ORDER_PERIOD_MS, cardOrderPeriod, dailyCardOrder } from "./daily-card-order";

const cards = ["Vilmar", "Melvin", "Helen", "André", "Lorelei", "Anselmo"];
const start = Date.parse("2026-11-27T00:00:00Z");
const key = (name: string) => name;

test("o período dura exatamente 24 horas", () => {
  assert.equal(CARD_ORDER_PERIOD_MS, 86_400_000);
  assert.equal(cardOrderPeriod(start + 86_399_999), cardOrderPeriod(start));
  assert.equal(cardOrderPeriod(start + 86_400_000), cardOrderPeriod(start) + 1);
});

test("mantém a mesma ordem durante o período para todos os visitantes", () => {
  assert.deepEqual(dailyCardOrder(cards, key, cardOrderPeriod(start)), dailyCardOrder([...cards].reverse(), key, cardOrderPeriod(start + 86_399_999)));
});

test("muda aleatoriamente a sequência no período seguinte sem perder cartões", () => {
  const before = [...cards];
  const today = dailyCardOrder(cards, key, cardOrderPeriod(start));
  const tomorrow = dailyCardOrder(cards, key, cardOrderPeriod(start + 86_400_000));
  assert.notDeepEqual(today, tomorrow);
  assert.deepEqual([...today].sort(), [...cards].sort());
  assert.deepEqual([...tomorrow].sort(), [...cards].sort());
  assert.deepEqual(cards, before);
  assert.deepEqual(dailyCardOrder([], key, 0), []);
  assert.deepEqual(dailyCardOrder(["Vilmar"], key, 0), ["Vilmar"]);
});