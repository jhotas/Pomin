import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { PomoDatabase } from "@/data/dexie/database";
import { isLive, sameName } from "@/data/dexie/repositories";
import type { ChangeNotifier } from "@/data/notifier";
import type { Session, Skill } from "@/data/schemas";
import {
  PullResultSchema,
  sessionFromRow,
  sessionToRow,
  skillFromRow,
  skillToRow,
} from "./remote-rows";

export type SyncState = {
  phase: "idle" | "syncing" | "error";
  lastSyncedAt: string | null;
  error: string | null;
};

export type SkillMerge = { from: string; to: string };

export type SyncEngine = {
  /** Pushes local changes, then pulls remote ones. Calls made while a run is under way queue one more run. */
  syncNow(): Promise<void>;
  /** Stops listening for changes and timers. */
  stop(): void;
};

type SyncEngineOptions = {
  supabase: SupabaseClient;
  db: PomoDatabase;
  notifier: ChangeNotifier;
  storage: Storage;
  userId: string;
  onState: (state: SyncState) => void;
  /** A local skill was folded into the account's skill of the same name. */
  onSkillMerged: (merge: SkillMerge) => void;
};

const PUSH_DELAY_MS = 1_500;
const PULL_EVERY_MS = 60_000;
const SESSIONS_PER_PUSH = 500;
/**
 * The push cursor is the local clock when a push began, less this margin, so a
 * write committing while the push read its rows is sent again next time.
 * Re-sending a row is harmless: the server keeps the later `updatedAt`.
 */
const PUSH_MARGIN_MS = 10_000;

const CursorSchema = z.object({
  pushedThrough: z.string(),
  pulledAt: z.string(),
  lastSyncedAt: z.string(),
});
type Cursor = z.infer<typeof CursorSchema>;

export const cursorKey = (userId: string) => `pomoapp:sync:${userId}`;

/**
 * Two-way sync between this browser's IndexedDB and the account's tables.
 * IndexedDB stays the source the app reads; the account is a copy every
 * device converges on. Each record keeps the version written last.
 */
