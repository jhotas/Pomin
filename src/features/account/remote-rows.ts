import { z } from "zod";
import {
  SessionSchema,
  SkillSchema,
  type Session,
  type Skill,
} from "@/data/schemas";

/**
 * The shape of skills and sessions in Postgres (snake case, timestamps with an
 * offset) and the conversions to and from the domain types.
 */

const RemoteTimestamp = z.string().transform((value, context) => {
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) {
    context.addIssue({ code: "custom", message: "Not a timestamp" });
    return z.NEVER;
  }
  return new Date(ms).toISOString();
});

const RemoteRecord = {
  created_at: RemoteTimestamp,
  updated_at: RemoteTimestamp,
  deleted_at: RemoteTimestamp.nullable(),
};

const RemoteSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  target_hours: z.number(),
  archived_at: RemoteTimestamp.nullable(),
  ...RemoteRecord,
});

const RemoteSessionSchema = z.object({
  id: z.string(),
  skill_id: z.string(),
  started_at: RemoteTimestamp,
  ended_at: RemoteTimestamp,
  focused_seconds: z.number(),
  planned_seconds: z.number(),
  outcome: z.string(),
  ...RemoteRecord,
});

export const PullResultSchema = z.object({
  pulled_at: z.string(),
  skills: z.array(z.unknown()),
  sessions: z.array(z.unknown()),
});

/** A row that fails validation is skipped rather than failing the whole pull. */
export function skillFromRow(row: unknown): Skill | null {
  const remote = RemoteSkillSchema.safeParse(row);
  if (!remote.success) return null;
  const r = remote.data;
  const skill = SkillSchema.safeParse({
    id: r.id,
    name: r.name,
    targetHours: r.target_hours,
    archivedAt: r.archived_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at,
  });
  return skill.success ? skill.data : null;
}

export function sessionFromRow(row: unknown): Session | null {
  const remote = RemoteSessionSchema.safeParse(row);
  if (!remote.success) return null;
  const r = remote.data;
  const session = SessionSchema.safeParse({
    id: r.id,
    skillId: r.skill_id,
    startedAt: r.started_at,
    endedAt: r.ended_at,
    focusedSeconds: r.focused_seconds,
    plannedSeconds: r.planned_seconds,
    outcome: r.outcome,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at,
  });
  return session.success ? session.data : null;
}

export function skillToRow(skill: Skill) {
  return {
    id: skill.id,
    name: skill.name,
    target_hours: skill.targetHours,
    archived_at: skill.archivedAt,
    created_at: skill.createdAt,
    updated_at: skill.updatedAt,
    deleted_at: skill.deletedAt,
  };
}

export function sessionToRow(session: Session) {
  return {
    id: session.id,
    skill_id: session.skillId,
    started_at: session.startedAt,
    ended_at: session.endedAt,
    focused_seconds: session.focusedSeconds,
    planned_seconds: session.plannedSeconds,
    outcome: session.outcome,
    created_at: session.createdAt,
    updated_at: session.updatedAt,
    deleted_at: session.deletedAt,
  };
}
