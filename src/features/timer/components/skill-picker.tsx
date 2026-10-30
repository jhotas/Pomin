"use client";

import Link from "next/link";
import { useId } from "react";
import { useSkills } from "@/data/hooks";

type SkillPickerProps = {
  skillId: string | null;
  /** A block under way belongs to its skill, so the choice is locked. */
  locked: boolean;
  onSelect: (id: string | null) => void;
};

/**
 * The skill the next focus block counts toward, as a small pill inside the
 * ring. With no skills the timer still runs, and the pill links to where one
 * is made.
 */
export function SkillPicker({ skillId, locked, onSelect }: SkillPickerProps) {
  const pickerId = useId();
  const skills = useSkills();

  // Keeps the pill's height while the skills load, so the ring does not jump.
  if (skills.status !== "success") return <div className="h-8 md:h-9" />;

  const pill =
    "flex h-8 max-w-[11rem] items-center rounded-full border-2 border-text bg-surface px-3 font-display text-small font-medium md:h-9 md:max-w-[14rem] md:text-body";

  if (skills.data.length === 0) {
    return (
      <Link href="/skills" className={`${pill} hover:bg-cream`}>
        Add a skill
      </Link>
    );
  }

  return (
    <>
      <label htmlFor={pickerId} className="sr-only">
        Skill
      </label>
      <select
        id={pickerId}
        value={skillId ?? ""}
        disabled={locked}
        onChange={(event) => onSelect(event.target.value || null)}
        className={`${pill} truncate text-center disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {skills.data.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </>
  );
}
