import type { Phase } from "./core/timer";

export const PHASE_LABEL: Record<Phase, string> = {
  focus: "Focus",
  shortBreak: "Short break",
  longBreak: "Long break",
};

/** Each phase owns a colour: the timer card's field and its progress fill. */
export const PHASE_COLOR: Record<Phase, { field: string; fill: string }> = {
  focus: { field: "bg-tint", fill: "bg-primary" },
  shortBreak: { field: "bg-sky-soft", fill: "bg-sky" },
  longBreak: { field: "bg-leaf-soft", fill: "bg-leaf" },
};
