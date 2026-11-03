"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { useSettings, useSkills } from "@/data/hooks";
import { isDefaultSkill } from "@/data/repositories";
import { formatClock } from "@/lib/time";
import { useDocumentTitle } from "@/lib/use-document-title";
import { iconButtonClass } from "@/ui/button";
import { PHASE_COLOR, PHASE_LABEL } from "../phase";
import { useTimer } from "../use-timer";
import { useTimerShortcuts } from "../use-timer-shortcuts";
import { ClockRing } from "./clock-ring";
import { RoundTomatoes } from "./round-tomatoes";
import { ShortcutsHint } from "./shortcuts-hint";
import { SkillPicker } from "./skill-picker";
import { PomoPerch, TimerArt } from "./timer-art";

/**
 * The home page, over the phase's colour from the shell: the countdown in its
 * ring with start, pause and reset under the time and the skill under the
 * ring on the left, and Pomo on the right (on phones, sitting on the ring).
 * Space, S and R work as everywhere, listed in a pill that rises from the
 * bottom edge on hover.
 */
export function TimerScreen() {
  const timer = useTimer();
  const { state, skillId } = timer;
  const skills = useSkills();
  const [settings] = useSettings();

  // Keep a valid skill selected while the timer is idle, the default first.
  const { selectSkill } = timer;
  useEffect(() => {
    if (skills.status !== "success" || state.status !== "idle") return;
    if (skills.data.some((candidate) => candidate.id === skillId)) return;
    const fallback = skills.data.find(isDefaultSkill) ?? skills.data[0];
    selectSkill(fallback?.id ?? null);
  }, [skills, skillId, state.status, selectSkill]);

  useTimerShortcuts(timer);

  // The timer fills the window and never scrolls. Next keeps a page that was
  // left in the document, hidden, so the mark goes on <html>, and only while
  // this page is shown: a hidden page's effects are cleaned up.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.fullpage = "";
    return () => {
      delete root.dataset.fullpage;
    };
  }, []);

  const phaseLabel = PHASE_LABEL[state.phase];
  const clock = formatClock(timer.remainingMs);
  useDocumentTitle(
    state.status === "idle" ? null : `${clock} · ${phaseLabel} · pomoapp`,
  );

  const colors = PHASE_COLOR[state.phase];
  const running = state.status === "running";
  // The round fills as focus blocks complete, and stays full through its
  // long break.
  const round = Math.max(1, settings.longBreakEvery);
  const done =
    state.phase === "longBreak" ? round : state.completedFocusCount % round;
  // Pomo works through a running focus block and rests through the breaks.
  const mood =
    state.phase !== "focus" ? "resting" : running ? "focused" : "happy";
  const share = 1 - timer.remainingMs / state.plannedMs;

  return (
    <>
      <h1 className="sr-only">Timer</h1>
      <section
        aria-label="Timer"
        className="grid h-full content-center items-center gap-8 md:grid-cols-2"
      >
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <ClockRing
            clock={clock}
            share={share}
            stroke={colors.stroke}
            status={`${phaseLabel}, ${state.status}`}
            above={<RoundTomatoes done={done} total={round} />}
            perch={<PomoPerch mood={mood} share={share} />}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={timer.toggle}
                disabled={!timer.ready || running}
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
          <SkillPicker
            skillId={skillId}
            locked={!timer.ready || state.status !== "idle"}
            onSelect={timer.selectSkill}
          />
        </div>
        <TimerArt mood={mood} share={share} />
      </section>
      <ShortcutsHint />
    </>
  );
}
