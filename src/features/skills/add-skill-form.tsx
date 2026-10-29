"use client";

import { useId, useState, type FormEvent } from "react";
import { ZodError } from "zod";
import { useAppData } from "@/data/provider";
import { DuplicateSkillNameError } from "@/data/repositories";
import type { Skill } from "@/data/schemas";
import { buttonClass } from "@/ui/button";

type AddSkillFormProps = {
  onAdded?: (skill: Skill) => void;
  /** Where the form sits decides its weight: the screen's main job or not. */
  variant?: "primary" | "secondary";
};

function messageFor(error: unknown): string {
  if (error instanceof DuplicateSkillNameError) return error.message;
  if (error instanceof ZodError) return "Use a name of 1 to 60 characters.";
  return "The skill could not be saved. Try again.";
}

export function AddSkillForm({
  onAdded,
  variant = "secondary",
}: AddSkillFormProps) {
  const data = useAppData();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fieldId = useId();
  const errorId = useId();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data || saving) return;
    setSaving(true);
    try {
      const skill = await data.skills.create({ name });
      setName("");
      setError(null);
      onAdded?.(skill);
    } catch (caught) {
      setError(messageFor(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor={fieldId} className="block font-medium">
        Skill name
      </label>
      <div className="mt-2 flex flex-wrap gap-3">
        <input
          id={fieldId}
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={60}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-11 min-w-0 flex-1 rounded-control border border-control bg-surface px-3 placeholder:text-muted md:h-9"
          placeholder="Guitar, Spanish, Chess…"
        />
        <button
          type="submit"
          disabled={!data || saving}
          className={buttonClass(variant)}
        >
          Add skill
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-negative">
          {error}
        </p>
      )}
    </form>
  );
}
