"use client";

import { Minus, Plus } from "lucide-react";
import { useId, useState } from "react";
import { useSettings } from "@/data/hooks";
import { MINUTES_RANGE } from "@/data/schemas";
import { buttonClass, iconButtonClass } from "@/ui/button";

type MinutesKey = "focusMinutes" | "shortBreakMinutes" | "longBreakMinutes";

const FIELDS: { key: MinutesKey; label: string }[] = [
  { key: "focusMinutes", label: "Focus" },
  { key: "shortBreakMinutes", label: "Short break" },
  { key: "longBreakMinutes", label: "Long break" },
];

/** Focus, short break and long break, in minutes. */
const PRESETS: [number, number, number][] = [
  [25, 5, 15],
  [30, 10, 30],
  [50, 10, 30],
];

/** The steppers move in whole steps of this many minutes. */
const STEP = 5;

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
  // A typed length off the grid steps to the nearest multiple of STEP.
  const less = Math.max(STEP, Math.ceil(value / STEP) * STEP - STEP);
  const more = Math.min(
    MINUTES_RANGE.max,
    Math.floor(value / STEP) * STEP + STEP,
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t-2 border-dashed border-rule py-4">
      <label htmlFor={id} className="font-display text-section font-medium">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`${STEP} minutes less of ${label.toLowerCase()}`}
          disabled={value <= STEP}
          onClick={() => onChange(less)}
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
          step={STEP}
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
        <button
          type="button"
          aria-label={`${STEP} minutes more of ${label.toLowerCase()}`}
          disabled={value >= MINUTES_RANGE.max}
          onClick={() => onChange(more)}
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

/**
 * The length of each phase in minutes, saved as it changes: presets that set
 * all three at once, then a stepper and a field for each.
 */
export function TimerSettings() {
  const [settings, update] = useSettings();

  return (
    <>
      <div
        role="group"
        aria-label="Presets, in minutes of focus, short break and long break"
        className="flex flex-wrap gap-3 pb-4"
      >
        {PRESETS.map(([focus, shortBreak, longBreak]) => {
          const active =
            settings.focusMinutes === focus &&
            settings.shortBreakMinutes === shortBreak &&
            settings.longBreakMinutes === longBreak;
          return (
            <button
              key={`${focus}/${shortBreak}/${longBreak}`}
              type="button"
              aria-pressed={active}
              onClick={() =>
                update({
                  focusMinutes: focus,
                  shortBreakMinutes: shortBreak,
                  longBreakMinutes: longBreak,
                })
              }
              className={`${buttonClass(active ? "primary" : "secondary")} num`}
            >
              {focus}/{shortBreak}/{longBreak}
            </button>
          );
        })}
      </div>
      {FIELDS.map(({ key, label }) => (
        <MinutesField
          key={key}
          label={label}
          value={settings[key]}
          onChange={(minutes) => update({ [key]: minutes })}
        />
      ))}
    </>
  );
}
