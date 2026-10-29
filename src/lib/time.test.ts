import { describe, expect, test } from "vitest";
import { dayRange, formatClock, formatDuration, formatHours } from "./time";

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

describe("formatDuration", () => {
  test.each([
    [0, "0 m"],
    [59, "0 m"],
    [60, "1 m"],
    [1_500, "25 m"],
    [3_600, "1 h"],
    [4_500, "1 h 15 m"],
    [90_000, "25 h"],
  ])("formatDuration(%d) is %s", (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });
});

test("dayRange covers one local day, half-open", () => {
  const noon = new Date(2026, 9, 29, 12, 30);
  const { from, to } = dayRange(noon);
  expect(new Date(from)).toEqual(new Date(2026, 9, 29, 0, 0));
  expect(new Date(to)).toEqual(new Date(2026, 9, 30, 0, 0));
});
