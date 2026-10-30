import type { Phase } from "./core/timer";

export const PHASE_LABEL: Record<Phase, string> = {
  focus: "Focus",
  shortBreak: "Short break",
  longBreak: "Long break",
};

/** Each phase owns a colour: the timer's field and its ring's progress. */
export const PHASE_COLOR: Record<Phase, { field: string; stroke: string }> = {
  focus: { field: "bg-tint", stroke: "var(--primary)" },
  shortBreak: { field: "bg-sky-soft", stroke: "var(--sky)" },
  longBreak: { field: "bg-leaf-soft", stroke: "var(--leaf)" },
};
