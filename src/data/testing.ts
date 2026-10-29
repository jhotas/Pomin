/** Deterministic clocks and ids for data tests. */

export const START = Date.parse("2026-10-29T09:00:00.000Z");

/** A clock that starts at `START` and moves one second on every read. */
export function steppingClock(start = START): () => Date {
  let now = start;
  return () => {
    const date = new Date(now);
    now += 1_000;
    return date;
  };
}

/** Valid, ordered v4 UUIDs: ...-000000000001, ...-000000000002, ... */
export function sequentialIds(): () => string {
  let next = 0;
  return () => `00000000-0000-4000-8000-${String(++next).padStart(12, "0")}`;
}

export function minutesAfter(iso: string, minutes: number): string {
  return new Date(Date.parse(iso) + minutes * 60_000).toISOString();
}
