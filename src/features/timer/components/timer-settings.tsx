"use client";

import { Minus, Plus } from "lucide-react";
import { useId, useState } from "react";
import { useSettings } from "@/data/hooks";
import { MINUTES_RANGE, type Settings } from "@/data/schemas";
import { DEFAULT_TIMER_SETTINGS } from "@/features/timer/core/timer";
import { buttonClass, iconButtonClass } from "@/ui/button";

type MinutesKey = "focusMinutes" | "shortBreakMinutes" | "longBreakMinutes";

const FIELDS: { key: MinutesKey; label: string }[] = [
  { key: "focusMinutes", label: "Focus" },
  { key: "shortBreakMinutes", label: "Short break" },
  { key: "longBreakMinutes", label: "Long break" },
];

const isMinutes = (value: number) =>
  Number.isInteger(value) &&
  value >= MINUTES_RANGE.min &&
  value <= MINUTES_RANGE.max;

function MinutesField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (minutes: number) => void;
}) {
  const id = useId();
  const hintId = useId();
  // What is typed, until it is a valid length or the field loses focus.
  const [draft, setDraft] = useState<string | null>(null);
  const invalid = draft !== null && !isMinutes(Number(draft));

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t-2 border-dashed border-rule py-4 first:border-t-0 first:pt-0">
      <label htmlFor={id} className="font-display text-section font-medium">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`One minute less of ${label.toLowerCase()}`}
          disabled={value <= MINUTES_RANGE.min}
          onClick={() => onChange(value - 1)}
          className={iconButtonClass("secondary")}
        >
          <Minus aria-hidden size={18} strokeWidth={2.75} />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={MINUTES_RANGE.min}
          max={MINUTES_RANGE.max}
          step={1}
          value={draft ?? String(value)}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? hintId : undefined}
          onChange={(event) => {
            setDraft(event.target.value);
            const minutes = Number(event.target.value);
            if (event.target.value !== "" && isMinutes(minutes)) {
              onChange(minutes);
            }
          }}
          onBlur={() => setDraft(null)}
          className="field w-20 [appearance:textfield] text-center font-display text-section font-medium num aria-invalid:border-negative [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="w-8 text-muted">min</span>
        <button
          type="button"
          aria-label={`One minute more of ${label.toLowerCase()}`}
          disabled={value >= MINUTES_RANGE.max}
          onClick={() => onChange(value + 1)}
          className={iconButtonClass("secondary")}
        >
          <Plus aria-hidden size={18} strokeWidth={2.75} />
        </button>
      </div>
      {invalid && (
        <p id={hintId} role="alert" className="w-full text-right text-negative">
          Use {MINUTES_RANGE.min} to {MINUTES_RANGE.max} minutes.
        </p>
      )}
    </div>
  );
}

/** The length of each phase, saved as it changes. */
export function TimerSettings() {
  const [settings, update] = useSettings();
  const isDefault = FIELDS.every(
    ({ key }) => settings[key] === DEFAULT_TIMER_SETTINGS[key],
  );
  const restore: Partial<Settings> = Object.fromEntries(
    FIELDS.map(({ key }) => [key, DEFAULT_TIMER_SETTINGS[key]]),
  );

  return (
    <>
      {FIELDS.map(({ key, label }) => (
        <MinutesField
          key={key}
          label={label}
          value={settings[key]}
          onChange={(minutes) => update({ [key]: minutes })}
        />
      ))}
      <div className="border-t-2 border-dashed border-rule pt-4">
        <button
          type="button"
          disabled={isDefault}
          onClick={() => update(restore)}
          className={`${buttonClass("text")} disabled:text-muted disabled:no-underline`}
        >
          Restore {DEFAULT_TIMER_SETTINGS.focusMinutes}/
          {DEFAULT_TIMER_SETTINGS.shortBreakMinutes}/
          {DEFAULT_TIMER_SETTINGS.longBreakMinutes}
        </button>
      </div>
    </>
  );
}
