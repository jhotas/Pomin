import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  DuplicateSkillNameError,
  RecordNotFoundError,
  type Repositories,
} from "../repositories";
import type { NewSession } from "../schemas";
import { minutesAfter, sequentialIds, steppingClock } from "../testing";
import { PomoDatabase } from "./database";
import { createDexieRepositories } from "./repositories";

let db: PomoDatabase;
let repos: Repositories;
let dbCount = 0;

beforeEach(() => {
  db = new PomoDatabase(`pomoapp-test-${++dbCount}`);
  repos = createDexieRepositories(db, {
    now: steppingClock(),
    newId: sequentialIds(),
  });
});

afterEach(async () => {
  await db.delete();
});

function focusBlock(
  skillId: string,
  startedAt: string,
  minutes = 25,
): NewSession {
  return {
    skillId,
    startedAt,
    endedAt: minutesAfter(startedAt, minutes),
    focusedSeconds: minutes * 60,
    plannedSeconds: 25 * 60,
    outcome: minutes >= 25 ? "completed" : "interrupted",
  };
}

describe("skills", () => {
  test("a new skill is stored with a trimmed name and a 10,000 hour target", async () => {
    const skill = await repos.skills.create({ name: "  Guitar " });
    expect(skill).toEqual({
      id: "00000000-0000-4000-8000-000000000001",
      name: "Guitar",
      targetHours: 10_000,
      archivedAt: null,
      createdAt: "2026-10-29T09:00:00.000Z",
      updatedAt: "2026-10-29T09:00:00.000Z",
      deletedAt: null,
    });
    expect(await repos.skills.list()).toEqual([skill]);
    expect(await repos.skills.get(skill.id)).toEqual(skill);
  });

  test("are listed in the order they were created", async () => {
    await repos.skills.create({ name: "Spanish" });
    await repos.skills.create({ name: "Chess" });
    const names = (await repos.skills.list()).map((skill) => skill.name);
    expect(names).toEqual(["Spanish", "Chess"]);
  });

  test("names are unique, ignoring case", async () => {
    await repos.skills.create({ name: "Guitar" });
    await expect(repos.skills.create({ name: "guitar" })).rejects.toThrow(
      DuplicateSkillNameError,
    );
  });

  test("an invalid name is rejected", async () => {
    await expect(repos.skills.create({ name: "   " })).rejects.toThrow();
  });

  test("renaming keeps the id and moves updatedAt", async () => {
    const skill = await repos.skills.create({ name: "Guitar" });
    const renamed = await repos.skills.update(skill.id, {
      name: "Classical guitar",
    });
    expect(renamed).toMatchObject({
      id: skill.id,
      name: "Classical guitar",
      createdAt: skill.createdAt,
    });
    expect(renamed.updatedAt > skill.updatedAt).toBe(true);
  });

  test("a skill can be renamed to its own name in another case", async () => {
    const skill = await repos.skills.create({ name: "guitar" });
    await expect(
      repos.skills.update(skill.id, { name: "Guitar" }),
    ).resolves.toMatchObject({ name: "Guitar" });
  });

  test("a skill cannot take another skill's name", async () => {
    await repos.skills.create({ name: "Guitar" });
    const chess = await repos.skills.create({ name: "Chess" });
    await expect(
      repos.skills.update(chess.id, { name: "GUITAR" }),
    ).rejects.toThrow(DuplicateSkillNameError);
  });

  test("archived skills leave the default list but can still be listed", async () => {
    const guitar = await repos.skills.create({ name: "Guitar" });
    await repos.skills.create({ name: "Chess" });
    await repos.skills.update(guitar.id, {
      archivedAt: "2026-10-30T10:00:00.000Z",
    });
    expect((await repos.skills.list()).map((s) => s.name)).toEqual(["Chess"]);
    expect(
      (await repos.skills.list({ includeArchived: true })).map((s) => s.name),
    ).toEqual(["Guitar", "Chess"]);
  });

  test("deleting a skill hides it and its sessions, and frees its name", async () => {
    const guitar = await repos.skills.create({ name: "Guitar" });
    await repos.sessions.add(focusBlock(guitar.id, "2026-10-29T10:00:00.000Z"));
    await repos.skills.remove(guitar.id);

    expect(await repos.skills.list({ includeArchived: true })).toEqual([]);
    expect(await repos.skills.get(guitar.id)).toBeUndefined();
    expect(await repos.sessions.listBySkill(guitar.id)).toEqual([]);
    expect(await repos.sessions.listRecent(10)).toEqual([]);
    await expect(
      repos.skills.create({ name: "Guitar" }),
    ).resolves.toBeDefined();

    // Soft delete: the rows stay for sync, marked deleted.
    const rows = await db.sessions.toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.deletedAt).not.toBeNull();
  });

  test("updating or removing an unknown skill fails", async () => {
    const id = "00000000-0000-4000-8000-0000000000ff";
    await expect(repos.skills.update(id, { name: "X" })).rejects.toThrow(
      RecordNotFoundError,
    );
    await expect(repos.skills.remove(id)).rejects.toThrow(RecordNotFoundError);
  });
});

