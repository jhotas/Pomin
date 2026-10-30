"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useSettings } from "@/data/hooks";
import { useAppData, type AppData } from "@/data/provider";
import {
  DEFAULT_TIMER_SETTINGS,
  initialTimerState,
  remainingMs,
  type TimerAction,
  type TimerEvent,
} from "./core/timer";
import type { TimerSnapshot } from "./timer-store";

const SERVER_SNAPSHOT: TimerSnapshot = {
  state: initialTimerState(DEFAULT_TIMER_SETTINGS),
  skillId: null,
};
const noSubscription = () => () => {};

/** How often a running timer re-renders. Correctness does not depend on it. */
const TICK_MS = 250;

/**
 * The clock is read only in the browser. On the server the timer is always the
 * idle server snapshot, which does not depend on time, and reading the clock
 * there would freeze it into the prerendered page.
 */
function browserNow(): number {
  return typeof window === "undefined" ? 0 : Date.now();
}

function recordSessions(
  data: AppData,
  events: TimerEvent[],
  skillId: string | null,
) {
  if (!skillId) return;
  for (const event of events) {
    if (event.type !== "focusEnded") continue;
    data.sessions
      .add({
        skillId,
        startedAt: new Date(event.startedAt).toISOString(),
        endedAt: new Date(event.endedAt).toISOString(),
        focusedSeconds: Math.round(event.focusedMs / 1000),
        plannedSeconds: Math.round(event.plannedMs / 1000),
        outcome: event.outcome,
      })
      .catch((error: unknown) => {
        // The skill was deleted mid-block; there is nothing to attach it to.
        console.error("Could not record the session", error);
      });
  }
}

export function useTimer() {
  const data = useAppData();
  const store = data?.timer;
  const snapshot = useSyncExternalStore(
    store?.subscribe ?? noSubscription,
    () => store?.get() ?? SERVER_SNAPSHOT,
    () => SERVER_SNAPSHOT,
  );
  const [settings] = useSettings();
  const [now, setNow] = useState(browserNow);

  const dispatch = useCallback(
    (type: TimerAction["type"]) => {
      if (!data) return;
      // The block belongs to the skill it ran under, read before the action.
      const skillId = data.timer.get().skillId;
      const at = Date.now();
      const events = data.timer.dispatch({ type }, at);
      setNow(at);
      recordSessions(data, events, skillId);
    },
    [data],
  );

  useEffect(() => {
    store?.applySettings();
  }, [store, settings]);

  const running = snapshot.state.status === "running";
  useEffect(() => {
    if (!store) return;
    // Replays any phase that ended while the tab was closed.
    const tick = () => dispatch("tick");
    const frame = requestAnimationFrame(tick);
    if (!running) return () => cancelAnimationFrame(frame);
    const interval = setInterval(tick, TICK_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [store, running, dispatch]);

  const { state, skillId } = snapshot;

  // A focus block runs without a skill too; it is then not recorded.
  const toggle = useCallback(() => {
    const status = data?.timer.get().state.status;
    if (status === "running") dispatch("pause");
    else if (status === "paused") dispatch("resume");
    else dispatch("start");
  }, [data, dispatch]);

  return {
    ready: data !== null,
    now,
    state,
    skillId,
    remainingMs: remainingMs(state, now),
    toggle,
    skip: useCallback(() => dispatch("skip"), [dispatch]),
    reset: useCallback(() => dispatch("reset"), [dispatch]),
    selectSkill: useCallback(
      (id: string | null) => data?.timer.selectSkill(id) ?? false,
      [data],
    ),
  };
}
