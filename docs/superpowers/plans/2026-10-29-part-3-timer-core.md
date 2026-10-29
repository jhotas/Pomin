# Part 3: Timer Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A pure, fully tested timer state machine and clock formatting, with no React or browser dependency.

**Architecture:** State is derived from timestamps (spec section 4). `timerReducer(state, action, now, settings)` returns the next state and the events the caller must act on (save a session, play a sound). The core never reads the clock or does I/O; `now` is always passed in.

**Tech Stack:** TypeScript, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-29-pomoapp-design.md` (sections 3 and 4)

## Global Constraints

- Defaults: focus 25 min, short break 5 min, long break 15 min, long break after every 4 focus sessions.
- Only focus phases produce sessions. An interrupted focus counts only with at least 60 s focused (`MIN_FOCUS_MS = 60_000`).
- Remaining time is `plannedMs - (accumulatedMs + (now - runningSince))`. Correctness never depends on tick frequency.

## Rulings on what the spec leaves open

- **Skip during focus** ends it as `interrupted` (if at least 60 s) and advances the long-break cycle as if the block ended. The next phase starts idle.
- **Reset** abandons the current phase (a focus of at least 60 s is recorded as `interrupted`) and puts the same phase back to idle at full length.
- **Natural end** records `endedAt` as the exact moment the phase ran out, not the moment `tick` noticed. With auto-start on, the next phase starts at that same moment, and one `tick` can complete several phases (a tab left closed).
- Settings changes apply to an idle phase immediately and to a running or paused phase from the next phase on.

## Review Focus

1. **A tab closed for hours with auto-start on:** one tick must replay every phase that ended, with correct times and cycle count, and stop at the phase that is still running.
2. **Pause across a phase boundary:** paused time never counts as focused time.
3. **Ticks arriving late:** `endedAt` is the planned end, not the tick time.
4. **Actions in the wrong status** (pause while idle, start while running): no change and no events.
5. **Clock display at boundaries:** 1 ms left shows `00:01`, 0 shows `00:00`, never negative.

---

### Task 1: Clock formatting

**Files:** Create `src/lib/time.ts`, `src/lib/time.test.ts`.

- `formatClock(ms: number): string`: whole seconds rounded up, `mm:ss`, minutes not capped at 59 (`90:00`), negatives clamp to `00:00`.
- `formatHours(seconds: number): string`: hours with one decimal and a thousands separator, `"1,234.5"`; used for progress later.
- Tests: `formatClock(1_500_000) === "25:00"`, `(1_499_001) === "25:00"`, `(1_499_000) === "24:59"`, `(1) === "00:01"`, `(0) === "00:00"`, `(-5) === "00:00"`, `(5_400_000) === "90:00"`; `formatHours(0) === "0.0"`, `(5_400) === "1.5"`, `(4_444_200) === "1,234.5"`.

### Task 2: Timer state machine

**Files:** Create `src/features/timer/core/timer.ts`, `src/features/timer/core/timer.test.ts`.

**Interfaces (produced):**

```ts
type Phase = "focus" | "shortBreak" | "longBreak";
type TimerStatus = "idle" | "running" | "paused";
type TimerSettings = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakEvery: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
};
type TimerState = {
  phase: Phase;
  status: TimerStatus;
  plannedMs: number;
  accumulatedMs: number;
  runningSince: number | null;
  phaseStartedAt: number | null;
  completedFocusCount: number;
};
type TimerAction = {
  type: "start" | "pause" | "resume" | "skip" | "reset" | "tick";
};
type FocusEnded = {
  type: "focusEnded";
  startedAt: number;
  endedAt: number;
  focusedMs: number;
  plannedMs: number;
  outcome: "completed" | "interrupted";
};
type PhaseChanged = {
  type: "phaseChanged";
  from: Phase;
  to: Phase;
  at: number;
};
type TimerEvent = FocusEnded | PhaseChanged;

const DEFAULT_TIMER_SETTINGS: TimerSettings;
const MIN_FOCUS_MS = 60_000;
function initialTimerState(settings: TimerSettings): TimerState;
function elapsedMs(state: TimerState, now: number): number;
function remainingMs(state: TimerState, now: number): number;
function applySettings(state: TimerState, settings: TimerSettings): TimerState;
function timerReducer(
  state: TimerState,
  action: TimerAction,
  now: number,
  settings: TimerSettings,
): { state: TimerState; events: TimerEvent[] };
```

Tests, each written and watched failing first: initial state; start/pause/resume arithmetic; ignored actions; natural end of focus (completed event with exact `endedAt`, short break next, idle); fourth focus leads to a long break; break end leads to focus; auto-start chains phases from the exact end time; one late tick replays several phases; skip and reset with the 60 s rule; `applySettings` only touches idle phases.
