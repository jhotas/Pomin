"use client";

import { ChevronDown, Layers, Plus } from "lucide-react";
import Link from "next/link";
import { useId } from "react";
import { useSkills } from "@/data/hooks";

type SkillPickerProps = {
  skillId: string | null;
  /** A block under way belongs to its skill, so the choice is locked. */
  locked: boolean;
  onSelect: (id: string | null) => void;
};

const sticker =
  "rounded-full border-2 border-text bg-surface shadow-sticker-sm transition hover:-translate-y-px hover:bg-cream active:translate-x-0.5 active:translate-y-0.5 active:shadow-pressed";

/**
 * The skill the next focus block counts toward, as a sticker pill under the
 * ring, with a round button beside it to add another skill.
 */
export function SkillPicker({ skillId, locked, onSelect }: SkillPickerProps) {
  const pickerId = useId();
  const skills = useSkills();

  // Keeps the row's height while the skills load, so the ring does not jump.
  if (skills.status !== "success" || skills.data.length === 0) {
    return <div className="h-12 md:h-14" />;
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor={pickerId} className="sr-only">
        Skill
      </label>
      <div className="relative">
        <Layers
          aria-hidden
          size={20}
          strokeWidth={2.5}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
        />
        <select
          id={pickerId}
          value={skillId ?? ""}
          disabled={locked}
          onChange={(event) => onSelect(event.target.value || null)}
          className={`${sticker} h-12 w-56 cursor-pointer appearance-none truncate pr-11 pl-12 font-display text-section font-medium md:h-14 md:w-64 disabled:translate-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none`}
        >
          {skills.data.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          size={20}
          strokeWidth={2.5}
          className={`pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 ${locked ? "opacity-60" : ""}`}
        />
      </div>
      <Link
        href="/skills"
        aria-label="Add a skill"
        title="Add a skill"
        className={`${sticker} flex size-12 items-center justify-center md:size-14`}
      >
        <Plus aria-hidden size={22} strokeWidth={2.75} />
      </Link>
    </div>
  );
}
