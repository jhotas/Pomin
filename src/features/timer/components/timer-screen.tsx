"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { useSkills } from "@/data/hooks";
import { formatClock } from "@/lib/time";
import { useDocumentTitle } from "@/lib/use-document-title";
import { iconButtonClass } from "@/ui/button";
import { PHASE_COLOR, PHASE_LABEL } from "../phase";
import { useTimer } from "../use-timer";
import { useTimerShortcuts } from "../use-timer-shortcuts";
import { ClockRing } from "./clock-ring";
import { TimerArt } from "./timer-art";

/**
 * The home page: the phase's colour over the whole page, the countdown in its
 * ring with start, pause and reset under the time on the left, and a slot for
 * an illustration on the right. Space, S and R work as everywhere.
 */
export function TimerScreen() {
  const timer = useTimer();
  const { state, skillId } = timer;
  const skills = useSkills();

  // Keep a valid skill selected while the timer is idle.
  const { selectSkill } = timer;
  useEffect(() => {
    if (skills.status !== "success" || state.status !== "idle") return;
    if (skills.data.some((candidate) => candidate.id === skillId)) return;
    selectSkill(skills.data[0]?.id ?? null);
  }, [skills, skillId, state.status, selectSkill]);

  useTimerShortcuts(timer);

  const phaseLabel = PHASE_LABEL[state.phase];
  const clock = formatClock(timer.remainingMs);
  useDocumentTitle(
    state.status === "idle" ? null : `${clock} · ${phaseLabel} · pomoapp`,
  );

  const colors = PHASE_COLOR[state.phase];
  const running = state.status === "running";

  return (
    <>
      <h1 className="sr-only">Timer</h1>
      {/* The phase's colour fills the whole page, behind the menu too. */}
      <div aria-hidden className={`fixed inset-0 -z-10 ${colors.field}`} />
      <section
        aria-label="Timer"
        className="grid items-center gap-8 py-4 md:min-h-[calc(100dvh-9rem)] md:grid-cols-2"
      >
        <div className="flex justify-center">
          <ClockRing
            clock={clock}
            share={1 - timer.remainingMs / state.plannedMs}
            stroke={colors.stroke}
            status={`${phaseLabel}, ${state.status}`}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={timer.toggle}
                disabled={!timer.ready || !timer.canStart || running}
                aria-label={state.status === "paused" ? "Resume" : "Start"}
                className={iconButtonClass("primary")}
              >
                <Play
                  aria-hidden
                  size={18}
                  strokeWidth={2.5}
                  fill="currentColor"
                />
              </button>
              <button
                type="button"
                onClick={timer.toggle}
                disabled={!timer.ready || !running}
                aria-label="Pause"
                className={iconButtonClass("secondary")}
              >
                <Pause
                  aria-hidden
                  size={18}
                  strokeWidth={2.5}
                  fill="currentColor"
                />
              </button>
              <button
                type="button"
                onClick={timer.reset}
                disabled={!timer.ready || state.status === "idle"}
                aria-label="Reset"
                className={iconButtonClass("secondary")}
              >
                <RotateCcw aria-hidden size={18} strokeWidth={2.5} />
              </button>
            </div>
          </ClockRing>
        </div>
        <TimerArt />
      </section>
    </>
  );
}
