import { describe, expect, test } from "vitest";
import {
  applySettings,
  DEFAULT_TIMER_SETTINGS,
  elapsedMs,
  initialTimerState,
  remainingMs,
  timerReducer,
  type TimerAction,
  type TimerEvent,
  type TimerSettings,
  type TimerState,
} from "./timer";

const MIN = 60_000;
const FOCUS = 25 * MIN;
const SHORT = 5 * MIN;
const LONG = 15 * MIN;
const T0 = 1_700_000_000_000;

const manual = DEFAULT_TIMER_SETTINGS;
const auto: TimerSettings = {
  ...manual,
  autoStartBreaks: true,
  autoStartFocus: true,
};

type Step = [TimerAction["type"], number];

function run(
  steps: Step[],
  settings: TimerSettings = manual,
  from: TimerState = initialTimerState(settings),
) {
  let state = from;
  const events: TimerEvent[] = [];
  for (const [type, now] of steps) {
    const result = timerReducer(state, { type }, now, settings);
    state = result.state;
    events.push(...result.events);
  }
  return { state, events };
}

describe("initial state", () => {
  test("is an idle focus block at the configured length", () => {
    const state = initialTimerState(manual);
    expect(state).toEqual({
      phase: "focus",
      status: "idle",
      plannedMs: FOCUS,
      accumulatedMs: 0,
      runningSince: null,
      phaseStartedAt: null,
      completedFocusCount: 0,
    });
    expect(remainingMs(state, T0)).toBe(FOCUS);
  });

  test("uses the defaults 25/5/15 with a long break every 4", () => {
    expect(DEFAULT_TIMER_SETTINGS).toMatchObject({
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      longBreakEvery: 4,
    });
  });
});

describe("start, pause and resume", () => {
  test("start runs the clock from now", () => {
    const { state } = run([["start", T0]]);
    expect(state.status).toBe("running");
    expect(state.runningSince).toBe(T0);
    expect(state.phaseStartedAt).toBe(T0);
    expect(remainingMs(state, T0 + 10 * MIN)).toBe(15 * MIN);
  });

  test("paused time is not counted", () => {
    const { state } = run([
      ["start", T0],
      ["pause", T0 + 10 * MIN],
    ]);
    expect(state.status).toBe("paused");
    expect(elapsedMs(state, T0 + 15 * MIN)).toBe(10 * MIN);

    const resumed = run([["resume", T0 + 20 * MIN]], manual, state).state;
    expect(resumed.status).toBe("running");
    expect(remainingMs(resumed, T0 + 25 * MIN)).toBe(10 * MIN);
  });

  test("remaining time never goes below zero", () => {
    const { state } = run([["start", T0]]);
    expect(remainingMs(state, T0 + FOCUS + MIN)).toBe(0);
  });

  test.each<[string, Step[], TimerAction["type"]]>([
    ["pause while idle", [], "pause"],
    ["resume while idle", [], "resume"],
    ["tick while idle", [], "tick"],
    ["start while running", [["start", T0]], "start"],
    ["resume while running", [["start", T0]], "resume"],
    [
      "start while paused",
      [
        ["start", T0],
        ["pause", T0 + MIN],
      ],
      "start",
    ],
  ])("%s changes nothing", (_, setup, type) => {
    const { state } = run(setup);
    const result = timerReducer(state, { type }, T0 + 2 * MIN, manual);
    expect(result.state).toBe(state);
    expect(result.events).toEqual([]);
  });

  test("a tick before the end changes nothing", () => {
    const { state } = run([["start", T0]]);
    const result = timerReducer(state, { type: "tick" }, T0 + MIN, manual);
    expect(result.state).toBe(state);
    expect(result.events).toEqual([]);
  });
});

