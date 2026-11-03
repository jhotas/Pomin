import type { Settings } from "@/data/schemas";
import {
  playBreakOver,
  playPomoDone,
  playVictory,
} from "@/features/sound/chiptune";
import type { PhaseChanged, TimerEvent } from "./core/timer";
import { PHASE_LABEL } from "./phase";

/** A phase that ended longer ago than this (the tab was closed) stays quiet. */
const FRESH_MS = 10_000;

function notice(ended: PhaseChanged): { title: string; body: string } {
  if (ended.to === "longBreak") {
    return {
      title: "Round complete!",
      body: `Every focus block of the round is done. ${PHASE_LABEL.longBreak} next.`,
    };
  }
  if (ended.from === "focus") {
    return {
      title: "Focus block done",
      body: `Nice work. ${PHASE_LABEL[ended.to]} next.`,
    };
  }
  return { title: "Break's over", body: "Back to focus when you're ready." };
}

/**
 * The latest phase in `events` that ended just now, run out or skipped. A
 * phase that ended while the tab was closed is replayed late and not counted.
 */
export function freshPhaseEnd(
  events: TimerEvent[],
  now: number,
): PhaseChanged | undefined {
  return events.findLast(
    (event): event is PhaseChanged =>
      event.type === "phaseChanged" && now - event.at < FRESH_MS,
  );
}

/**
 * Marks the latest phase that ended just now, run out or skipped: a fanfare
 * for the end of a round, a chime for any other focus block, a call back to
 * work at the end of a break; and, while the tab is out of sight, a
 * notification.
 */
export function alertPhaseEnd(
  events: TimerEvent[],
  now: number,
  settings: Settings,
) {
  const ended = freshPhaseEnd(events, now);
  if (!ended) return;

  if (settings.soundEnabled) {
    if (ended.to === "longBreak") playVictory();
    else if (ended.from === "focus") playPomoDone();
    else playBreakOver();
  }

  if (
    settings.notificationsEnabled &&
    document.visibilityState === "hidden" &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    const { title, body } = notice(ended);
    new Notification(title, { body, icon: "/icon.svg", tag: "pomoapp-phase" });
  }
}
