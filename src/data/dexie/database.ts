import Dexie, { type EntityTable } from "dexie";
import type { Session, Skill } from "../schemas";

export class PomoDatabase extends Dexie {
  skills!: EntityTable<Skill, "id">;
  sessions!: EntityTable<Session, "id">;

  constructor(name = "pomoapp") {
    super(name);
    // Schema changes add a new version; never edit a released one.
    this.version(1).stores({
      skills: "id",
      sessions: "id, skillId, startedAt",
    });
  }
}
