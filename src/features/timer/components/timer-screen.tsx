"use client";

import { useEffect } from "react";
import { useSkills } from "@/data/hooks";
import { formatClock } from "@/lib/time";
import { useDocumentTitle } from "@/lib/use-document-title";
import { PHASE_COLOR, PHASE_LABEL } from "../phase";
import { useTimer } from "../use-timer";
import { useTimerShortcuts } from "../use-timer-shortcuts";
import { ClockRing } from "./clock-ring";
import { TimerArt } from "./timer-art";

/**
 * The home page: the countdown in its ring on the left and a slot for an
 * illustration on the right, nothing else. The ring starts and pauses the
 * timer; Space, S and R work as everywhere.
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
  const action =
    state.status === "running"
      ? "Pause"
      : state.status === "paused"
        ? "Resume"
        : "Start";

  return (
    <>
      <h1 className="sr-only">Timer</h1>
      <section
        aria-label="Timer"
        className={`grid items-center gap-8 card px-5 py-8 md:min-h-[calc(100dvh-10rem)] md:grid-cols-2 md:px-10 ${colors.field}`}
      >
        <div className="flex justify-center">
          <ClockRing
            clock={clock}
            share={1 - timer.remainingMs / state.plannedMs}
            stroke={colors.stroke}
            status={`${phaseLabel}, ${state.status}`}
            action={`${action} ${phaseLabel.toLowerCase()}`}
            onToggle={timer.toggle}
            disabled={!timer.ready || !timer.canStart}
          />
        </div>
        <TimerArt />
      </section>
    </>
  );
}
