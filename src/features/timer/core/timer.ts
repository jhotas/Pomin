/**
 * The pomodoro timer as a pure state machine. Time is always passed in as
 * `now` (epoch ms) and state is derived from timestamps, never from counting
 * ticks, so the timer stays correct when a tab is throttled, reloaded or
 * closed. The reducer returns events; the caller does the I/O.
 */

export type Phase = "focus" | "shortBreak" | "longBreak";
export type TimerStatus = "idle" | "running" | "paused";

export type TimerSettings = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakEvery: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
};

export type TimerState = {
  phase: Phase;
  status: TimerStatus;
  plannedMs: number;
  /** Time run before the current run, so pauses are not counted. */
  accumulatedMs: number;
  /** When the current run started; null while idle or paused. */
  runningSince: number | null;
  /** When the phase was first started; null until it is. */
  phaseStartedAt: number | null;
  /** Drives the long break cycle. */
  completedFocusCount: number;
};

export type TimerAction = {
  type: "start" | "pause" | "resume" | "skip" | "reset" | "tick";
};

export type FocusEnded = {
  type: "focusEnded";
  startedAt: number;
  endedAt: number;
  focusedMs: number;
  plannedMs: number;
  outcome: "completed" | "interrupted";
};

export type PhaseChanged = {
  type: "phaseChanged";
  from: Phase;
  to: Phase;
  at: number;
};

export type TimerEvent = FocusEnded | PhaseChanged;

type Transition = { state: TimerState; events: TimerEvent[] };

/** A focus block that ends early counts only if it reached this length. */
export const MIN_FOCUS_MS = 60_000;

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakEvery: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
};

const MINUTE_MS = 60_000;

const PHASE_MINUTES: Record<Phase, keyof TimerSettings> = {
  focus: "focusMinutes",
  shortBreak: "shortBreakMinutes",
  longBreak: "longBreakMinutes",
};

function phaseLengthMs(phase: Phase, settings: TimerSettings): number {
  // At least a minute, so a running timer always moves towards an end.
  return Math.max(1, Number(settings[PHASE_MINUTES[phase]])) * MINUTE_MS;
}

function idlePhase(
  phase: Phase,
  settings: TimerSettings,
  completedFocusCount: number,
): TimerState {
  return {
    phase,
    status: "idle",
    plannedMs: phaseLengthMs(phase, settings),
    accumulatedMs: 0,
    runningSince: null,
    phaseStartedAt: null,
    completedFocusCount,
  };
}

function runningPhase(
  phase: Phase,
  settings: TimerSettings,
  completedFocusCount: number,
  startedAt: number,
): TimerState {
  return {
    ...idlePhase(phase, settings, completedFocusCount),
    status: "running",
    runningSince: startedAt,
    phaseStartedAt: startedAt,
  };
}

export function initialTimerState(settings: TimerSettings): TimerState {
  return idlePhase("focus", settings, 0);
}

export function elapsedMs(state: TimerState, now: number): number {
  const current = state.runningSince === null ? 0 : now - state.runningSince;
  return state.accumulatedMs + current;
}

export function remainingMs(state: TimerState, now: number): number {
  return Math.max(0, state.plannedMs - elapsedMs(state, now));
}

/** New lengths apply to an idle phase now and to anything else from the next phase. */
export function applySettings(
  state: TimerState,
  settings: TimerSettings,
): TimerState {
  if (state.status !== "idle") return state;
  const plannedMs = phaseLengthMs(state.phase, settings);
  return plannedMs === state.plannedMs ? state : { ...state, plannedMs };
}

function nextPhase(
  state: TimerState,
  settings: TimerSettings,
): { phase: Phase; completedFocusCount: number } {
  if (state.phase !== "focus") {
    return { phase: "focus", completedFocusCount: state.completedFocusCount };
  }
  const completedFocusCount = state.completedFocusCount + 1;
  const every = Math.max(1, settings.longBreakEvery);
  return {
    phase: completedFocusCount % every === 0 ? "longBreak" : "shortBreak",
    completedFocusCount,
  };
}

