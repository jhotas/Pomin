import { z } from "zod";
import {
  applySettings,
  initialTimerState,
  timerReducer,
  type TimerAction,
  type TimerEvent,
  type TimerSettings,
  type TimerState,
} from "./core/timer";

export const TIMER_KEY = "pomoapp:timer";

/** The timer and the skill its current block belongs to. */
export type TimerSnapshot = { state: TimerState; skillId: string | null };

export type TimerStore = {
  /** The current snapshot; the same object until it changes. */
  get(): TimerSnapshot;
  /** Runs an action at `now` and returns the events the caller must handle. */
  dispatch(action: TimerAction, now: number): TimerEvent[];
  /** Chooses the skill for the next block. Refused while a block is under way. */
  selectSkill(skillId: string | null): boolean;
  /** Moves the current block to another skill, when two skills were merged. */
  replaceSkill(from: string, to: string): void;
  /** Drops the block under way and the chosen skill, as after a sign-out. */
  clear(): void;
  /** Re-reads the settings; an idle phase takes the new length. */
  applySettings(): void;
  subscribe(listener: () => void): () => void;
};

const Phase = z.enum(["focus", "shortBreak", "longBreak"]);
const Instant = z.number().int().nonnegative();

const SnapshotSchema = z.object({
  state: z.object({
    phase: Phase,
    status: z.enum(["idle", "running", "paused"]),
    plannedMs: z.number().int().positive(),
    accumulatedMs: z.number().nonnegative(),
    runningSince: Instant.nullable(),
    phaseStartedAt: Instant.nullable(),
    completedFocusCount: z.number().int().nonnegative(),
  }),
  skillId: z.string().nullable(),
});

/**
 * Keeps the timer in `localStorage`, so a reload or a closed tab resumes
 * where it was, and follows changes made in other tabs.
 */
export function createTimerStore(
  storage: Storage | undefined,
  getSettings: () => TimerSettings,
): TimerStore {
  const listeners = new Set<() => void>();
  let current = load();

  function load(): TimerSnapshot {
    const fresh = { state: initialTimerState(getSettings()), skillId: null };
    const stored = storage?.getItem(TIMER_KEY);
    if (!stored) return fresh;
    try {
      const parsed = SnapshotSchema.safeParse(JSON.parse(stored));
      return parsed.success ? parsed.data : fresh;
    } catch {
      return fresh;
    }
  }

  function commit(next: TimerSnapshot) {
    if (next === current) return;
    current = next;
    storage?.setItem(TIMER_KEY, JSON.stringify(next));
    for (const listener of listeners) listener();
  }

  function onStorage(event: StorageEvent) {
    if (event.key !== TIMER_KEY) return;
    current = load();
    for (const listener of listeners) listener();
  }

  return {
    get: () => current,

    dispatch(action, now) {
      const { state, events } = timerReducer(
        current.state,
        action,
        now,
        getSettings(),
      );
      if (state !== current.state) commit({ ...current, state });
      return events;
    },

    selectSkill(skillId) {
      if (current.state.status !== "idle") return false;
      if (skillId !== current.skillId) commit({ ...current, skillId });
      return true;
    },

    replaceSkill(from, to) {
      if (current.skillId === from) commit({ ...current, skillId: to });
    },

    clear() {
      commit({ state: initialTimerState(getSettings()), skillId: null });
    },

    applySettings() {
      const state = applySettings(current.state, getSettings());
      if (state !== current.state) commit({ ...current, state });
    },

    subscribe(listener) {
      if (listeners.size === 0 && typeof window !== "undefined") {
        window.addEventListener("storage", onStorage);
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && typeof window !== "undefined") {
          window.removeEventListener("storage", onStorage);
        }
      };
    },
  };
}
