"use client";

import { useId } from "react";

type SwitchProps = {
  label: string;
  /** One line under the label about what the switch changes. */
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/** An on/off setting: its label on the left, a sticker toggle on the right. */
export function Switch({ label, hint, checked, onChange }: SwitchProps) {
  const labelId = useId();
  const hintId = useId();
  return (
    <div className="flex items-center justify-between gap-4 border-t-2 border-dashed border-rule py-4 first:border-t-0 first:pt-0 last:pb-0">
      <div>
        <p id={labelId} className="font-display text-section font-medium">
          {label}
        </p>
        {hint && (
          <p id={hintId} className="text-muted">
            {hint}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={hint ? hintId : undefined}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full border-2 border-text shadow-sticker-sm transition-colors ${
          checked ? "bg-primary" : "bg-cream"
        }`}
      >
        <span
          aria-hidden
          className={`absolute top-1/2 left-0.5 size-6 -translate-y-1/2 rounded-full border-2 border-text bg-surface transition-transform ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
