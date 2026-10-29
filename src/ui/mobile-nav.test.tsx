import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import { MobileNav } from "./mobile-nav";

vi.mock("next/navigation", () => ({ usePathname: () => "/skills" }));

beforeEach(() => {
  render(<MobileNav />);
});

test("names the product in the top bar, linking home", () => {
  expect(screen.getByRole("link", { name: "pomoapp" })).toHaveAttribute(
    "href",
    "/",
  );
});

test("opens the menu sheet", async () => {
  await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
  expect(screen.getByRole("dialog", { name: "Menu" })).toBeVisible();
});

test("closes on Escape and returns focus to the menu button", async () => {
  const open = screen.getByRole("button", { name: "Open menu" });
  await userEvent.click(open);
  await userEvent.keyboard("{Escape}");
  expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull();
  expect(open).toHaveFocus();
});

test("closes after choosing a destination", async () => {
  await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
  await userEvent.click(screen.getByRole("link", { name: "Settings" }));
  expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull();
});
