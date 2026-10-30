import type { Phase } from "./core/timer";

export const PHASE_LABEL: Record<Phase, string> = {
  focus: "Focus",
  shortBreak: "Short break",
  longBreak: "Long break",
};

/**
 * Each phase owns the page's colour, at full strength so the white ring and
 * the ink on it stand out. The ring's progress is ink in every phase.
 */
export const PHASE_COLOR: Record<Phase, { field: string; stroke: string }> = {
  focus: { field: "bg-primary", stroke: "var(--text)" },
  shortBreak: { field: "bg-sky", stroke: "var(--text)" },
  longBreak: { field: "bg-leaf", stroke: "var(--text)" },
};
