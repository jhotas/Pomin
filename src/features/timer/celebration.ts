"use client";

import { useSyncExternalStore } from "react";
import type { TimerEvent } from "./core/timer";
import { freshPhaseEnd } from "./phase-alerts";

/** How Pomo marks a finished focus block: a cheer, or a bigger one for the round. */
export type Cheer = "block" | "round";

/** As long as the pomo-cheer-* animations in globals.css. */
const CHEER_MS: Record<Cheer, number> = { block: 1600, round: 2400 };

let current: Cheer | null = null;
let timeout: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function set(next: Cheer | null) {
  current = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Starts Pomo's cheer when a focus block ended just now, run out or skipped,
 * like the chime. Nothing for the end of a break, for a phase replayed after
 * the tab was closed, or for anyone who asks for reduced motion.
 */
export function cheerPhaseEnd(events: TimerEvent[], now: number) {
  const ended = freshPhaseEnd(events, now);
  if (ended?.from !== "focus") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cheer = ended.to === "longBreak" ? "round" : "block";
  clearTimeout(timeout);
  set(cheer);
  timeout = setTimeout(() => set(null), CHEER_MS[cheer]);
}

/** The cheer Pomo is playing right now, if any. */
export function useCheer(): Cheer | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}
