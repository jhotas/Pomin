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
import { PageHeader } from "@/ui/page-header";
import { Pomo, type PomoMood } from "@/ui/pomo";
import type { Phase, TimerStatus } from "../core/timer";
import { PHASE_COLOR, PHASE_LABEL } from "../phase";
import { useTimer } from "../use-timer";
import { useTimerShortcuts } from "../use-timer-shortcuts";

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
        ? `${skill.name} · nothing logged today yet.`
        : `${skill.name} · ${todaySessions.length} ${
            todaySessions.length === 1 ? "session" : "sessions"
          } today, ${formatDuration(totalFocusedSeconds(todaySessions))} focused.`
      : undefined;

  const mood: PomoMood =
    state.phase !== "focus"
      ? "resting"
      : state.status === "running"
        ? "focused"
        : "happy";
  const colors = PHASE_COLOR[state.phase];

  return (
    <>
      <PageHeader title="Timer" description={finding} />
      <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
        <div className="grid gap-5 lg:col-span-2">
          <section
            aria-label="Timer"
            className={`card p-5 md:p-7 ${colors.field}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p
                aria-live="polite"
                className="rounded-full border-2 border-text bg-surface px-4 py-1 font-display text-section font-semibold"
              >
                {phaseLabel}
              </p>
              {state.phase === "focus" && (
                <p className="font-display font-medium num">
                  Block{" "}
                  {(state.completedFocusCount % settings.longBreakEvery) + 1} of{" "}
                  {settings.longBreakEvery}
                </p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div
                role="timer"
                aria-label="Time left"
                className="font-display text-clock font-semibold num"
              >
                {clock}
              </div>
              <div className="flex shrink-0 flex-col items-center">
                <p className="relative mb-3 hidden max-w-52 rounded-2xl border-2 border-text bg-surface px-3 py-2 text-center text-small font-semibold sm:block">
                  {pomoLine(state.phase, state.status, firstRun)}
                  <span
                    aria-hidden
                    className="absolute -bottom-[9px] left-1/2 size-4 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-text bg-surface"
                  />
                </p>
                <Pomo
                  mood={mood}
                  size={128}
                  className="size-16 animate-bob sm:size-32"
                />
              </div>
            </div>

            <div
              aria-hidden
              className="mt-6 h-5 overflow-hidden rounded-full border-2 border-text bg-surface"
            >
              <div
                className={`h-full border-r-2 border-text ${colors.fill} ${
                  elapsedShare <= 0 ? "border-r-0" : ""
                }`}
                style={{ width: `${Math.min(1, elapsedShare) * 100}%` }}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
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
              <p className="ml-auto hidden text-small text-muted md:block">
                <Key>Space</Key> start or pause · <Key>S</Key> skip ·{" "}
                <Key>R</Key> reset
              </p>
            </div>
          </section>

          <section
            aria-label="Skill and today"
            className="card bg-surface p-5 md:p-7"
          >
            {firstRun ? (
              <AddSkillForm
                variant="primary"
                onAdded={(added) => timer.selectSkill(added.id)}
              />
            ) : (
              <>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor={pickerId}
                      className="block font-display text-section font-semibold"
                    >
                      Skill
                    </label>
                    <select
                      id={pickerId}
                      value={skillId ?? ""}
                      disabled={underWay || skills.status !== "success"}
                      onChange={(event) =>
                        timer.selectSkill(event.target.value || null)
                      }
                      className="mt-2 field w-full disabled:opacity-60"
                    >
                      {skillList.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Link href="/skills" className={buttonClass("secondary")}>
                    Manage skills
                  </Link>
                </div>
                <div className="mt-6 border-t-2 border-dashed border-rule pt-5">
                  <TodaySessions sessions={todaySessions} />
                </div>
              </>
            )}
          </section>
        </div>

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

/** What Pomo says; the same facts the screen states, in Pomo's voice. */
function pomoLine(phase: Phase, status: TimerStatus, firstRun: boolean) {
  if (firstRun) return "Hi! I'm Pomo. What are we practising?";
  if (phase === "longBreak") return "Big break! You earned it.";
  if (phase === "shortBreak") return "Stretch and sip some water.";
  if (status === "running") return "Heads down. I'll keep time.";
  if (status === "paused") return "Take a breath, then back in.";
  return "Ready when you are!";
}
