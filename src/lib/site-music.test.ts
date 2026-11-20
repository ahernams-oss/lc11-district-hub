import { test } from "node:test";
import assert from "node:assert";
import { isMusicLive } from "./site-music";

const m = { active: true, start_at: "2026-12-01T10:00:00Z", end_at: "2026-12-01T12:00:00Z" };

test("não toca antes do início", () => assert.equal(isMusicLive(m, new Date("2026-12-01T09:59:00Z")), false));
test("toca entre início e fim", () => assert.equal(isMusicLive(m, new Date("2026-12-01T11:00:00Z")), true));
test("para no horário de fim", () => assert.equal(isMusicLive(m, new Date("2026-12-01T12:00:00Z")), false));
test("inativa não toca", () => assert.equal(isMusicLive({ ...m, active: false }, new Date("2026-12-01T11:00:00Z")), false));