describe("a phase running out", () => {
  test("a finished focus block is recorded at its real end, even when the tick is late", () => {
    const { state, events } = run([
      ["start", T0],
      ["tick", T0 + FOCUS + 3_000],
    ]);
    expect(events).toEqual([
      {
        type: "focusEnded",
        startedAt: T0,
        endedAt: T0 + FOCUS,
        focusedMs: FOCUS,
        plannedMs: FOCUS,
        outcome: "completed",
      },
      { type: "phaseChanged", from: "focus", to: "shortBreak", at: T0 + FOCUS },
    ]);
    expect(state).toEqual({
      phase: "shortBreak",
      status: "idle",
      plannedMs: SHORT,
      accumulatedMs: 0,
      runningSince: null,
      phaseStartedAt: null,
      completedFocusCount: 1,
    });
  });

  test("a pause moves the end later but not the focused time", () => {
    const { events } = run([
      ["start", T0],
      ["pause", T0 + 5 * MIN],
      ["resume", T0 + 10 * MIN],
      ["tick", T0 + FOCUS + 5 * MIN],
    ]);
    expect(events[0]).toMatchObject({
      type: "focusEnded",
      startedAt: T0,
      endedAt: T0 + FOCUS + 5 * MIN,
      focusedMs: FOCUS,
    });
  });

  test("a finished break leads to an idle focus block without a session", () => {
    const afterFocus = run([
      ["start", T0],
      ["tick", T0 + FOCUS],
    ]).state;
    const { state, events } = run(
      [
        ["start", T0 + FOCUS],
        ["tick", T0 + FOCUS + SHORT],
      ],
      manual,
      afterFocus,
    );
    expect(events).toEqual([
      {
        type: "phaseChanged",
        from: "shortBreak",
        to: "focus",
        at: T0 + FOCUS + SHORT,
      },
    ]);
    expect(state).toMatchObject({
      phase: "focus",
      status: "idle",
      plannedMs: FOCUS,
    });
  });

  test("every fourth focus block is followed by a long break", () => {
    let state = initialTimerState(manual);
    let now = T0;
    const phases: string[] = [];
    for (let block = 0; block < 4; block++) {
      state = run(
        [
          ["start", now],
          ["tick", (now += FOCUS)],
        ],
        manual,
        state,
      ).state;
      phases.push(state.phase);
      state = run(
        [
          ["start", now],
          ["tick", (now += state.plannedMs)],
        ],
        manual,
        state,
      ).state;
    }
    expect(phases).toEqual([
      "shortBreak",
      "shortBreak",
      "shortBreak",
      "longBreak",
    ]);
    expect(state.phase).toBe("focus");
    expect(state.completedFocusCount).toBe(4);
  });

  test("a long break lasts the long break length", () => {
    const state: TimerState = {
      ...initialTimerState(manual),
      completedFocusCount: 3,
    };
    const next = run(
      [
        ["start", T0],
        ["tick", T0 + FOCUS],
      ],
      manual,
      state,
    ).state;
    expect(next).toMatchObject({ phase: "longBreak", plannedMs: LONG });
  });
});

describe("auto-start", () => {
  test("the next phase starts at the exact end of the last one", () => {
    const { state } = run(
      [
        ["start", T0],
        ["tick", T0 + FOCUS + 1_000],
      ],
      auto,
    );
    expect(state).toMatchObject({
      phase: "shortBreak",
      status: "running",
      runningSince: T0 + FOCUS,
      phaseStartedAt: T0 + FOCUS,
    });
    expect(remainingMs(state, T0 + FOCUS + 1_000)).toBe(SHORT - 1_000);
  });

  test("one late tick replays every phase that ended while the tab was closed", () => {
    const thirdBreakStart = T0 + 3 * FOCUS + 2 * SHORT;
    const { state, events } = run(
      [
        ["start", T0],
        ["tick", thirdBreakStart + MIN],
      ],
      auto,
    );
    const sessions = events.filter((event) => event.type === "focusEnded");
    expect(sessions.map((s) => [s.startedAt, s.endedAt, s.outcome])).toEqual([
      [T0, T0 + FOCUS, "completed"],
      [T0 + FOCUS + SHORT, T0 + 2 * FOCUS + SHORT, "completed"],
      [T0 + 2 * FOCUS + 2 * SHORT, thirdBreakStart, "completed"],
    ]);
    expect(state).toMatchObject({
      phase: "shortBreak",
      status: "running",
      phaseStartedAt: thirdBreakStart,
      completedFocusCount: 3,
    });
    expect(remainingMs(state, thirdBreakStart + MIN)).toBe(SHORT - MIN);
  });

  test("auto-starting breaks only leaves the next focus block idle", () => {
    const breaksOnly = { ...manual, autoStartBreaks: true };
    const { state } = run(
      [
        ["start", T0],
        ["tick", T0 + FOCUS + SHORT + MIN],
      ],
      breaksOnly,
    );
    expect(state).toMatchObject({ phase: "focus", status: "idle" });
  });
});

