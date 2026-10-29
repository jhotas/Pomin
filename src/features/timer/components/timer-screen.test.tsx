import "fake-indexeddb/auto";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { PomoDatabase } from "@/data/dexie/database";
import { AppDataProvider, type AppData } from "@/data/provider";
import { createTestAppData } from "@/data/test-app-data";
import { TimerScreen } from "./timer-screen";

const MIN = 60_000;
const T0 = new Date(2026, 9, 29, 9, 0).getTime();

let data: AppData;
let db: PomoDatabase;
let now: number;

beforeEach(() => {
  ({ data, db } = createTestAppData());
  now = T0;
  vi.spyOn(Date, "now").mockImplementation(() => now);
  document.title = "pomoapp";
});

afterEach(async () => {
  vi.restoreAllMocks();
  await db.delete();
});

function renderScreen() {
  return render(
    <AppDataProvider value={data}>
      <TimerScreen />
    </AppDataProvider>,
  );
}

/** Waits for the real condition: the timer has the skill, so Start works. */
async function waitForStart() {
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Start" })).toBeEnabled(),
  );
}

async function renderWithSkill(name = "Guitar") {
  await data.skills.create({ name });
  renderScreen();
  await waitForStart();
}

describe("first run", () => {
  test("asks for a skill before a block can start", async () => {
    renderScreen();
    expect(await screen.findByLabelText("Skill name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start" })).toBeDisabled();
  });

  test("adding a skill selects it and enables Start", async () => {
    renderScreen();
    await userEvent.type(await screen.findByLabelText("Skill name"), "Guitar");
    await userEvent.click(screen.getByRole("button", { name: "Add skill" }));
    await waitForStart();
    expect(screen.getByLabelText("Skill")).toHaveDisplayValue("Guitar");
  });
});

describe("running a block", () => {
  test("counts down from the focus length", async () => {
    await renderWithSkill();
    expect(screen.getByRole("timer")).toHaveTextContent("25:00");
    await userEvent.click(screen.getByRole("button", { name: "Start" }));
    now = T0 + 10 * MIN;
    await waitFor(() =>
      expect(screen.getByRole("timer")).toHaveTextContent("15:00"),
    );
  });

  test("pause and resume swap the main control", async () => {
    await renderWithSkill();
    await userEvent.click(screen.getByRole("button", { name: "Start" }));
    await userEvent.click(screen.getByRole("button", { name: "Pause" }));
    await userEvent.click(screen.getByRole("button", { name: "Resume" }));
    expect(screen.getByRole("button", { name: "Pause" })).toBeVisible();
  });

  test("the skill cannot change during a block", async () => {
    await renderWithSkill();
    await userEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(screen.getByLabelText("Skill")).toBeDisabled();
  });

  test("the tab title shows the time left while a block runs", async () => {
    await renderWithSkill();
    await userEvent.click(screen.getByRole("button", { name: "Start" }));
    now = T0 + 6 * MIN + 18_000;
    await waitFor(() => expect(document.title).toBe("18:42 · Focus · pomoapp"));
  });

  test("a finished block is recorded and the break comes next", async () => {
    await renderWithSkill();
    await userEvent.click(screen.getByRole("button", { name: "Start" }));
    now = T0 + 25 * MIN + 500;
    expect(await screen.findByText("Short break")).toBeInTheDocument();
    expect(screen.getByRole("timer")).toHaveTextContent("05:00");
    const sessions = await data.sessions.listRecent(5);
    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toMatchObject({
      focusedSeconds: 1500,
      outcome: "completed",
    });
    expect(
      await screen.findByText("25 m", { selector: "li *" }),
    ).toBeInTheDocument();
  });

  test("skipping a block after a few minutes keeps the minutes", async () => {
    await renderWithSkill();
    await userEvent.click(screen.getByRole("button", { name: "Start" }));
    now = T0 + 5 * MIN;
    await userEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(await screen.findByText("Short break")).toBeInTheDocument();
    await waitFor(async () =>
      expect(await data.sessions.listRecent(5)).toMatchObject([
        { focusedSeconds: 300, outcome: "interrupted" },
      ]),
    );
  });
});

describe("keyboard", () => {
  test("Space starts and pauses, R resets", async () => {
    await renderWithSkill();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("button", { name: "Pause" })).toBeVisible();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("button", { name: "Resume" })).toBeVisible();
    await userEvent.keyboard("r");
    expect(screen.getByRole("button", { name: "Start" })).toBeVisible();
  });

  test("S skips to the break", async () => {
    await renderWithSkill();
    await userEvent.keyboard("s");
    expect(await screen.findByText("Short break")).toBeInTheDocument();
  });

  test("shortcuts are ignored while typing", async () => {
    renderScreen();
    await userEvent.type(await screen.findByLabelText("Skill name"), "s r");
    expect(screen.queryByText("Short break")).toBeNull();
  });
});

test("the selected skill's progress toward 10,000 hours is shown", async () => {
  const guitar = await data.skills.create({ name: "Guitar" });
  await data.sessions.add({
    skillId: guitar.id,
    startedAt: new Date(T0 - 2 * 60 * MIN).toISOString(),
    endedAt: new Date(T0 - 60 * MIN).toISOString(),
    focusedSeconds: 3600,
    plannedSeconds: 3600,
    outcome: "completed",
  });
  renderScreen();
  expect(
    await screen.findByRole("img", { name: /1\.0 of 10,000 hours/ }),
  ).toBeInTheDocument();
  await act(async () => {});
});
