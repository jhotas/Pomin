"use client";

import Link from "next/link";
import { useEffect, useId } from "react";
import { useSettings, useSkills, useSkillSessions } from "@/data/hooks";
import { SkillProgressPanel } from "@/features/progress/skill-progress-panel";
import { totalFocusedSeconds } from "@/features/progress/progress";
import { TodaySessions } from "@/features/sessions/today-sessions";
import { AddSkillForm } from "@/features/skills/add-skill-form";
import { dayRange, formatClock, formatDuration } from "@/lib/time";
import { useDocumentTitle } from "@/lib/use-document-title";
import { buttonClass } from "@/ui/button";
import { PHASE_COLOR, PHASE_LABEL } from "../phase";
import { useTimer } from "../use-timer";
import { useTimerShortcuts } from "../use-timer-shortcuts";
import { ClockRing } from "./clock-ring";
import { TimerArt } from "./timer-art";

export function TimerScreen() {
  const timer = useTimer();
  const [settings] = useSettings();
  const { state, skillId } = timer;
  const skills = useSkills();
  const skillList = skills.data ?? [];
  const skill = skillList.find((candidate) => candidate.id === skillId);
  const allSessions = useSkillSessions(skillId ?? "");
  const today = useSkillSessions(skillId ?? "", dayRange(new Date(timer.now)));
  const pickerId = useId();

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

  const elapsedShare = 1 - timer.remainingMs / state.plannedMs;
  const underWay = state.status !== "idle";
  const firstRun = skills.status === "success" && skillList.length === 0;
  const todaySessions = today.data ?? [];

  const finding = firstRun
    ? "Name the skill you are practising to start your first block."
    : skill
      ? todaySessions.length === 0
        ? "Nothing logged today yet."
        : `${todaySessions.length} ${
            todaySessions.length === 1 ? "session" : "sessions"
          } today, ${formatDuration(totalFocusedSeconds(todaySessions))} focused.`
      : undefined;

  const colors = PHASE_COLOR[state.phase];

  return (
    <>
      <h1 className="sr-only">Timer</h1>
      <section
        aria-label="Timer"
        className={`grid items-center gap-8 card px-5 py-8 md:min-h-[calc(100dvh-10rem)] md:grid-cols-2 md:px-10 ${colors.field}`}
      >
        <div className="flex flex-col items-center gap-6">
          <ClockRing
            clock={clock}
            share={elapsedShare}
            stroke={colors.stroke}
            label={phaseLabel}
            detail={
              state.phase === "focus"
                ? `Block ${(state.completedFocusCount % settings.longBreakEvery) + 1} of ${settings.longBreakEvery}`
                : null
            }
          />

          <div className="flex w-full max-w-md flex-col items-center gap-4">
            {firstRun ? (
              <div className="w-full">
                <AddSkillForm
                  variant="primary"
                  onAdded={(added) => timer.selectSkill(added.id)}
                />
              </div>
            ) : (
              <div className="w-full">
                <label htmlFor={pickerId} className="sr-only">
                  Skill
                </label>
                <select
                  id={pickerId}
                  value={skillId ?? ""}
                  disabled={underWay || skills.status !== "success"}
                  onChange={(event) =>
                    timer.selectSkill(event.target.value || null)
                  }
                  className="field w-full rounded-full text-center font-display text-section font-medium disabled:opacity-60"
                >
                  {skillList.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={timer.toggle}
                disabled={!timer.ready || !timer.canStart}
                className={`${buttonClass("primary")} h-14 min-w-36 text-section disabled:opacity-50`}
              >
                {state.status === "running"
                  ? "Pause"
                  : state.status === "paused"
                    ? "Resume"
                    : "Start"}
              </button>
              <button
                type="button"
                onClick={timer.skip}
                disabled={!timer.ready}
                className={buttonClass("secondary")}
              >
                Skip
              </button>
              <button
                type="button"
                onClick={timer.reset}
                disabled={!timer.ready || !underWay}
                className={`${buttonClass("text")} disabled:text-muted disabled:no-underline`}
              >
                Reset
              </button>
            </div>
            <p className="hidden text-small text-muted md:block">
              <Key>Space</Key> start or pause · <Key>S</Key> skip · <Key>R</Key>{" "}
              reset
            </p>
          </div>
        </div>

        <TimerArt />
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-3 lg:items-start">
        <section
          aria-labelledby="today-skill-title"
          className="card bg-surface p-5 md:p-7 lg:col-span-2"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id="today-skill-title" className="text-section font-semibold">
                {skill?.name ?? "Your skills"}
              </h2>
              {finding && <p className="mt-1 text-muted">{finding}</p>}
            </div>
            <Link href="/skills" className={buttonClass("secondary")}>
              Manage skills
            </Link>
          </div>
          {!firstRun && (
            <div className="mt-5 border-t-2 border-dashed border-rule pt-5">
              <TodaySessions sessions={todaySessions} />
            </div>
          )}
        </section>

        <SkillProgressPanel skill={skill} sessions={allSessions.data ?? []} />
      </div>
    </>
  );
}

function Key({ children }: { children: string }) {
  return (
    <kbd className="rounded-md border-2 border-text bg-surface px-1.5 font-sans text-small font-bold">
      {children}
    </kbd>
  );
}
