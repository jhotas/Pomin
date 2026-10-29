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
import { PHASE_LABEL } from "../phase";
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

  return (
    <>
      <PageHeader title="Timer" description={finding} />
      <div className="grid gap-3 lg:grid-cols-3 lg:items-start">
        <section
          aria-label="Timer"
          className="rounded-card border border-border bg-surface p-5 md:p-6 lg:col-span-2"
        >
          <div className="flex items-baseline justify-between gap-3">
            <p aria-live="polite" className="text-section font-medium">
              {phaseLabel}
            </p>
            {state.phase === "focus" && (
              <p className="text-muted num">
                Block{" "}
                {(state.completedFocusCount % settings.longBreakEvery) + 1} of{" "}
                {settings.longBreakEvery}
              </p>
            )}
          </div>

          <div
            role="timer"
            aria-label="Time left"
            className="mt-2 text-clock font-medium tracking-tight num"
          >
            {clock}
          </div>

          <div aria-hidden className="mt-4 h-1 rounded-full bg-raised">
            <div
              className={`h-full rounded-full ${
                state.phase === "focus" ? "bg-data" : "bg-muted"
              }`}
              style={{ width: `${Math.min(1, elapsedShare) * 100}%` }}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={timer.toggle}
              disabled={!timer.ready || !timer.canStart}
              className={`${buttonClass("primary")} min-w-28 disabled:opacity-40`}
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
              <kbd>Space</kbd> start or pause · <kbd>S</kbd> skip · <kbd>R</kbd>{" "}
              reset
            </p>
          </div>

          <div className="mt-6 border-t border-rule pt-5">
            {firstRun ? (
              <AddSkillForm onAdded={(added) => timer.selectSkill(added.id)} />
            ) : (
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-0 flex-1">
                  <label htmlFor={pickerId} className="block font-medium">
                    Skill
                  </label>
                  <select
                    id={pickerId}
                    value={skillId ?? ""}
                    disabled={underWay || skills.status !== "success"}
                    onChange={(event) =>
                      timer.selectSkill(event.target.value || null)
                    }
                    className="mt-2 h-11 w-full rounded-control border border-control bg-surface px-3 disabled:opacity-60 md:h-9"
                  >
                    {skillList.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Link href="/skills" className={buttonClass("text")}>
                  Manage skills
                </Link>
              </div>
            )}
          </div>

          {!firstRun && (
            <div className="mt-6 border-t border-rule pt-5">
              <TodaySessions sessions={todaySessions} />
            </div>
          )}
        </section>

        <SkillProgressPanel skill={skill} sessions={allSessions.data ?? []} />
      </div>
    </>
  );
}
