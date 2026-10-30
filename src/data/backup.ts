import { z } from "zod";
import type { PomoDatabase } from "./dexie/database";
import { isLive, sameName } from "./dexie/repositories";
import type { ChangeNotifier } from "./notifier";
import {
  SessionSchema,
  SettingsSchema,
  SkillSchema,
  type Session,
  type Skill,
} from "./schemas";
import type { SettingsStore } from "./settings-store";

/** A whole copy of one browser's data, as a JSON file. */
export const BackupSchema = z.object({
  app: z.literal("pomoapp"),
  version: z.literal(1),
  exportedAt: z.iso.datetime(),
  skills: z.array(SkillSchema),
  sessions: z.array(SessionSchema),
  settings: SettingsSchema,
});
export type Backup = z.infer<typeof BackupSchema>;

export type ImportResult = { skills: number; sessions: number };

export type BackupService = {
  /** Every live skill (archived ones too), session and setting. */
  export(): Promise<Backup>;
  /**
   * Merges a backup into this browser's data; nothing is deleted. A skill
   * already here (same id, or same name) keeps the later of the two copies,
   * and its imported sessions join it. Returns what was added or updated.
   */
  import(backup: Backup): Promise<ImportResult>;
};

export function createBackupService({
  db,
  notifier,
  settings,
  now = () => new Date(),
}: {
  db: PomoDatabase;
  notifier: ChangeNotifier;
  settings: SettingsStore;
  now?: () => Date;
}): BackupService {
  return {
    async export() {
      const [skills, sessions] = await Promise.all([
        db.skills.filter(isLive).toArray(),
        db.sessions.orderBy("startedAt").filter(isLive).toArray(),
      ]);
      return {
        app: "pomoapp",
        version: 1,
        exportedAt: now().toISOString(),
        skills,
        sessions,
        settings: settings.get(),
      };
    },

    async import(backup) {
      // Written rows are stamped now, so sync uploads them like any change.
      const at = now().toISOString();
      const result = await db.transaction(
        "rw",
        db.skills,
        db.sessions,
        async () => {
          const local = (await db.skills.toArray()).filter(isLive);
          // Imported skill id -> the id its sessions belong to here.
          const skillIds = new Map<string, string>();
          let skillCount = 0;

          for (const skill of backup.skills.filter(isLive)) {
            const here = local.find((row) => row.id === skill.id);
            if (here) {
              skillIds.set(skill.id, here.id);
              if (here.updatedAt < skill.updatedAt) {
                await db.skills.put({ ...skill, updatedAt: at });
                skillCount++;
              }
              continue;
            }
            const namesake = local.find((row) =>
              sameName(row.name, skill.name),
            );
            if (namesake) {
              skillIds.set(skill.id, namesake.id);
              continue;
            }
            const added: Skill = { ...skill, deletedAt: null, updatedAt: at };
            await db.skills.put(added);
            local.push(added);
            skillIds.set(skill.id, skill.id);
            skillCount++;
          }

          let sessionCount = 0;
          for (const session of backup.sessions.filter(isLive)) {
            const skillId = skillIds.get(session.skillId);
            if (!skillId) continue;
            const here = await db.sessions.get(session.id);
            if (here && isLive(here) && here.updatedAt >= session.updatedAt) {
              continue;
            }
            // One block of one skill starts at one moment, as on add.
            const twin = await db.sessions
              .where("skillId")
              .equals(skillId)
              .filter(
                (row) =>
                  isLive(row) &&
                  row.id !== session.id &&
                  row.startedAt === session.startedAt,
              )
              .first();
            if (twin) continue;
            const added: Session = {
              ...session,
              skillId,
              deletedAt: null,
              updatedAt: at,
            };
            await db.sessions.put(added);
            sessionCount++;
          }

          return { skills: skillCount, sessions: sessionCount };
        },
      );
      settings.update(backup.settings);
      if (result.skills > 0 || result.sessions > 0) notifier.notify();
      return result;
    },
  };
}
