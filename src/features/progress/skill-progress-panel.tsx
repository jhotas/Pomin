import Link from "next/link";
import type { Session, Skill } from "@/data/schemas";
import { formatHours } from "@/lib/time";
import { buttonClass } from "@/ui/button";
import { Pomo } from "@/ui/pomo";
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
      className="card bg-surface p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id="skill-progress-title" className="text-section font-semibold">
          {skill?.name ?? "Your first skill"}
        </h2>
        <Pomo mood={total > 0 ? "proud" : "happy"} size={44} />
      </div>
      <p className="mt-1 num">
        <span className="font-display text-kpi font-semibold">
          {formatHours(total)}
        </span>
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
          className={`${buttonClass("secondary")} mt-5`}
        >
          View progress
        </Link>
      )}
    </section>
  );
}
