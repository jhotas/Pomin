import { ChangeNotifier } from "../notifier";
import {
  DuplicateSkillNameError,
  RecordNotFoundError,
  type Repositories,
  type SessionRepository,
  type SkillRepository,
  type TimeRange,
} from "../repositories";
import {
  NewSessionSchema,
  SessionSchema,
  SkillNameSchema,
  SkillSchema,
  type NewSession,
  type Session,
  type Skill,
} from "../schemas";
import type { PomoDatabase } from "./database";

type Options = {
  now?: () => Date;
  newId?: () => string;
};

type Deps = {
  db: PomoDatabase;
  now: () => string;
  newId: () => string;
  notifier: ChangeNotifier;
};

/**
 * IndexedDB-backed repositories. Both share one notifier, because one write
 * can change both (deleting a skill deletes its sessions).
 */
export function createDexieRepositories(
  db: PomoDatabase,
  { now = () => new Date(), newId = () => crypto.randomUUID() }: Options = {},
): Repositories {
  const deps: Deps = {
    db,
    now: () => now().toISOString(),
    newId,
    notifier: new ChangeNotifier(),
  };
  return {
    skills: createSkillRepository(deps),
    sessions: createSessionRepository(deps),
  };
}

const isLive = (row: { deletedAt: string | null }) => row.deletedAt === null;
const sameName = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0;

function createSkillRepository({
  db,
  now,
  newId,
  notifier,
}: Deps): SkillRepository {
  async function liveSkill(id: string): Promise<Skill> {
    const row = await db.skills.get(id);
    if (!row || !isLive(row)) throw new RecordNotFoundError("skill", id);
    return SkillSchema.parse(row);
  }

  async function assertNameFree(name: string, exceptId?: string) {
    const taken = await db.skills
      .filter(
        (row) => isLive(row) && row.id !== exceptId && sameName(row.name, name),
      )
      .count();
    if (taken > 0) throw new DuplicateSkillNameError(name);
  }

  return {
    async list({ includeArchived = false } = {}) {
      const rows = await db.skills.toArray();
      return rows
        .map((row) => SkillSchema.parse(row))
        .filter((skill) => isLive(skill))
        .filter((skill) => includeArchived || skill.archivedAt === null)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },

    async get(id) {
      const row = await db.skills.get(id);
      return row && isLive(row) ? SkillSchema.parse(row) : undefined;
    },

    async create(input) {
      const name = SkillNameSchema.parse(input.name);
      const skill = await db.transaction("rw", db.skills, async () => {
        await assertNameFree(name);
        const at = now();
        const created = SkillSchema.parse({
          id: newId(),
          name,
          archivedAt: null,
          createdAt: at,
          updatedAt: at,
          deletedAt: null,
        });
        await db.skills.add(created);
        return created;
      });
      notifier.notify();
      return skill;
    },

    async update(id, patch) {
      const skill = await db.transaction("rw", db.skills, async () => {
        const current = await liveSkill(id);
        const name =
          patch.name === undefined
            ? current.name
            : SkillNameSchema.parse(patch.name);
        if (name !== current.name) await assertNameFree(name, id);
        const updated = SkillSchema.parse({
          ...current,
          ...patch,
          name,
          updatedAt: now(),
        });
        await db.skills.put(updated);
        return updated;
      });
      notifier.notify();
      return skill;
    },

    async remove(id) {
      await db.transaction("rw", db.skills, db.sessions, async () => {
        const current = await liveSkill(id);
        const at = now();
        await db.skills.put({ ...current, deletedAt: at, updatedAt: at });
        await db.sessions
          .where("skillId")
          .equals(id)
          .filter(isLive)
          .modify({ deletedAt: at, updatedAt: at });
      });
      notifier.notify();
    },

    subscribe: (listener) => notifier.subscribe(listener),
  };
}

function inRange(session: Session, range?: TimeRange): boolean {
  if (!range) return true;
  const startedAt = Date.parse(session.startedAt);
  return (
    startedAt >= Date.parse(range.from) && startedAt < Date.parse(range.to)
  );
}

function createSessionRepository({
  db,
  now,
  newId,
  notifier,
}: Deps): SessionRepository {
  return {
    async listBySkill(skillId, range) {
      const rows = await db.sessions.where("skillId").equals(skillId).toArray();
      return rows
        .map((row) => SessionSchema.parse(row))
        .filter((session) => isLive(session) && inRange(session, range))
        .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    },

    async listRecent(limit) {
      const rows = await db.sessions
        .orderBy("startedAt")
        .reverse()
        .filter(isLive)
        .limit(limit)
        .toArray();
      return rows.map((row) => SessionSchema.parse(row));
    },

    async add(input: NewSession) {
      const fields = NewSessionSchema.parse(input);
      const session = await db.transaction(
        "rw",
        db.skills,
        db.sessions,
        async () => {
          const skill = await db.skills.get(fields.skillId);
          if (!skill || !isLive(skill)) {
            throw new RecordNotFoundError("skill", fields.skillId);
          }
          const at = now();
          const created = SessionSchema.parse({
            ...fields,
            id: newId(),
            createdAt: at,
            updatedAt: at,
            deletedAt: null,
          });
          await db.sessions.add(created);
          return created;
        },
      );
      notifier.notify();
      return session;
    },

    async remove(id) {
      await db.transaction("rw", db.sessions, async () => {
        const row = await db.sessions.get(id);
        if (!row || !isLive(row)) throw new RecordNotFoundError("session", id);
        const at = now();
        await db.sessions.put({ ...row, deletedAt: at, updatedAt: at });
      });
      notifier.notify();
    },

    subscribe: (listener) => notifier.subscribe(listener),
  };
}