export function createSyncEngine({
  supabase,
  db,
  notifier,
  storage,
  userId,
  onState,
  onSkillMerged,
}: SyncEngineOptions): SyncEngine {
  let running: Promise<void> | null = null;
  let again = false;
  let stopped = false;
  let applyingPull = false;
  let pushTimer: ReturnType<typeof setTimeout> | undefined;
  let state: SyncState = {
    phase: "idle",
    lastSyncedAt: loadCursor()?.lastSyncedAt ?? null,
    error: null,
  };

  function setState(next: SyncState) {
    state = next;
    onState(next);
  }

  function loadCursor(): Cursor | null {
    try {
      const parsed = CursorSchema.safeParse(
        JSON.parse(storage.getItem(cursorKey(userId)) ?? "null"),
      );
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }

  function saveCursor(cursor: Cursor) {
    storage.setItem(cursorKey(userId), JSON.stringify(cursor));
  }

  async function push(cursor: Cursor | null): Promise<string> {
    const startedAt = Date.now();
    const skills: Skill[] = cursor
      ? await db.skills.where("updatedAt").above(cursor.pushedThrough).toArray()
      : await db.skills.toArray();
    const sessions: Session[] = cursor
      ? await db.sessions
          .where("updatedAt")
          .above(cursor.pushedThrough)
          .toArray()
      : await db.sessions.toArray();

    // Skills go first: a session can only reference a skill the account has.
    if (skills.length > 0) await pushBatch(skills, []);
    for (let at = 0; at < sessions.length; at += SESSIONS_PER_PUSH) {
      await pushBatch([], sessions.slice(at, at + SESSIONS_PER_PUSH));
    }
    return new Date(startedAt - PUSH_MARGIN_MS).toISOString();
  }

  async function pushBatch(skills: Skill[], sessions: Session[]) {
    const { error } = await supabase.rpc("push_changes", {
      p_skills: skills.map(skillToRow),
      p_sessions: sessions.map(sessionToRow),
    });
    if (error) throw new Error(error.message);
  }

  async function pull(cursor: Cursor | null): Promise<string> {
    const { data, error } = await supabase.rpc("pull_changes", {
      p_since: cursor?.pulledAt ?? null,
    });
    if (error) throw new Error(error.message);
    const result = PullResultSchema.parse(data);
    const skills = result.skills
      .map(skillFromRow)
      .filter((skill) => skill !== null);
    const sessions = result.sessions
      .map(sessionFromRow)
      .filter((session) => session !== null);

    const merges = await db.transaction(
      "rw",
      db.skills,
      db.sessions,
      async () => {
        const newerSkills = newer(await db.skills.bulkGet(ids(skills)), skills);
        await db.skills.bulkPut(newerSkills);
        const newerSessions = newer(
          await db.sessions.bulkGet(ids(sessions)),
          sessions,
        );
        await db.sessions.bulkPut(newerSessions);
        // The first sync of this browser folds its skills into the account's
        // skills of the same name, so practice logged on two devices before
        // signing in adds up under one skill.
        return cursor ? [] : await mergeSameNamedSkills(skills);
      },
    );

    if (skills.length > 0 || sessions.length > 0 || merges.length > 0) {
      applyingPull = true;
      try {
        notifier.notify();
      } finally {
        applyingPull = false;
      }
    }
    for (const merge of merges) onSkillMerged(merge);
    return result.pulled_at;
  }

  async function mergeSameNamedSkills(remote: Skill[]): Promise<SkillMerge[]> {
    const remoteIds = new Set(remote.map((skill) => skill.id));
    const accountSkills = remote.filter(isLive);
    const localOnly = (await db.skills.toArray()).filter(
      (skill) => isLive(skill) && !remoteIds.has(skill.id),
    );
    const merges: SkillMerge[] = [];
    const at = new Date().toISOString();
    for (const local of localOnly) {
      const target = accountSkills.find((skill) =>
        sameName(skill.name, local.name),
      );
      if (!target) continue;
      await db.sessions
        .where("skillId")
        .equals(local.id)
        .modify({ skillId: target.id, updatedAt: at });
      await db.skills.put({ ...local, deletedAt: at, updatedAt: at });
      merges.push({ from: local.id, to: target.id });
    }
    return merges;
  }

  async function run() {
    setState({ ...state, phase: "syncing", error: null });
    try {
      const cursor = loadCursor();
      let pushedThrough: string;
      let pulledAt: string;
      if (cursor) {
        pushedThrough = await push(cursor);
        pulledAt = await pull(cursor);
      } else {
        // First sync: take the account's data first, so same-named skills
        // merge before anything is uploaded.
        pulledAt = await pull(null);
        pushedThrough = await push(null);
      }
      if (stopped) return;
      const lastSyncedAt = new Date().toISOString();
      saveCursor({ pushedThrough, pulledAt, lastSyncedAt });
      setState({ phase: "idle", lastSyncedAt, error: null });
    } catch (error) {
      if (stopped) return;
      setState({ ...state, phase: "error", error: describe(error) });
    }
  }

  async function syncNow(): Promise<void> {
    if (stopped) return;
    if (running) {
      again = true;
      return running;
    }
    running = (async () => {
      do {
        again = false;
        await run();
      } while (again && !stopped);
    })();
    try {
      await running;
    } finally {
      running = null;
    }
  }

  function schedulePush() {
    if (applyingPull || stopped) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => void syncNow(), PUSH_DELAY_MS);
  }

  const syncSoon = () => {
    if (document.visibilityState === "visible") void syncNow();
  };

  const unsubscribe = notifier.subscribe(schedulePush);
  const interval = setInterval(syncSoon, PULL_EVERY_MS);
  window.addEventListener("online", syncSoon);
  window.addEventListener("focus", syncSoon);
  document.addEventListener("visibilitychange", syncSoon);
  onState(state);
  void syncNow();

  return {
    syncNow,
    stop() {
      stopped = true;
      clearTimeout(pushTimer);
      clearInterval(interval);
      unsubscribe();
      window.removeEventListener("online", syncSoon);
      window.removeEventListener("focus", syncSoon);
      document.removeEventListener("visibilitychange", syncSoon);
    },
  };
}

const ids = (rows: { id: string }[]) => rows.map((row) => row.id);

/** The remote rows that are new here or were written later than the local copy. */
function newer<T extends { updatedAt: string }>(
  local: (T | undefined)[],
  remote: T[],
): T[] {
  return remote.filter((row, index) => {
    const current = local[index];
    return !current || current.updatedAt < row.updatedAt;
  });
}

function describe(error: unknown): string {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "You are offline. Changes stay in this browser and sync when you are back online.";
  }
  const message = error instanceof Error ? error.message : String(error);
  return message ? `Sync failed: ${message}` : "Sync failed.";
}
