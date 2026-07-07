import assert from "node:assert/strict";
import test from "node:test";

import { fuzzySearchGuests } from "./fuzzy-search";

type GuestLike = {
  id: string;
  name: string;
  tag: string;
};

test("fuzzySearchGuests matches short name typos", () => {
  const guests: GuestLike[] = [
    { id: "rina", name: "Rina", tag: "Family" },
    { id: "budi", name: "Budi Santoso", tag: "VIP" },
  ];

  assert.deepEqual(
    fuzzySearchGuests(guests, "Ria").map((guest) => guest.id),
    ["rina"]
  );
});

test("fuzzySearchGuests ranks exact substrings before typo matches", () => {
  const guests: GuestLike[] = [
    { id: "rina", name: "Rina", tag: "Family" },
    { id: "ria", name: "Ria Wulandari", tag: "Friends" },
  ];

  assert.deepEqual(
    fuzzySearchGuests(guests, "Ria").map((guest) => guest.id),
    ["ria", "rina"]
  );
});

test("fuzzySearchGuests requires every query word to match", () => {
  const guests: GuestLike[] = [
    { id: "rina-family", name: "Rina Sari", tag: "Family" },
    { id: "rina-vip", name: "Rina Dewi", tag: "VIP" },
    { id: "budi-family", name: "Budi Santoso", tag: "Family" },
  ];

  const search = fuzzySearchGuests as <T extends { name: string }>(
    items: T[],
    query: string,
    limit: number,
    fields: Array<(item: T) => string>
  ) => T[];

  assert.deepEqual(
    search(guests, "Rina Famly", 8, [
      (guest) => guest.name,
      (guest) => guest.tag,
    ]).map((guest) => guest.id),
    ["rina-family"]
  );
});

test("fuzzySearchGuests can match alternate guest fields with typo tolerance", () => {
  const guests: GuestLike[] = [
    { id: "rina", name: "Rina", tag: "Family" },
    { id: "budi", name: "Budi Santoso", tag: "VIP" },
  ];

  const search = fuzzySearchGuests as <T extends { name: string }>(
    items: T[],
    query: string,
    limit: number,
    fields: Array<(item: T) => string>
  ) => T[];

  assert.deepEqual(
    search(guests, "Famly", 8, [(guest) => guest.name, (guest) => guest.tag]).map(
      (guest) => guest.id
    ),
    ["rina"]
  );
});
