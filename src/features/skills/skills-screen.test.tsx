import "fake-indexeddb/auto";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { PomoDatabase } from "@/data/dexie/database";
import { AppDataProvider, type AppData } from "@/data/provider";
import { createTestAppData } from "@/data/test-app-data";
import { SkillsScreen } from "./skills-screen";

const NOW = new Date(2026, 9, 29, 15);
let data: AppData;
let db: PomoDatabase;

beforeEach(() => {
  ({ data, db } = createTestAppData());
  vi.spyOn(Date, "now").mockReturnValue(NOW.getTime());
});

afterEach(async () => {
  vi.restoreAllMocks();
  await db.delete();
});

function renderScreen() {
  render(
    <AppDataProvider value={data}>
      <SkillsScreen />
    </AppDataProvider>,
  );
}

async function logHours(skillId: string, day: number, hours: number) {
  const start = new Date(2026, 9, day, 8);
  await data.sessions.add({
    skillId,
    startedAt: start.toISOString(),
    endedAt: new Date(start.getTime() + hours * 3_600_000).toISOString(),
    focusedSeconds: hours * 3600,
    plannedSeconds: hours * 3600,
    outcome: "completed",
  });
}

test("first run keeps the frame and offers the add form", async () => {
  renderScreen();
  expect(
    await screen.findByText(
      "No skills yet. Each skill keeps its own count toward 10,000 hours.",
    ),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Skill name")).toBeInTheDocument();
});

test("each skill shows its hours and links to its page", async () => {
  const guitar = await data.skills.create({ name: "Guitar" });
  await data.skills.create({ name: "Chess" });
  await logHours(guitar.id, 28, 2);
  await logHours(guitar.id, 10, 1.5);
  renderScreen();

  const list = await screen.findByRole("list", { name: "Skills" });
  const guitarRow = within(list).getByRole("link", { name: /Guitar/ });
  expect(guitarRow).toHaveAttribute("href", `/skills/${guitar.id}`);
  expect(guitarRow).toHaveTextContent("3.5 h");
  expect(guitarRow).toHaveTextContent("2 h this week");
  expect(within(list).getByRole("link", { name: /Chess/ })).toHaveTextContent(
    "0.0 h",
  );
  expect(
    screen.getByText("2 skills · 3.5 hours logged in total."),
  ).toBeInTheDocument();
});

test("the total adds up from the rows as shown", async () => {
  const guitar = await data.skills.create({ name: "Guitar" });
  const chess = await data.skills.create({ name: "Chess" });
  await logHours(guitar.id, 28, 1.25);
  await logHours(chess.id, 28, 1.25);
  renderScreen();
  const list = await screen.findByRole("list", { name: "Skills" });
  expect(within(list).getAllByText("1.3 h")).toHaveLength(2);
  expect(
    screen.getByText("2 skills · 2.6 hours logged in total."),
  ).toBeInTheDocument();
});

test("archived skills are listed apart", async () => {
  const guitar = await data.skills.create({ name: "Guitar" });
  await data.skills.create({ name: "Chess" });
  await data.skills.update(guitar.id, { archivedAt: NOW.toISOString() });
  renderScreen();

  const active = await screen.findByRole("list", { name: "Skills" });
  expect(within(active).queryByText("Guitar")).toBeNull();
  const archived = screen.getByRole("list", { name: "Archived" });
  expect(within(archived).getByText("Guitar")).toBeInTheDocument();
});

test("adding a skill with a taken name explains why", async () => {
  await data.skills.create({ name: "Guitar" });
  renderScreen();
  await screen.findByRole("list", { name: "Skills" });
  await userEvent.type(screen.getByLabelText("Skill name"), "guitar");
  await userEvent.click(screen.getByRole("button", { name: "Add skill" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    'You already have a skill called "guitar".',
  );
  expect(screen.getByLabelText("Skill name")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});

test("a new skill joins the list", async () => {
  renderScreen();
  await userEvent.type(await screen.findByLabelText("Skill name"), "Spanish");
  await userEvent.click(screen.getByRole("button", { name: "Add skill" }));
  const list = await screen.findByRole("list", { name: "Skills" });
  expect(within(list).getByText("Spanish")).toBeInTheDocument();
});
