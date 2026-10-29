import { describe, expect, test } from "vitest";
import { isActivePath, NAV_ITEMS } from "./nav";

describe("isActivePath", () => {
  test.each([
    ["/", "/", true],
    ["/", "/skills", false],
    ["/skills", "/skills", true],
    ["/skills", "/skills/abc", true],
    ["/skills", "/skillset", false],
  ])("isActivePath(%s, %s) is %s", (href, pathname, expected) => {
    expect(isActivePath(href, pathname)).toBe(expected);
  });
});

test("the main navigation lists Timer, Skills and Settings in order", () => {
  expect(NAV_ITEMS.map(({ label, href }) => [label, href])).toEqual([
    ["Timer", "/"],
    ["Skills", "/skills"],
    ["Settings", "/settings"],
  ]);
});
