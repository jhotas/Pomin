import { describe, expect, test } from "vitest";
import { masteryCells, totalFocusedSeconds } from "./progress";

test("total focused time sums the sessions", () => {
  expect(
    totalFocusedSeconds([{ focusedSeconds: 1500 }, { focusedSeconds: 600 }]),
  ).toBe(2100);
  expect(totalFocusedSeconds([])).toBe(0);
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
