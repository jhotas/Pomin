import "fake-indexeddb/auto";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test } from "vitest";
import type { PomoDatabase } from "./dexie/database";
import {
  useRecentSessions,
  useSettings,
  useSkill,
  useSkills,
  useSkillSessions,
} from "./hooks";
import { AppDataProvider, type AppData } from "./provider";
import { createTestAppData } from "./test-app-data";
import { minutesAfter } from "./testing";

let db: PomoDatabase;
let data: AppData;

beforeEach(() => {
  ({ data, db } = createTestAppData());
});

afterEach(async () => {
  await db.delete();
});

function renderWithData(ui: React.ReactNode) {
  return render(<AppDataProvider value={data}>{ui}</AppDataProvider>);
}

function SkillNames() {
  const skills = useSkills();
  if (skills.status !== "success") return <p>Loading</p>;
  return <p>{skills.data.map((skill) => skill.name).join(", ") || "None"}</p>;
}

test("useSkills shows the stored skills and follows changes", async () => {
  await data.skills.create({ name: "Guitar" });
  renderWithData(<SkillNames />);
  expect(screen.getByText("Loading")).toBeInTheDocument();
  expect(await screen.findByText("Guitar")).toBeInTheDocument();

  await act(() => data.skills.create({ name: "Chess" }));
  expect(await screen.findByText("Guitar, Chess")).toBeInTheDocument();
});

function SkillName({ id }: { id: string }) {
  const skill = useSkill(id);
  if (skill.status === "loading") return <p>Loading</p>;
  return <p>{skill.data?.name ?? "Missing"}</p>;
}

test("useSkill reports a deleted skill as missing", async () => {
  const guitar = await data.skills.create({ name: "Guitar" });
  renderWithData(<SkillName id={guitar.id} />);
  expect(await screen.findByText("Guitar")).toBeInTheDocument();
  await act(() => data.skills.remove(guitar.id));
  expect(await screen.findByText("Missing")).toBeInTheDocument();
});

function SessionCount({ skillId }: { skillId?: string }) {
  const bySkill = useSkillSessions(skillId ?? "");
  const recent = useRecentSessions(5);
  if (bySkill.status !== "success" || recent.status !== "success") {
    return <p>Loading</p>;
  }
  return (
    <p>
      {bySkill.data.length} for skill, {recent.data.length} recent
    </p>
  );
}

test("session hooks follow new sessions", async () => {
  const guitar = await data.skills.create({ name: "Guitar" });
  renderWithData(<SessionCount skillId={guitar.id} />);
  expect(await screen.findByText("0 for skill, 0 recent")).toBeInTheDocument();

  const startedAt = "2026-10-29T10:00:00.000Z";
  await act(() =>
    data.sessions.add({
      skillId: guitar.id,
      startedAt,
      endedAt: minutesAfter(startedAt, 25),
      focusedSeconds: 1500,
      plannedSeconds: 1500,
      outcome: "completed",
    }),
  );
  expect(await screen.findByText("1 for skill, 1 recent")).toBeInTheDocument();
});

function FocusLength() {
  const [settings, update] = useSettings();
  return (
    <button type="button" onClick={() => update({ focusMinutes: 50 })}>
      {settings.focusMinutes} minutes
    </button>
  );
}

test("useSettings reads and updates the settings", async () => {
  renderWithData(<FocusLength />);
  const button = screen.getByRole("button", { name: "25 minutes" });
  await act(async () => button.click());
  expect(screen.getByRole("button", { name: "50 minutes" })).toBeVisible();
});

test("hooks outside the provider fail loudly", () => {
  expect(() => render(<SkillNames />)).toThrow(/AppDataProvider/);
});
