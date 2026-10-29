import "fake-indexeddb/auto";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { PomoDatabase } from "@/data/dexie/database";
import { AppDataProvider, type AppData } from "@/data/provider";
import type { Skill } from "@/data/schemas";
import { createTestAppData } from "@/data/test-app-data";
import { SkillDetailScreen } from "./skill-detail-screen";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const NOW = new Date(2026, 9, 29, 15);
let data: AppData;
let db: PomoDatabase;
let guitar: Skill;

beforeEach(async () => {
  ({ data, db } = createTestAppData());
  vi.spyOn(Date, "now").mockReturnValue(NOW.getTime());
  router.push.mockClear();
  router.replace.mockClear();
  guitar = await data.skills.create({ name: "Guitar" });
});

afterEach(async () => {
  vi.restoreAllMocks();
  await db.delete();
});

function renderScreen(id = guitar.id) {
  render(
    <AppDataProvider value={data}>
      <SkillDetailScreen skillId={id} />
    </AppDataProvider>,
  );
}

async function logHours(day: number, hours: number, month = 10) {
  const start = new Date(2026, month - 1, day, 8);
  await data.sessions.add({
    skillId: guitar.id,
    startedAt: start.toISOString(),
    endedAt: new Date(start.getTime() + hours * 3_600_000).toISOString(),
    focusedSeconds: hours * 3600,
    plannedSeconds: hours * 3600,
    outcome: "completed",
  });
}

test("titles the page with the skill and states the pace", async () => {
  // 30 hours over the last 30 days: one hour a day.
  for (let day = 0; day < 30; day++) {
    const date = new Date(2026, 9, 29 - day);
    await logHours(date.getDate(), 1, date.getMonth() + 1);
  }
  renderScreen();
  expect(
    await screen.findByRole("heading", { level: 1, name: "Guitar" }),
  ).toBeInTheDocument();
  expect(
    await screen.findByText(
      "30.0 hours so far. At 1 h a day you reach 10,000 hours in February 2054.",
    ),
  ).toBeInTheDocument();
});

test("without recent practice there is no projection", async () => {
  await logHours(1, 2, 8);
  renderScreen();
  expect(
    await screen.findByText(
      "2.0 hours so far. Practise in the next 30 days to see when you reach 10,000 hours.",
    ),
  ).toBeInTheDocument();
  const figures = screen.getByRole("list", { name: "Figures" });
  expect(
    within(figures).getByText("Reaches 10,000 h").nextSibling,
  ).toHaveTextContent("—");
});

test("the weekly chart names every week's hours", async () => {
  await logHours(27, 2);
  await logHours(20, 1.5);
  renderScreen();
  const chart = await screen.findByRole("img", { name: /hours per week/i });
  expect(chart.getAttribute("aria-label")).toMatch(/Oct 19: 1\.5 h/);
  expect(chart.getAttribute("aria-label")).toMatch(/Oct 26: 2\.0 h/);
});

test("lists the sessions, newest first", async () => {
  await logHours(20, 1);
  await logHours(28, 2);
  renderScreen();
  const history = await screen.findByRole("list", { name: "Sessions" });
  const rows = within(history).getAllByRole("listitem");
  expect(rows[0]).toHaveTextContent("Yesterday");
  expect(rows[0]).toHaveTextContent("2 h");
  expect(rows[1]).toHaveTextContent("2026-10-20");
});

test("an unknown skill says so", async () => {
  renderScreen("00000000-0000-4000-8000-0000000000ff");
  expect(
    await screen.findByRole("heading", { level: 1, name: "Skill not found" }),
  ).toBeInTheDocument();
});

describe("managing the skill", () => {
  test("rename", async () => {
    renderScreen();
    const field = await screen.findByLabelText("Name");
    await userEvent.clear(field);
    await userEvent.type(field, "Classical guitar");
    await userEvent.click(screen.getByRole("button", { name: "Save name" }));
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Classical guitar",
      }),
    ).toBeInTheDocument();
  });

  test("rename to a taken name explains why", async () => {
    await data.skills.create({ name: "Chess" });
    renderScreen();
    const field = await screen.findByLabelText("Name");
    await userEvent.clear(field);
    await userEvent.type(field, "chess");
    await userEvent.click(screen.getByRole("button", { name: "Save name" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      'You already have a skill called "chess".',
    );
  });

  test("archive and restore", async () => {
    renderScreen();
    await userEvent.click(
      await screen.findByRole("button", { name: "Archive" }),
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Restore" }),
    );
    expect(
      await screen.findByRole("button", { name: "Archive" }),
    ).toBeVisible();
    expect((await data.skills.get(guitar.id))?.archivedAt).toBeNull();
  });

  test("delete asks first, naming what goes, then leaves the page", async () => {
    await logHours(28, 1);
    await logHours(27, 1);
    renderScreen();
    await userEvent.click(
      await screen.findByRole("button", { name: "Delete skill" }),
    );
    expect(
      screen.getByText(
        "Delete Guitar and its 2 sessions? This cannot be undone.",
      ),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(await data.skills.get(guitar.id)).toBeDefined();

    await userEvent.click(screen.getByRole("button", { name: "Delete skill" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Delete Guitar" }),
    );
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/skills"));
    expect(await data.skills.get(guitar.id)).toBeUndefined();
  });

  test("start a block on this skill", async () => {
    renderScreen();
    await userEvent.click(
      await screen.findByRole("button", { name: "Start a block" }),
    );
    expect(data.timer.get().skillId).toBe(guitar.id);
    expect(router.push).toHaveBeenCalledWith("/");
  });
});
