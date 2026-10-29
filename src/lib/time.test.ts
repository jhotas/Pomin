import { describe, expect, test } from "vitest";
import { formatClock, formatHours } from "./time";

describe("formatClock", () => {
  test.each([
    [1_500_000, "25:00"],
    [1_499_001, "25:00"],
    [1_499_000, "24:59"],
    [1, "00:01"],
    [0, "00:00"],
    [-5, "00:00"],
    [5_400_000, "90:00"],
  ])("formatClock(%d) is %s", (ms, expected) => {
    expect(formatClock(ms)).toBe(expected);
  });
});

describe("formatHours", () => {
  test.each([
    [0, "0.0"],
    [5_400, "1.5"],
    [4_444_200, "1,234.5"],
  ])("formatHours(%d) is %s", (seconds, expected) => {
    expect(formatHours(seconds)).toBe(expected);
  });
});
