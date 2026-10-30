"use client";

import { useTimer } from "../use-timer";

/**
 * Keeps the timer going on every page, so a phase that runs out ends, sounds
 * and is recorded wherever the person is. Renders nothing.
 */
export function TimerHeartbeat() {
  useTimer();
  return null;
}
