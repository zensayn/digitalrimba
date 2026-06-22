import assert from "node:assert/strict";
import test from "node:test";

import {
  EMPTY_GUESTS,
  getGuestColumnFilters,
  resolveGuestTableData,
} from "./table-state.ts";
import type { Guest } from "./types.ts";

test("resolveGuestTableData reuses one empty guest array", () => {
  assert.equal(resolveGuestTableData(undefined), EMPTY_GUESTS);
  assert.equal(resolveGuestTableData(undefined), resolveGuestTableData(undefined));
});

test("resolveGuestTableData preserves loaded guest data reference", () => {
  const guests: Guest[] = [
    {
      id: "guest-1",
      name: "Alya",
      phone: "0812",
      tag: "family",
      qrToken: "qr-1",
    },
  ];

  assert.equal(resolveGuestTableData(guests), guests);
});

test("getGuestColumnFilters reuses one empty filter array for all tags", () => {
  assert.deepEqual(getGuestColumnFilters("all"), []);
  assert.equal(getGuestColumnFilters("all"), getGuestColumnFilters("all"));
});

test("getGuestColumnFilters returns tag filter for selected tag", () => {
  assert.deepEqual(getGuestColumnFilters("vip"), [{ id: "tag", value: "vip" }]);
});
