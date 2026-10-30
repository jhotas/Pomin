"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { ZodError } from "zod";
import { useSkill, useSkillSessions } from "@/data/hooks";
import { useAppData } from "@/data/provider";
import {
  DEFAULT_SKILL_NAME,
  DuplicateSkillNameError,
  isDefaultSkill,
} from "@/data/repositories";
import type { Session, Skill } from "@/data/schemas";
import { MasteryGrid } from "@/features/progress/mastery-grid";
import {
  projectCompletion,
  totalFocusedSeconds,
  weeklyTotals,
} from "@/features/progress/progress";
import { WeeklyChart } from "@/features/progress/weekly-chart";
import {
  formatDayLabel,
  formatDuration,
  formatHours,
  formatMonthYear,
  formatTimeOfDay,
} from "@/lib/time";
import { useDocumentTitle } from "@/lib/use-document-title";
import { useNow } from "@/lib/use-now";
import { buttonClass } from "@/ui/button";
import { PageHeader } from "@/ui/page-header";

const HISTORY_ROWS = 8;
/** The four figures each sit on their own colour field. */
const FIGURE_COLORS = ["bg-tint", "bg-sky-soft", "bg-cream", "bg-leaf-soft"];
const hoursFormat = new Intl.NumberFormat("en-US");

export function SkillDetailScreen({ skillId }: { skillId: string }) {
  const skill = useSkill(skillId);
  const sessions = useSkillSessions(skillId);
  const now = useNow();
  useDocumentTitle(skill.data ? `${skill.data.name} · pomoapp` : null);

  if (skill.status === "success" && !skill.data) {
    return (
      <PageHeader
        title="Skill not found"
        description="It may have been deleted."
        actions={
          <Link href="/skills" className={buttonClass("secondary")}>
            Back to skills
          </Link>
        }
      />
    );
  }
  if (!skill.data || sessions.status !== "success" || !now) return null;

  return <SkillDetail skill={skill.data} sessions={sessions.data} now={now} />;
}

function SkillDetail({
  skill,
  sessions,
  now,
}: {
  skill: Skill;
  sessions: readonly Session[];
  now: Date;
}) {
  const data = useAppData();
  const router = useRouter();
  const total = totalFocusedSeconds(sessions);
  const weeks = weeklyTotals(sessions, now, 8);
  const projection = projectCompletion(sessions, skill.targetHours, now);
  const target = hoursFormat.format(skill.targetHours);

  const finding =
    projection.remainingSeconds === 0
      ? `${formatHours(total)} hours. You reached ${target} hours.`
      : projection.completesOn
        ? `${formatHours(total)} hours so far. At ${formatDuration(
            projection.dailyAverageSeconds,
          )} a day you reach ${target} hours in ${formatMonthYear(
            projection.completesOn,
          )}.`
        : `${formatHours(total)} hours so far. Practise in the next 30 days to see when you reach ${target} hours.`;

  function startBlock() {
    data?.timer.selectSkill(skill.id);
    router.push("/");
  }

  const figures = [
    { label: "Total", value: `${formatHours(total)} h` },
    {
      label: "This week",
      value: formatDuration(weeks.at(-1)?.seconds ?? 0),
    },
    {
      label: "Daily average, 30 days",
      value: formatDuration(projection.dailyAverageSeconds),
    },
    {
      label: `Reaches ${target} h`,
      value: projection.completesOn
        ? formatMonthYear(projection.completesOn, "short")
        : null,
    },
  ];

  return (
    <>
      <PageHeader
        title={skill.name}
        description={skill.archivedAt ? `Archived. ${finding}` : finding}
        actions={
          <button
            type="button"
            onClick={startBlock}
            className={buttonClass("primary")}
          >
            Start a block
          </button>
        }
      />

      <ul
        aria-label="Figures"
        className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5"
      >
        {figures.map((figure, index) => (
          <li
            key={figure.label}
            className={`card p-4 md:p-5 ${FIGURE_COLORS[index % FIGURE_COLORS.length]}`}
          >
            <p className="font-semibold text-muted">{figure.label}</p>
            {figure.value === null ? (
              <p className="mt-1 font-display text-kpi text-muted">—</p>
            ) : (
              <p className="mt-1 font-display text-kpi font-semibold num">
                {figure.value}
              </p>
            )}
          </li>
        ))}
      </ul>

      <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
        <section
          aria-labelledby="weekly-title"
          className="card bg-surface p-5 lg:col-span-2"
        >
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 id="weekly-title" className="text-section font-semibold">
              Hours per week
            </h2>
            <p className="text-small text-muted">Last 8 weeks</p>
          </div>
          <WeeklyChart weeks={weeks} />
        </section>

        <section aria-labelledby="grid-title" className="card bg-surface p-5">
          <h2 id="grid-title" className="text-section font-semibold">
            Toward {target} hours
          </h2>
          <p className="mb-4 text-small text-muted num">
            One square is {hoursFormat.format(skill.targetHours / 100)} hours
          </p>
          <MasteryGrid focusedSeconds={total} targetHours={skill.targetHours} />
        </section>

        <SessionHistory sessions={sessions} now={now} />

        <ManageSkill skill={skill} sessionCount={sessions.length} />
      </div>
    </>
  );
}

