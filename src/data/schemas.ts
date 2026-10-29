import { z } from "zod";
import { DEFAULT_TIMER_SETTINGS } from "@/features/timer/core/timer";

/**
 * Domain schemas. They validate every value crossing a boundary (storage,
 * import, later the network) and are the source of the domain types.
 */

const Timestamp = z.iso.datetime();
const Id = z.uuid();

const Record = {
  createdAt: Timestamp,
  updatedAt: Timestamp,
  deletedAt: Timestamp.nullable(),
};

export const SkillNameSchema = z.string().trim().min(1).max(60);

export const SkillSchema = z.object({
  id: Id,
  name: SkillNameSchema,
  targetHours: z.number().int().positive().default(10_000),
  archivedAt: Timestamp.nullable(),
  ...Record,
});
export type Skill = z.infer<typeof SkillSchema>;

const sessionFields = {
  skillId: Id,
  startedAt: Timestamp,
  endedAt: Timestamp,
  focusedSeconds: z.number().int().nonnegative(),
  plannedSeconds: z.number().int().positive(),
  outcome: z.enum(["completed", "interrupted"]),
};

const endsAfterStart = (session: { startedAt: string; endedAt: string }) =>
  Date.parse(session.endedAt) >= Date.parse(session.startedAt);
const endsAfterStartError = {
  message: "A session cannot end before it starts",
  path: ["endedAt"],
};

export const NewSessionSchema = z
  .object(sessionFields)
  .refine(endsAfterStart, endsAfterStartError);
export type NewSession = z.infer<typeof NewSessionSchema>;

export const SessionSchema = z
  .object({ id: Id, ...sessionFields, ...Record })
  .refine(endsAfterStart, endsAfterStartError);
export type Session = z.infer<typeof SessionSchema>;

const Minutes = z.number().int().min(1).max(180);

export const SettingsSchema = z.object({
  focusMinutes: Minutes.default(DEFAULT_TIMER_SETTINGS.focusMinutes),
  shortBreakMinutes: Minutes.default(DEFAULT_TIMER_SETTINGS.shortBreakMinutes),
  longBreakMinutes: Minutes.default(DEFAULT_TIMER_SETTINGS.longBreakMinutes),
  longBreakEvery: z
    .number()
    .int()
    .min(1)
    .max(12)
    .default(DEFAULT_TIMER_SETTINGS.longBreakEvery),
  autoStartBreaks: z.boolean().default(DEFAULT_TIMER_SETTINGS.autoStartBreaks),
  autoStartFocus: z.boolean().default(DEFAULT_TIMER_SETTINGS.autoStartFocus),
  soundEnabled: z.boolean().default(true),
});
export type Settings = z.infer<typeof SettingsSchema>;

export const DEFAULT_SETTINGS: Settings = SettingsSchema.parse({});
