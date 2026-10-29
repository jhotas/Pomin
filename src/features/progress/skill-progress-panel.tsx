import Link from "next/link";
import type { Session, Skill } from "@/data/schemas";
import { formatHours } from "@/lib/time";
import { MasteryGrid } from "./mastery-grid";
import { totalFocusedSeconds } from "./progress";

type SkillProgressPanelProps = {
  skill: Skill | undefined;
  /** Every session of the skill, for the total. */
  sessions: readonly Session[];
};

const DEFAULT_TARGET_HOURS = 10_000;
const percentFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const hoursFormat = new Intl.NumberFormat("en-US");

export function SkillProgressPanel({
  skill,
  sessions,
}: SkillProgressPanelProps) {
  const target = skill?.targetHours ?? DEFAULT_TARGET_HOURS;
  const total = totalFocusedSeconds(sessions);
  const percent = (total / 3600 / target) * 100;

  return (
    <section
      aria-labelledby="skill-progress-title"
      className="rounded-card border border-border bg-surface p-5"
    >
      <h2 id="skill-progress-title" className="text-section font-medium">
        {skill?.name ?? "Your first skill"}
      </h2>
      <p className="mt-3 num">
        <span className="text-kpi font-medium">{formatHours(total)}</span>
        <span className="text-muted">
          {" "}
          of {hoursFormat.format(target)} hours
        </span>
      </p>
      <p className="mb-4 text-small text-muted num">
        {percentFormat.format(percent)}% · one square is{" "}
        {hoursFormat.format(target / 100)} hours
      </p>
      <MasteryGrid focusedSeconds={total} targetHours={target} />
      {skill && (
        <Link
          href={`/skills/${skill.id}`}
          className="mt-5 inline-block font-medium underline-offset-4 hover:underline"
        >
          View progress
        </Link>
      )}
    </section>
  );
}
