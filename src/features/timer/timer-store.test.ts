import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  DEFAULT_TIMER_SETTINGS,
  initialTimerState,
  type TimerSettings,
} from "./core/timer";
import { createTimerStore, TIMER_KEY } from "./timer-store";

const T0 = Date.parse("2026-10-29T09:00:00.000Z");
const MIN = 60_000;
const GUITAR = "00000000-0000-4000-8000-000000000001";
const CHESS = "00000000-0000-4000-8000-000000000002";

let settings: TimerSettings;
const getSettings = () => settings;

beforeEach(() => {
  localStorage.clear();
  settings = DEFAULT_TIMER_SETTINGS;
});

test("starts as an idle focus block with no skill", () => {
  const store = createTimerStore(localStorage, getSettings);
  expect(store.get()).toEqual({
    state: initialTimerState(settings),
    skillId: null,
  });
  expect(store.get()).toBe(store.get());
});

test("survives a reload in the middle of a block", () => {
  const store = createTimerStore(localStorage, getSettings);
  store.selectSkill(GUITAR);
  store.dispatch({ type: "start" }, T0);

  const reloaded = createTimerStore(localStorage, getSettings);
  expect(reloaded.get()).toEqual(store.get());
  const events = reloaded.dispatch({ type: "tick" }, T0 + 25 * MIN);
  expect(events[0]).toMatchObject({ type: "focusEnded", startedAt: T0 });
});

test.each([
  ["broken JSON", "{oops"],
  ["an old shape", JSON.stringify({ phase: "work" })],
])("starts fresh from %s", (_, stored) => {
  localStorage.setItem(TIMER_KEY, stored);
  expect(createTimerStore(localStorage, getSettings).get()).toEqual({
    state: initialTimerState(settings),
    skillId: null,
  });
});

test("dispatch returns the reducer's events and notifies subscribers", () => {
  const store = createTimerStore(localStorage, getSettings);
  const listener = vi.fn();
  store.subscribe(listener);
  store.selectSkill(GUITAR);
  store.dispatch({ type: "start" }, T0);
  const events = store.dispatch({ type: "skip" }, T0 + 5 * MIN);
  expect(events.map((event) => event.type)).toEqual([
    "focusEnded",
    "phaseChanged",
  ]);
  expect(listener).toHaveBeenCalledTimes(3);
});

test("an action that changes nothing does not notify", () => {
  const store = createTimerStore(localStorage, getSettings);
  const listener = vi.fn();
  store.subscribe(listener);
  store.dispatch({ type: "pause" }, T0);
  expect(listener).not.toHaveBeenCalled();
});

describe("choosing the skill", () => {
  test("is allowed while the timer is idle", () => {
    const store = createTimerStore(localStorage, getSettings);
    expect(store.selectSkill(GUITAR)).toBe(true);
    expect(store.get().skillId).toBe(GUITAR);
  });

  test("is locked while a block runs or is paused", () => {
    const store = createTimerStore(localStorage, getSettings);
    store.selectSkill(GUITAR);
    store.dispatch({ type: "start" }, T0);
    expect(store.selectSkill(CHESS)).toBe(false);
    store.dispatch({ type: "pause" }, T0 + MIN);
    expect(store.selectSkill(CHESS)).toBe(false);
    expect(store.get().skillId).toBe(GUITAR);
  });
});

test("new settings reach an idle timer", () => {
  const store = createTimerStore(localStorage, getSettings);
  settings = { ...settings, focusMinutes: 50 };
  store.applySettings();
  expect(store.get().state.plannedMs).toBe(50 * MIN);
});

test("follows a change made in another tab", () => {
  const here = createTimerStore(localStorage, getSettings);
  const listener = vi.fn();
  here.subscribe(listener);

  const otherTab = createTimerStore(localStorage, getSettings);
  otherTab.selectSkill(GUITAR);
  otherTab.dispatch({ type: "start" }, T0);
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: TIMER_KEY,
      newValue: localStorage.getItem(TIMER_KEY),
    }),
  );

  expect(listener).toHaveBeenCalled();
  expect(here.get()).toEqual(otherTab.get());
});
