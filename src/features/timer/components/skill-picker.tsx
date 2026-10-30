"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useSkills } from "@/data/hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

type SkillPickerProps = {
  skillId: string | null;
  /** A block under way belongs to its skill, so the choice is locked. */
  locked: boolean;
  onSelect: (id: string | null) => void;
};

const addClass =
  "flex size-12 items-center justify-center rounded-full border-2 border-text bg-surface transition md:size-14";

/**
 * The skill the next focus block counts toward, as a sticker pill under the
 * ring, with a round button beside it to add another skill. Both lock while
 * a block is under way.
 */
export function SkillPicker({ skillId, locked, onSelect }: SkillPickerProps) {
  const skills = useSkills();

  // Keeps the row's height while the skills load, so the ring does not jump.
  if (skills.status !== "success" || skills.data.length === 0) {
    return <div className="h-12 md:h-14" />;
  }

  return (
    <div className="flex items-center gap-3">
      <Select
        value={skillId ?? undefined}
        onValueChange={onSelect}
        disabled={locked}
      >
        <SelectTrigger aria-label="Skill" className="w-56 md:w-64">
          <SelectValue placeholder="Choose a skill" />
        </SelectTrigger>
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
