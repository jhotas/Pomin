"use client";

import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { Select as SelectPrimitive } from "radix-ui";
import { useId } from "react";
import { useSkillSessions, useSkills } from "@/data/hooks";
import { skillLevel, totalFocusedSeconds } from "@/features/progress/progress";
import { useGains } from "@/lib/use-gains";
import { formatHours } from "@/lib/time";
import { Select, SelectContent, SelectItem, SelectValue } from "@/ui/select";

type SkillPickerProps = {
  skillId: string | null;
  /** A block under way belongs to its skill, so the choice is locked. */
  locked: boolean;
  onSelect: (id: string | null) => void;
};

const addClass =
  "flex size-12 items-center justify-center rounded-full border-2 border-text bg-surface transition md:size-14";

/**
 * The skill the next focus block counts toward, as a quest card under the
 * ring: its name and level, and a bar filling toward the next level. The
 * card opens the list of skills; a round button beside it adds another.
 * Both lock while a block is under way.
 */
export function SkillPicker({ skillId, locked, onSelect }: SkillPickerProps) {
  const skills = useSkills();

  // Keeps the row's height while the skills load, so the ring does not jump.
  if (skills.status !== "success" || skills.data.length === 0) {
    return <div className="h-17 md:h-18" />;
  }

  return (
    <div className="flex items-center gap-3">
      <Select
        value={skillId ?? undefined}
        onValueChange={onSelect}
        disabled={locked}
      >
        <QuestCard skillId={skillId} />
        <SelectContent>
          {skills.data.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {locked ? (
        // A link cannot be disabled, so a locked one is a disabled button.
        <button
          type="button"
          disabled
          aria-label="Add a skill"
          className={`${addClass} cursor-not-allowed opacity-60`}
        >
          <Plus aria-hidden size={22} strokeWidth={2.75} />
        </button>
      ) : (
        <Link
          href="/skills"
          aria-label="Add a skill"
          title="Add a skill"
          className={`${addClass} shadow-sticker-sm hover:-translate-y-px hover:bg-cream active:translate-x-0.5 active:translate-y-0.5 active:shadow-pressed`}
        >
          <Plus aria-hidden size={22} strokeWidth={2.75} />
        </Link>
      )}
    </div>
  );
}

/**
 * The select's trigger, drawn as a quest card. The level comes from every
 * focused second of the skill, so it moves when a block is saved, not while
 * one runs. A level gained pops its badge.
 */
function QuestCard({ skillId }: { skillId: string | null }) {
  const progressId = useId();
  const sessions = useSkillSessions(skillId ?? "");
  const progress =
    skillId && sessions.status === "success"
      ? skillLevel(totalFocusedSeconds(sessions.data))
      : undefined;
  const gains = useGains(progress?.level, skillId ?? "");

  return (
    <SelectPrimitive.Trigger
      aria-label="Skill"
      aria-describedby={progress ? progressId : undefined}
      className="group flex h-17 w-60 flex-col justify-center gap-1.5 card bg-surface px-4 text-left shadow-sticker-sm transition hover:-translate-y-px hover:bg-cream active:translate-x-0.5 active:translate-y-0.5 active:shadow-pressed disabled:translate-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none data-[state=open]:translate-x-0.5 data-[state=open]:translate-y-0.5 data-[state=open]:bg-cream data-[state=open]:shadow-pressed md:h-18 md:w-72"
    >
      <span className="flex w-full items-center gap-2">
        <span className="min-w-0 flex-1 truncate font-display text-section font-medium">
          <SelectValue placeholder="Choose a skill" />
        </span>
        {progress && (
          <span
            key={gains}
            aria-hidden
            className={`shrink-0 rounded-full border-2 border-text bg-sun px-2 font-display text-small font-semibold num ${gains > 0 ? "animate-pop" : ""}`}
          >
            Lv {progress.level}
          </span>
        )}
        <SelectPrimitive.Icon asChild>
          <ChevronDown
            aria-hidden
            size={18}
            strokeWidth={2.5}
            className="shrink-0 transition-transform group-data-[state=open]:rotate-180"
          />
        </SelectPrimitive.Icon>
      </span>
      <span aria-hidden className="flex w-full items-center gap-2">
        <span className="h-3 min-w-0 flex-1 overflow-hidden rounded-full border-2 border-text bg-cream">
          <span
            className="block h-full border-r-2 border-text bg-sun transition-[width] duration-700 ease-out"
            style={{
              width: `${(progress?.share ?? 0) * 100}%`,
              borderRightWidth: progress?.share ? undefined : 0,
            }}
          />
        </span>
        <span className="shrink-0 text-small text-muted num">
          {progress
            ? `${formatHours(progress.intoSeconds)} / ${progress.levelHours} h`
            : " "}
        </span>
      </span>
      {progress && (
        <span id={progressId} className="sr-only">
          Level {progress.level}, {formatHours(progress.intoSeconds)} of{" "}
          {progress.levelHours} hours to level {progress.level + 1}
        </span>
      )}
    </SelectPrimitive.Trigger>
  );
}
