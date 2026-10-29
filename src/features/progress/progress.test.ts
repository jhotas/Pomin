import { describe, expect, test } from "vitest";
import {
  masteryCells,
  niceTicks,
  projectCompletion,
  sumSince,
  totalFocusedSeconds,
  weeklyTotals,
} from "./progress";

const HOUR = 3600;

/** A session at a local date and hour, `minutes` long. */
function at(
  year: number,
  month: number,
  day: number,
  hour: number,
  minutes = 60,
) {
  return {
    startedAt: new Date(year, month - 1, day, hour).toISOString(),
    focusedSeconds: minutes * 60,
  };
}

test("total focused time sums the sessions", () => {
  expect(
    totalFocusedSeconds([{ focusedSeconds: 1500 }, { focusedSeconds: 600 }]),
  ).toBe(2100);
  expect(totalFocusedSeconds([])).toBe(0);
});

test("sumSince counts sessions started on or after a moment", () => {
  const sessions = [
    at(2026, 10, 20, 9),
    at(2026, 10, 22, 9),
    at(2026, 10, 29, 9),
  ];
  expect(sumSince(sessions, new Date(2026, 9, 22, 9))).toBe(2 * HOUR);
});

describe("masteryCells", () => {
  test("splits the target into 100 blocks", () => {
    expect(masteryCells(0, 10_000)).toEqual({
      cells: 100,
      hoursPerCell: 100,
      full: 0,
      partial: 0,
    });
  });

  test("fills a block per 100 hours and shows the one in progress", () => {
    const { full, partial } = masteryCells(1_234.5 * 3600, 10_000);
    expect(full).toBe(12);
    expect(partial).toBeCloseTo(0.345);
  });

  test("a small start is drawn at its real size", () => {
    expect(masteryCells(1_500, 10_000).partial).toBeCloseTo(0.0041667, 6);
  });

  test("never overflows the grid", () => {
    expect(masteryCells(20_000 * 3600, 10_000)).toMatchObject({
      full: 100,
      partial: 0,
    });
  });

  test("scales with the skill's own target", () => {
    expect(masteryCells(150 * 3600, 1_000)).toMatchObject({
      hoursPerCell: 10,
      full: 15,
      partial: 0,
    });
  });
});

describe("weeklyTotals", () => {
  // Thursday 29 October 2026; its week starts on Monday 26 October.
  const now = new Date(2026, 9, 29, 15);

  test("lists the last weeks oldest first, starting on Mondays", () => {
    const weeks = weeklyTotals([], now, 3);
    expect(weeks.map((week) => week.start)).toEqual([
      new Date(2026, 9, 12),
      new Date(2026, 9, 19),
      new Date(2026, 9, 26),
    ]);
    expect(weeks.every((week) => week.seconds === 0)).toBe(true);
  });

  test("puts each session in its local week", () => {
    const weeks = weeklyTotals(
      [
        at(2026, 10, 19, 0, 30), // Monday, first minute of the week
        at(2026, 10, 25, 23, 25), // Sunday night, same week
        at(2026, 10, 26, 9, 50), // this week
        at(2026, 9, 1, 9), // too old to show
      ],
      now,
      3,
    );
    expect(weeks.map((week) => week.seconds / 60)).toEqual([0, 55, 50]);
  });
});

describe("projectCompletion", () => {
  const now = new Date(2026, 9, 29, 15);

  test("cannot project without practice in the last 30 days", () => {
    expect(projectCompletion([at(2026, 8, 1, 9)], 10_000, now)).toEqual({
      dailyAverageSeconds: 0,
      remainingSeconds: 10_000 * HOUR - HOUR,
      completesOn: null,
    });
  });

  test("divides the remaining hours by the last 30 days' daily average", () => {
    // 30 hours in the last 30 days: one hour a day.
    const sessions = Array.from({ length: 30 }, (_, i) =>
      at(2026, 10, 29 - i, 8),
    );
    const projection = projectCompletion(sessions, 100, now);
    expect(projection.dailyAverageSeconds).toBe(HOUR);
    expect(projection.remainingSeconds).toBe(70 * HOUR);
    expect(projection.completesOn).toEqual(new Date(2027, 0, 7));
  });

  test("a reached target is complete today", () => {
    const projection = projectCompletion([at(2026, 10, 29, 8, 120)], 1, now);
    expect(projection.remainingSeconds).toBe(0);
    expect(projection.completesOn).toEqual(new Date(2026, 9, 29));
  });
});

describe("niceTicks", () => {
  test.each([
    [0, [0, 1]],
    [0.4, [0, 0.25, 0.5]],
    [2.6, [0, 1, 2, 3]],
    [7, [0, 2, 4, 6, 8]],
    [12, [0, 5, 10, 15]],
    [40, [0, 10, 20, 30, 40, 50]],
  ])("niceTicks(%d hours) is %j", (max, ticks) => {
    expect(niceTicks(max)).toEqual(ticks);
  });
});
