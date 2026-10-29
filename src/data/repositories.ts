import type { NewSession, Session, Skill } from "./schemas";

/** Half-open: `from` is included, `to` is not. ISO 8601 timestamps. */
export type TimeRange = { from: string; to: string };

export type Unsubscribe = () => void;

export interface SkillRepository {
  list(options?: { includeArchived?: boolean }): Promise<Skill[]>;
  get(id: string): Promise<Skill | undefined>;
  create(input: { name: string }): Promise<Skill>;
  update(
    id: string,
    patch: Partial<Pick<Skill, "name" | "archivedAt">>,
  ): Promise<Skill>;
  remove(id: string): Promise<void>;
  subscribe(listener: () => void): Unsubscribe;
}

export interface SessionRepository {
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

export class RecordNotFoundError extends Error {
  constructor(
    readonly kind: "skill" | "session",
    readonly id: string,
  ) {
    super(`No ${kind} with id ${id}.`);
    this.name = "RecordNotFoundError";
  }
}
