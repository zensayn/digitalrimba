// Client-side fuzzy guest search over guest-like records.
// Substring match first, then Levenshtein ≤ 2 per query word — at
// low-thousands of short names this runs in single-digit milliseconds.
// ponytail: hand-rolled instead of fuse.js; revisit only if rosters grow huge.

export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Banded Levenshtein capped at `max` — returns max+1 when exceeded. */
export function boundedLevenshtein(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      rowMin = Math.min(rowMin, curr[j]);
    }
    if (rowMin > max) return max + 1;
    prev = curr;
  }
  return prev[b.length];
}

export type FuzzySearchField<T> = (item: T) => string | null | undefined;

/**
 * Every query word must match some searchable word (substring, or typo within
 * edit distance 2). Exact substring of any full searchable field ranks first.
 */
export function fuzzySearchGuests<T extends { name: string }>(
  guests: T[],
  query: string,
  limit = 8,
  fields?: readonly FuzzySearchField<T>[]
): T[] {
  const q = normalizeName(query);
  if (!q) return [];
  const queryWords = q.split(/\s+/);
  const fieldSelectors = fields?.length ? fields : [(guest: T) => guest.name];

  const scored: { guest: T; score: number }[] = [];
  for (const guest of guests) {
    const searchableFields = fieldSelectors
      .map((select) => normalizeName(select(guest) ?? ""))
      .filter(Boolean);

    if (searchableFields.some((field) => field.includes(q))) {
      scored.push({ guest, score: 0 });
      continue;
    }

    const searchableWords = searchableFields.flatMap((field) =>
      field.split(/\s+/)
    );
    let total = 0;
    let allMatched = true;
    for (const qw of queryWords) {
      let best = 3;
      for (const word of searchableWords) {
        if (word.includes(qw)) {
          best = 0.5;
          break;
        }
        best = Math.min(best, boundedLevenshtein(qw, word, 2));
      }
      if (best > 2) {
        allMatched = false;
        break;
      }
      total += best;
    }
    if (allMatched) scored.push({ guest, score: 1 + total });
  }

  return scored
    .sort(
      (a, b) => a.score - b.score || a.guest.name.localeCompare(b.guest.name)
    )
    .slice(0, limit)
    .map((s) => s.guest);
}
