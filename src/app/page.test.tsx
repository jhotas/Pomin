import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Home from "./page";

test("titles the timer screen after its nav item", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Timer" }),
  ).toBeInTheDocument();
});

test("sends a first-time user to add a skill", () => {
  render(<Home />);
  expect(
    screen.getByRole("link", { name: "Add your first skill" }),
  ).toHaveAttribute("href", "/skills");
});
