import { beforeEach, expect, test, vi } from "vitest";
import { DEFAULT_SETTINGS } from "./schemas";
import { createSettingsStore, SETTINGS_KEY } from "./settings-store";

beforeEach(() => {
  localStorage.clear();
});

test("starts from the defaults", () => {
  expect(createSettingsStore(localStorage).get()).toEqual(DEFAULT_SETTINGS);
});

test("returns the same object until something changes", () => {
  const store = createSettingsStore(localStorage);
  expect(store.get()).toBe(store.get());
});

test("saves changes and reads them back in a new store", () => {
  createSettingsStore(localStorage).update({ focusMinutes: 50 });
  expect(createSettingsStore(localStorage).get()).toEqual({
    ...DEFAULT_SETTINGS,
    focusMinutes: 50,
  });
});

test("rejects invalid changes and keeps the old value", () => {
  const store = createSettingsStore(localStorage);
  expect(() => store.update({ focusMinutes: 0 })).toThrow();
  expect(store.get().focusMinutes).toBe(25);
});

test.each([
  ["broken JSON", "{not json"],
  ["an invalid value", JSON.stringify({ focusMinutes: -3 })],
  ["a non-object", JSON.stringify(42)],
])("falls back to the defaults on %s", (_, stored) => {
  localStorage.setItem(SETTINGS_KEY, stored);
  expect(createSettingsStore(localStorage).get()).toEqual(DEFAULT_SETTINGS);
});

test("fills fields added since the settings were saved", () => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ focusMinutes: 40 }));
  expect(createSettingsStore(localStorage).get()).toEqual({
    ...DEFAULT_SETTINGS,
    focusMinutes: 40,
  });
});

test("works without storage, as during server rendering", () => {
  const store = createSettingsStore(undefined);
  expect(store.get()).toEqual(DEFAULT_SETTINGS);
  expect(store.update({ soundEnabled: false }).soundEnabled).toBe(false);
});

test("notifies subscribers after a change", () => {
  const store = createSettingsStore(localStorage);
  const listener = vi.fn();
  const stop = store.subscribe(listener);
  store.update({ soundEnabled: false });
  expect(listener).toHaveBeenCalledOnce();
  stop();
  store.update({ soundEnabled: true });
  expect(listener).toHaveBeenCalledOnce();
});