/** The session an early-ended focus block leaves behind, if it counts. */
function interruptedFocus(state: TimerState, now: number): TimerEvent[] {
  if (state.phase !== "focus" || state.phaseStartedAt === null) return [];
/**
 * Skipping a focus block that has started finishes it: it counts as completed
 * and in full, as if it had run to the end.
 */
function skippedFocus(state: TimerState, now: number): TimerEvent[] {
  if (state.phase !== "focus" || state.phaseStartedAt === null) return [];
  return [
    {
      type: "focusEnded",
      startedAt: state.phaseStartedAt,
      endedAt: now,
      focusedMs: state.plannedMs,
      plannedMs: state.plannedMs,
      outcome: "completed",
    },
  ];
}

  const focusedMs = elapsedMs(state, now);
  if (focusedMs < MIN_FOCUS_MS) return [];
  return [
    {
      type: "focusEnded",
      startedAt: state.phaseStartedAt,
      endedAt: now,
      focusedMs,
      plannedMs: state.plannedMs,
      outcome: "interrupted",
    },
  ];
}

/** Completes every phase that has run out by `now`, in order. */
function tick(
  state: TimerState,
  now: number,
  settings: TimerSettings,
): Transition {
  let current = state;
  const events: TimerEvent[] = [];

  while (current.status === "running" && current.runningSince !== null) {
    const endsAt =
      current.runningSince + (current.plannedMs - current.accumulatedMs);
    if (now < endsAt) break;

    if (current.phase === "focus" && current.phaseStartedAt !== null) {
      events.push({
        type: "focusEnded",
        startedAt: current.phaseStartedAt,
        endedAt: endsAt,
        focusedMs: current.plannedMs,
        plannedMs: current.plannedMs,
        outcome: "completed",
      });
    }

    const next = nextPhase(current, settings);
    events.push({
      type: "phaseChanged",
      from: current.phase,
      to: next.phase,
      at: endsAt,
    });

    const autoStart =
      next.phase === "focus"
        ? settings.autoStartFocus
        : settings.autoStartBreaks;
    current = autoStart
      ? runningPhase(next.phase, settings, next.completedFocusCount, endsAt)
      : idlePhase(next.phase, settings, next.completedFocusCount);
  }

  return events.length === 0 ? { state, events } : { state: current, events };
}

export function timerReducer(
  state: TimerState,
  action: TimerAction,
  now: number,
  settings: TimerSettings,
): Transition {
  const unchanged: Transition = { state, events: [] };

  switch (action.type) {
    case "start":
      if (state.status !== "idle") return unchanged;
      return {
        state: {
          ...state,
          status: "running",
          runningSince: now,
          phaseStartedAt: now,
        },
        events: [],
      };

    case "pause":
      if (state.status !== "running") return unchanged;
      return {
        state: {
          ...state,
          status: "paused",
          accumulatedMs: elapsedMs(state, now),
          runningSince: null,
        },
        events: [],
      };

    case "resume":
      if (state.status !== "paused") return unchanged;
      return {
        state: { ...state, status: "running", runningSince: now },
        events: [],
      };

    case "tick":
      return tick(state, now, settings);

    case "skip": {
      const next = nextPhase(state, settings);
      return {
      // Like a phase that ran out: the next one starts by itself if set to.
        state: autoStart
          ? runningPhase(next.phase, settings, next.completedFocusCount, now)
          : idlePhase(next.phase, settings, next.completedFocusCount),
      const autoStart =
        next.phase === "focus"
          ? settings.autoStartFocus
          : settings.autoStartBreaks;
        events: [
          ...skippedFocus(state, now),
          { type: "phaseChanged", from: state.phase, to: next.phase, at: now },
        ],
      };
    }

    case "reset":
      return {
        state: idlePhase(state.phase, settings, state.completedFocusCount),
        events: interruptedFocus(state, now),
      };
  }
}