describe("sessions", () => {
  test("are stored against their skill", async () => {
    const guitar = await repos.skills.create({ name: "Guitar" });
    const session = await repos.sessions.add(
      focusBlock(guitar.id, "2026-10-29T10:00:00.000Z"),
    );
    expect(session).toMatchObject({
      skillId: guitar.id,
      focusedSeconds: 1500,
      outcome: "completed",
      deletedAt: null,
    });
    expect(await repos.sessions.listBySkill(guitar.id)).toEqual([session]);
  });

  test("adding the same block twice keeps one session", async () => {
    const guitar = await repos.skills.create({ name: "Guitar" });
    const block = focusBlock(guitar.id, "2026-10-29T10:00:00.000Z");
    const first = await repos.sessions.add(block);
    const second = await repos.sessions.add(block);
    expect(second).toEqual(first);
    expect(await repos.sessions.listBySkill(guitar.id)).toHaveLength(1);
  });

  test("need an existing skill", async () => {
    const guitar = await repos.skills.create({ name: "Guitar" });
    await repos.skills.remove(guitar.id);
    await expect(
      repos.sessions.add(focusBlock(guitar.id, "2026-10-29T10:00:00.000Z")),
    ).rejects.toThrow(RecordNotFoundError);
  });

  test("are listed by skill in time order, within a half-open range", async () => {
    const guitar = await repos.skills.create({ name: "Guitar" });
    const chess = await repos.skills.create({ name: "Chess" });
    await repos.sessions.add(focusBlock(guitar.id, "2026-10-29T12:00:00.000Z"));
    await repos.sessions.add(focusBlock(guitar.id, "2026-10-28T12:00:00.000Z"));
    await repos.sessions.add(focusBlock(chess.id, "2026-10-29T13:00:00.000Z"));
    await repos.sessions.add(focusBlock(guitar.id, "2026-10-30T00:00:00.000Z"));

    const all = await repos.sessions.listBySkill(guitar.id);
    expect(all.map((s) => s.startedAt)).toEqual([
      "2026-10-28T12:00:00.000Z",
      "2026-10-29T12:00:00.000Z",
      "2026-10-30T00:00:00.000Z",
    ]);

    const oct29 = await repos.sessions.listBySkill(guitar.id, {
      from: "2026-10-29T00:00:00.000Z",
      to: "2026-10-30T00:00:00.000Z",
    });
    expect(oct29.map((s) => s.startedAt)).toEqual(["2026-10-29T12:00:00.000Z"]);
  });

  test("the most recent come first across skills", async () => {
    const guitar = await repos.skills.create({ name: "Guitar" });
    const chess = await repos.skills.create({ name: "Chess" });
    await repos.sessions.add(focusBlock(guitar.id, "2026-10-29T08:00:00.000Z"));
    await repos.sessions.add(focusBlock(chess.id, "2026-10-29T10:00:00.000Z"));
    await repos.sessions.add(focusBlock(guitar.id, "2026-10-29T09:00:00.000Z"));

    const recent = await repos.sessions.listRecent(2);
    expect(recent.map((s) => s.startedAt)).toEqual([
      "2026-10-29T10:00:00.000Z",
      "2026-10-29T09:00:00.000Z",
    ]);
  });

  test("a removed session no longer counts", async () => {
    const guitar = await repos.skills.create({ name: "Guitar" });
    const session = await repos.sessions.add(
      focusBlock(guitar.id, "2026-10-29T10:00:00.000Z"),
    );
    await repos.sessions.remove(session.id);
    expect(await repos.sessions.listBySkill(guitar.id)).toEqual([]);
    await expect(repos.sessions.remove(session.id)).rejects.toThrow(
      RecordNotFoundError,
    );
  });
});

test("every write notifies subscribers of both repositories", async () => {
  const onSkills = vi.fn();
  const onSessions = vi.fn();
  const stopSkills = repos.skills.subscribe(onSkills);
  repos.sessions.subscribe(onSessions);

  const guitar = await repos.skills.create({ name: "Guitar" });
  await repos.sessions.add(focusBlock(guitar.id, "2026-10-29T10:00:00.000Z"));
  await repos.skills.remove(guitar.id);
  expect(onSkills).toHaveBeenCalledTimes(3);
  expect(onSessions).toHaveBeenCalledTimes(3);

  stopSkills();
  await repos.skills.create({ name: "Chess" });
  expect(onSkills).toHaveBeenCalledTimes(3);
  expect(onSessions).toHaveBeenCalledTimes(4);
});

test("failed writes notify nobody", async () => {
  const listener = vi.fn();
  repos.skills.subscribe(listener);
  await expect(repos.skills.create({ name: "" })).rejects.toThrow();
  expect(listener).not.toHaveBeenCalled();
});
