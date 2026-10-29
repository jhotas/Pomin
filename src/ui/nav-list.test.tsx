import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { NavList } from "./nav-list";

test("links each destination", () => {
  render(<NavList pathname="/" />);
  const nav = screen.getByRole("navigation", { name: "Main" });
  expect(nav).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Timer" })).toHaveAttribute(
    "href",
    "/",
  );
  expect(screen.getByRole("link", { name: "Skills" })).toHaveAttribute(
    "href",
    "/skills",
  );
  expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
    "href",
    "/settings",
  );
});

test("marks only the section that contains the current page", () => {
  render(<NavList pathname="/skills/abc" />);
  expect(screen.getByRole("link", { name: "Skills" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(screen.getByRole("link", { name: "Timer" })).not.toHaveAttribute(
    "aria-current",
  );
  expect(screen.getByRole("link", { name: "Settings" })).not.toHaveAttribute(
    "aria-current",
  );
});

test("reports navigation so a sheet can close", async () => {
  const onNavigate = vi.fn();
  render(<NavList pathname="/" onNavigate={onNavigate} />);
  await userEvent.click(screen.getByRole("link", { name: "Skills" }));
  expect(onNavigate).toHaveBeenCalledOnce();
});