function SessionHistory({
  sessions,
  now,
}: {
  sessions: readonly Session[];
  now: Date;
}) {
  const newestFirst = [...sessions].reverse();
  const shown = newestFirst.slice(0, HISTORY_ROWS);
  return (
    <section
      aria-labelledby="history-title"
      className="card bg-surface p-5 lg:col-span-2"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="history-title" className="text-section font-semibold">
          Sessions
        </h2>
        <p className="text-small text-muted num">
          {sessions.length > HISTORY_ROWS
            ? `Latest ${HISTORY_ROWS} of ${sessions.length}`
            : `${sessions.length} in total`}
        </p>
      </div>
      {shown.length === 0 ? (
        <p className="mt-2 text-muted">No sessions yet.</p>
      ) : (
        <ul aria-label="Sessions" className="mt-1">
          {shown.map((session) => (
            <li
              key={session.id}
              className="flex items-baseline justify-between gap-3 border-b-2 border-dashed border-rule py-2.5 last:border-b-0"
            >
              <span className="text-muted num">
                {formatDayLabel(session.startedAt, now)} ·{" "}
                {formatTimeOfDay(session.startedAt)}
                {session.outcome === "interrupted" && " · stopped early"}
              </span>
              <span className="num">
                {formatDuration(session.focusedSeconds)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function renameError(error: unknown): string {
  if (error instanceof DuplicateSkillNameError) return error.message;
  if (error instanceof ZodError) return "Use a name of 1 to 60 characters.";
  return "The name could not be saved. Try again.";
}

function ManageSkill({
  skill,
  sessionCount,
}: {
  skill: Skill;
  sessionCount: number;
}) {
  const data = useAppData();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const fieldId = useId();
  const errorId = useId();

  async function rename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "");
    try {
      await data?.skills.update(skill.id, { name });
      setError(null);
    } catch (caught) {
      setError(renameError(caught));
    }
  }

  async function toggleArchive() {
    await data?.skills.update(skill.id, {
      archivedAt: skill.archivedAt ? null : new Date().toISOString(),
    });
  }

  async function remove() {
    await data?.skills.remove(skill.id);
    router.replace("/skills");
  }

  if (isDefaultSkill(skill)) {
    return (
      <section aria-labelledby="manage-title" className="card bg-surface p-5">
        <h2 id="manage-title" className="text-section font-semibold">
          Default skill
        </h2>
        <p className="mt-2 text-muted">
          Focus time with no other skill counts toward {DEFAULT_SKILL_NAME}.
          It stays in the timer&apos;s list, so it cannot be renamed, archived
          or deleted.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="manage-title" className="card bg-surface p-5">
      <h2 id="manage-title" className="text-section font-semibold">
        Manage
      </h2>

      <form key={skill.name} onSubmit={rename} noValidate className="mt-4">
        <label htmlFor={fieldId} className="block font-semibold">
          Name
        </label>
        <div className="mt-2 flex gap-3">
          <input
            id={fieldId}
            name="name"
            defaultValue={skill.name}
            maxLength={60}
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="field flex-1"
          />
          <button type="submit" className={buttonClass("secondary")}>
            Save name
          </button>
        </div>
        {error && (
          <p id={errorId} role="alert" className="mt-2 text-negative">
            {error}
          </p>
        )}
      </form>

      <div className="mt-5 border-t-2 border-dashed border-rule pt-5">
        <p className="text-muted">
          {skill.archivedAt
            ? "Archived skills keep their hours but leave the timer's list."
            : "Archive a skill you have paused. Its hours stay."}
        </p>
        <button
          type="button"
          onClick={toggleArchive}
          className={`${buttonClass("secondary")} mt-3`}
        >
          {skill.archivedAt ? "Restore" : "Archive"}
        </button>
      </div>

      <div className="mt-5 border-t-2 border-dashed border-rule pt-5">
        {confirming ? (
          <>
            <p>
              Delete {skill.name} and its {sessionCount}{" "}
              {sessionCount === 1 ? "session" : "sessions"}? This cannot be
              undone.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={remove}
                className={buttonClass("danger")}
              >
                Delete {skill.name}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className={buttonClass("text")}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className={buttonClass("dangerText")}
          >
            Delete skill
          </button>
        )}
      </div>
    </section>
  );
}
