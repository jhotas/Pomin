import { describe, expect, test } from "vitest";
import {
  DEFAULT_SETTINGS,
  NewSessionSchema,
  SessionSchema,
  SettingsSchema,
  SkillNameSchema,
  SkillSchema,
} from "./schemas";

const ID = "2f6c1b9e-6a8f-4f36-9a51-3c5e2a7b9d10";
const SKILL_ID = "7a1d0c3e-2b4f-4e6a-8c9d-0e1f2a3b4c5d";
const AT = "2026-10-29T09:00:00.000Z";

describe("skill names", () => {
  test("are trimmed", () => {
    expect(SkillNameSchema.parse("  Guitar  ")).toBe("Guitar");
  });

  test.each(["", "   ", "x".repeat(61)])("reject %j", (name) => {
    expect(SkillNameSchema.safeParse(name).success).toBe(false);
  });

  test("accept 60 characters", () => {
    expect(SkillNameSchema.safeParse("x".repeat(60)).success).toBe(true);
  });
});

test("a skill aims at 10,000 hours unless told otherwise", () => {
  const skill = SkillSchema.parse({
    id: ID,
    name: "Guitar",
    archivedAt: null,
    createdAt: AT,
    updatedAt: AT,
    deletedAt: null,
  });
  expect(skill.targetHours).toBe(10_000);
});

describe("sessions", () => {
  const session = {
    skillId: SKILL_ID,
    startedAt: AT,
    endedAt: "2026-10-29T09:25:00.000Z",
    focusedSeconds: 1500,
    plannedSeconds: 1500,
    outcome: "completed",
  } as const;

  test("a new session needs its skill, times, durations and outcome", () => {
    expect(NewSessionSchema.parse(session)).toEqual(session);
  });

  test("cannot end before it starts", () => {
    const result = NewSessionSchema.safeParse({
      ...session,
      endedAt: "2026-10-29T08:59:59.000Z",
    });
    expect(result.success).toBe(false);
  });

  test.each([-1, 1.5])("reject %d focused seconds", (focusedSeconds) => {
    expect(
      NewSessionSchema.safeParse({ ...session, focusedSeconds }).success,
    ).toBe(false);
  });

  test("a stored session carries an id and record times", () => {
    const stored = {
      ...session,
      id: ID,
      createdAt: AT,
      updatedAt: AT,
      deletedAt: null,
    };
    expect(SessionSchema.parse(stored)).toEqual(stored);
  });
});

describe("settings", () => {
  test("default to 25/5/15, a long break every 4, sound on, nothing auto-started", () => {
    expect(DEFAULT_SETTINGS).toEqual({
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      longBreakEvery: 4,
      autoStartBreaks: false,
      autoStartFocus: false,
      soundEnabled: true,
      activeSkillId: null,
    });
  });

  test("fill missing fields from the defaults", () => {
    expect(SettingsSchema.parse({ focusMinutes: 50 })).toEqual({
      ...DEFAULT_SETTINGS,
      focusMinutes: 50,
    });
  });

  test.each([
    { focusMinutes: 0 },
    { focusMinutes: 181 },
    { longBreakEvery: 0 },
  ])("reject %j", (patch) => {
    expect(SettingsSchema.safeParse(patch).success).toBe(false);
  });
});
