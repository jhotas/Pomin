"use client";

import { Minus, Plus } from "lucide-react";
import { useId, useState } from "react";
import { useSettings } from "@/data/hooks";
import { LONG_BREAK_EVERY_RANGE, MINUTES_RANGE } from "@/data/schemas";
import { buttonClass, iconButtonClass } from "@/ui/button";
import { Switch } from "@/ui/switch";

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

type NumberFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  /** The steppers move in whole steps of this size. */
  step: number;
  /** The unit, for the steppers' names: "minutes", "blocks". */
  unit: string;
  onChange: (value: number) => void;
};

/** A labelled number with a stepper on each side and a field to type in. */
function NumberField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: NumberFieldProps) {
  const id = useId();
  const hintId = useId();
  // What is typed, until it is a valid value or the field loses focus.
  const [draft, setDraft] = useState<string | null>(null);
  const isValid = (candidate: number) =>
    Number.isInteger(candidate) && candidate >= min && candidate <= max;
  const invalid = draft !== null && !isValid(Number(draft));
  // A typed value off the grid steps to the nearest multiple of `step`.
  const lowest = Math.ceil(min / step) * step;
  const less = Math.max(lowest, Math.ceil(value / step) * step - step);
  const more = Math.min(max, Math.floor(value / step) * step + step);
  const name = label.toLowerCase();

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t-2 border-dashed border-rule py-4">
      <label htmlFor={id} className="font-display text-section font-medium">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`${step} ${unit} less of ${name}`}
          disabled={value <= lowest}
          onClick={() => onChange(less)}
          className={iconButtonClass("secondary")}
        >
          <Minus aria-hidden size={18} strokeWidth={2.75} />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={draft ?? String(value)}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? hintId : undefined}
          onChange={(event) => {
            setDraft(event.target.value);
            const typed = Number(event.target.value);
            if (event.target.value !== "" && isValid(typed)) onChange(typed);
          }}
          onBlur={() => setDraft(null)}
          className="field w-20 [appearance:textfield] text-center font-display text-section font-medium num aria-invalid:border-negative [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label={`${step} ${unit} more of ${name}`}
          disabled={value >= max}
          onClick={() => onChange(more)}
          className={iconButtonClass("secondary")}
        >
          <Plus aria-hidden size={18} strokeWidth={2.75} />
        </button>
      </div>
      {invalid && (
        <p id={hintId} role="alert" className="w-full text-right text-negative">
          Use {min} to {max} {unit}.
        </p>
      )}
    </div>
  );
}

/**
 * The timer's rhythm, saved as it changes: presets that set all three
 * lengths at once, a stepper for each length and for the round, and whether
 * the next phase starts by itself.
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
        <NumberField
          key={key}
          label={label}
          value={settings[key]}
          min={MINUTES_RANGE.min}
          max={MINUTES_RANGE.max}
          step={5}
          unit="minutes"
          onChange={(minutes) => update({ [key]: minutes })}
        />
      ))}
      <NumberField
        label="Focus blocks per round"
        value={settings.longBreakEvery}
        min={LONG_BREAK_EVERY_RANGE.min}
        max={LONG_BREAK_EVERY_RANGE.max}
        step={1}
        unit="blocks"
        onChange={(blocks) => update({ longBreakEvery: blocks })}
      />
      <Switch
        label="Start breaks by themselves"
        hint="A break begins as soon as a focus block ends."
        checked={settings.autoStartBreaks}
        onChange={(autoStartBreaks) => update({ autoStartBreaks })}
      />
      <Switch
        label="Start focus by itself"
        hint="The next focus block begins as soon as a break ends."
        checked={settings.autoStartFocus}
        onChange={(autoStartFocus) => update({ autoStartFocus })}
      />
    </>
  );
}

/** Whether the app makes its 8-bit sounds and shows notifications. */
export function SoundSettings() {
  const [settings, update] = useSettings();
  // Why notifications could not be turned on, when they could not.
  const [refusal, setRefusal] = useState<string | null>(null);

  async function setNotifications(on: boolean) {
    setRefusal(null);
    if (!on) {
      update({ notificationsEnabled: false });
      return;
    }
    if (!("Notification" in window)) {
      setRefusal("This browser cannot show notifications.");
      return;
    }
    // A refused permission answers at once, without asking again.
    const permission =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();
    if (permission === "granted") update({ notificationsEnabled: true });
    else {
      setRefusal(
        "Notifications are blocked for this site. Allow them in the browser's site settings, then try again.",
      );
    }
  }

  return (
    <>
      <Switch
        label="Sound effects"
        hint="Blips on buttons, a chime per focus block, a fanfare per round."
        checked={settings.soundEnabled}
        onChange={(soundEnabled) => update({ soundEnabled })}
      />
      <Switch
        label="Notifications"
        hint={
          refusal ??
          "A note from the browser when a phase ends while pomoapp is out of sight."
        }
        checked={settings.notificationsEnabled}
        onChange={(on) => void setNotifications(on)}
      />
    </>
  );
}
