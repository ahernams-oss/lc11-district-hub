import { test } from "node:test";
import { deepStrictEqual, strictEqual } from "node:assert";
import { DEFAULT_EVENT_YEAR, EVENT_YEARS, eventYearFromSlug, eventsForYear } from "./event-years";

test("event years include exactly the five requested years", () => {
  deepStrictEqual(EVENT_YEARS, ["2026/2027", "2027/2028", "2028/2029", "2029/2030", "2030/2031"]);
});
test("existing events default to 2026/2027 regardless of their dates", () => {
  strictEqual(DEFAULT_EVENT_YEAR, "2026/2027");
  deepStrictEqual(eventsForYear([
    { id: "existing", starts_at: "2026-06-14", ano_leonistico: DEFAULT_EVENT_YEAR },
    { id: "future", starts_at: "2026-06-14", ano_leonistico: "2027/2028" },
  ], "2026/2027").map((e) => e.id), ["existing"]);
});
test("each subpage resolves to its year and unknown years are rejected", () => {
  for (const year of EVENT_YEARS) strictEqual(eventYearFromSlug(year.replace("/", "-")), year);
  strictEqual(eventYearFromSlug("2031-2032"), undefined);
});