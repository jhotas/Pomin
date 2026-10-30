"use client";

import Link from "next/link";
import { useAllSessions, useSkills } from "@/data/hooks";
import type { Session, Skill } from "@/data/schemas";
import {
  totalFocusedSeconds,
  weeklyTotals,
} from "@/features/progress/progress";
import { formatDuration } from "@/lib/time";
import { useNow } from "@/lib/use-now";
import { EmptyState } from "@/ui/empty-state";
import { PageHeader } from "@/ui/page-header";
import { Pomo } from "@/ui/pomo";
import { AddSkillForm } from "./add-skill-form";

const percentFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const hoursFormat = new Intl.NumberFormat("en-US");
const tenthsFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** A skill's hours rounded to the tenth shown in its row, in tenths. */
function tenthsOfHours(sessions: readonly Session[], skillId: string): number {
  const own = sessions.filter((session) => session.skillId === skillId);
  return Math.round(totalFocusedSeconds(own) / 360);
}

export function SkillsScreen() {
  const skills = useSkills({ includeArchived: true });
  const sessions = useAllSessions();
  const now = useNow();

  const all = skills.data ?? [];
  const active = all.filter((skill) => skill.archivedAt === null);
  const archived = all.filter((skill) => skill.archivedAt !== null);
  const sessionList = sessions.data ?? [];
  const loaded = skills.status === "success" && sessions.status === "success";

  // The total is the sum of the rows as shown, so the figures add up.
  const shownTotal = all.reduce(
    (sum, skill) => sum + tenthsOfHours(sessionList, skill.id),
    0,
  );
  const description = loaded
    ? `${active.length} ${active.length === 1 ? "skill" : "skills"} · ${tenthsFormat.format(
        shownTotal / 10,
      )} hours logged in total.`
    : undefined;

  return (
    <>
      <PageHeader title="Skills" description={description} />
      <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
        <section
          aria-label="Your skills"
          className="card bg-surface p-5 lg:col-span-2"
        >
          {loaded && active.length === 0 && archived.length === 0 && (
            <div className="flex items-center gap-4">
              <Pomo mood="happy" size={72} className="shrink-0 animate-bob" />
              <EmptyState>
                No skills yet. Each skill keeps its own count toward 10,000
                hours.
              </EmptyState>
            </div>
          )}
          {loaded && active.length > 0 && (
            <SkillList
              label="Skills"
              skills={active}
              sessions={sessionList}
              now={now}
            />
          )}
          {loaded && archived.length > 0 && (
            <>
              <h2 className="mt-7 mb-2 text-section font-semibold">Archived</h2>
              <SkillList
                label="Archived"
                skills={archived}
                sessions={sessionList}
                now={now}
              />
            </>
          )}
        </section>

        <section
          aria-labelledby="add-skill-title"
          className="card bg-surface p-5"
        >
          <h2 id="add-skill-title" className="mb-4 text-section font-semibold">
            Add a skill
          </h2>
          <AddSkillForm variant="primary" />
        </section>
      </div>
    </>
  );
}

/** Each skill gets a badge colour by its place in the list. */
const BADGE_COLORS = ["bg-primary", "bg-sky", "bg-sun", "bg-leaf-soft"];

function SkillList({
  label,
  skills,
  sessions,
  now,
}: {
  label: string;
  skills: readonly Skill[];
  sessions: readonly Session[];
  now: Date | null;
}) {
  return (
    <ul aria-label={label} className="flex flex-col gap-3">
      {skills.map((skill, index) => {
        const own = sessions.filter((session) => session.skillId === skill.id);
        const total = totalFocusedSeconds(own);
        const thisWeek = now ? (weeklyTotals(own, now, 1)[0]?.seconds ?? 0) : 0;
        const percent = (total / 3600 / skill.targetHours) * 100;
        return (
          <li key={skill.id}>
            <Link
              href={`/skills/${skill.id}`}
              className="flex items-center gap-4 rounded-2xl border-2 border-text bg-surface p-3 transition hover:-translate-y-0.5 hover:bg-cream hover:shadow-sticker-sm"
            >
              <span
                aria-hidden
                className={`flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-text font-display text-section font-semibold ${
                  BADGE_COLORS[index % BADGE_COLORS.length]
                }`}
              >
                {skill.name.trim().charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-section font-semibold">
                  {skill.name}
                </span>
                <span className="block text-small text-muted num">
                  {formatDuration(thisWeek)} this week
                </span>
              </span>
              <span className="shrink-0 text-right num">
                <span className="block font-display text-section font-semibold">
                  {tenthsFormat.format(tenthsOfHours(sessions, skill.id) / 10)}{" "}
                  h
                </span>
                <span className="block text-small text-muted">
                  {percentFormat.format(percent)}% of{" "}
                  {hoursFormat.format(skill.targetHours)}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