describe("skip", () => {
  test("skipping focus after a minute records an interrupted session", () => {
    const { state, events } = run([
      ["start", T0],
      ["skip", T0 + 10 * MIN],
    ]);
    expect(events).toEqual([
      {
        type: "focusEnded",
        startedAt: T0,
        endedAt: T0 + 10 * MIN,
        focusedMs: 10 * MIN,
        plannedMs: FOCUS,
        outcome: "interrupted",
      },
      {
        type: "phaseChanged",
        from: "focus",
        to: "shortBreak",
        at: T0 + 10 * MIN,
      },
    ]);
    expect(state).toMatchObject({
      phase: "shortBreak",
      status: "idle",
      completedFocusCount: 1,
    });
  });

  test("skipping focus before a minute records nothing", () => {
    const { events } = run([
      ["start", T0],
      ["skip", T0 + 59_999],
    ]);
    expect(events.map((event) => event.type)).toEqual(["phaseChanged"]);
  });

  test("skipping a paused focus counts only the focused time", () => {
    const { events } = run([
      ["start", T0],
      ["pause", T0 + 3 * MIN],
      ["skip", T0 + 20 * MIN],
    ]);
    expect(events[0]).toMatchObject({
      type: "focusEnded",
      focusedMs: 3 * MIN,
      endedAt: T0 + 20 * MIN,
    });
  });

  test("skipping an idle focus block moves on without a session", () => {
    const { state, events } = run([["skip", T0]]);
    expect(events).toEqual([
      { type: "phaseChanged", from: "focus", to: "shortBreak", at: T0 },
    ]);
    expect(state.phase).toBe("shortBreak");
  });

  test("skipping a break leads to an idle focus block, even with auto-start", () => {
    const onBreak = run(
      [
        ["start", T0],
        ["tick", T0 + FOCUS],
      ],
      auto,
    ).state;
    const { state, events } = run([["skip", T0 + FOCUS + MIN]], auto, onBreak);
    expect(events).toEqual([
      {
        type: "phaseChanged",
        from: "shortBreak",
        to: "focus",
        at: T0 + FOCUS + MIN,
      },
    ]);
    expect(state).toMatchObject({ phase: "focus", status: "idle" });
  });
});

describe("reset", () => {
  test("resetting focus after a minute records an interrupted session and restarts the block", () => {
    const { state, events } = run([
      ["start", T0],
      ["reset", T0 + 2 * MIN],
    ]);
    expect(events).toEqual([
      {
        type: "focusEnded",
        startedAt: T0,
        endedAt: T0 + 2 * MIN,
        focusedMs: 2 * MIN,
        plannedMs: FOCUS,
        outcome: "interrupted",
      },
    ]);
    expect(state).toEqual(initialTimerState(manual));
  });

  test("resetting before a minute records nothing", () => {
    const { state, events } = run([
      ["start", T0],
      ["reset", T0 + 30_000],
    ]);
    expect(events).toEqual([]);
    expect(state.status).toBe("idle");
  });

  test("resetting keeps the place in the long break cycle", () => {
    const from: TimerState = {
      ...initialTimerState(manual),
      completedFocusCount: 2,
    };
    const { state } = run(
      [
        ["start", T0],
        ["reset", T0 + MIN],
      ],
      manual,
      from,
    );
    expect(state.completedFocusCount).toBe(2);
  });
});

describe("applySettings", () => {
  const longer = { ...manual, focusMinutes: 50 };

  test("changes the length of an idle phase", () => {
    const state = applySettings(initialTimerState(manual), longer);
    expect(state.plannedMs).toBe(50 * MIN);
  });

  test("leaves a running phase alone and applies from the next phase", () => {
    const running = run([["start", T0]]).state;
    expect(applySettings(running, longer)).toBe(running);

    const shorterBreaks = { ...manual, shortBreakMinutes: 10 };
    const next = run([["tick", T0 + FOCUS]], shorterBreaks, running).state;
    expect(next.plannedMs).toBe(10 * MIN);
  });
});
