import type { NewSession, Session, Skill } from "./schemas";

/** Half-open: `from` is included, `to` is not. ISO 8601 timestamps. */
export type TimeRange = { from: string; to: string };

export type Unsubscribe = () => void;

/** The skill every account starts with. Focus time with no skill goes here. */
export const DEFAULT_SKILL_NAME = "Focus";

/** Skill names are unique ignoring case, so the name marks the default. */
export const isDefaultSkill = (skill: { name: string }) =>
  skill.name.localeCompare(DEFAULT_SKILL_NAME, undefined, {
    sensitivity: "accent",
  }) === 0;

export interface SkillRepository {
  list(options?: { includeArchived?: boolean }): Promise<Skill[]>;
  get(id: string): Promise<Skill | undefined>;
  create(input: { name: string }): Promise<Skill>;
  update(
    id: string,
    patch: Partial<Pick<Skill, "name" | "archivedAt">>,
  ): Promise<Skill>;
  remove(id: string): Promise<void>;
  /** The default skill, created or restored when it is missing. */
  ensureDefault(): Promise<Skill>;
  subscribe(listener: () => void): Unsubscribe;
}

export interface SessionRepository {
  /** Every live session, oldest first. */
  listAll(): Promise<Session[]>;
  listBySkill(skillId: string, range?: TimeRange): Promise<Session[]>;
  listRecent(limit: number): Promise<Session[]>;
  add(session: NewSession): Promise<Session>;
  remove(id: string): Promise<void>;
  subscribe(listener: () => void): Unsubscribe;
}

export type Repositories = {
  skills: SkillRepository;
  sessions: SessionRepository;
};

export class DuplicateSkillNameError extends Error {
  constructor(readonly skillName: string) {
    super(`You already have a skill called "${skillName}".`);
    this.name = "DuplicateSkillNameError";
  }
}

export class DefaultSkillError extends Error {
  constructor() {
    super(
      `${DEFAULT_SKILL_NAME} is the default skill: it cannot be renamed, archived or deleted.`,
    );
    this.name = "DefaultSkillError";
  }
}

export class RecordNotFoundError extends Error {
  constructor(
    readonly kind: "skill" | "session",
    readonly id: string,
  ) {
    super(`No ${kind} with id ${id}.`);
    this.name = "RecordNotFoundError";
  }
}
