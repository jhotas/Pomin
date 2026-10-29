import { createTimerStore } from "@/features/timer/timer-store";
import { PomoDatabase } from "./dexie/database";
import { createDexieRepositories } from "./dexie/repositories";
import type { AppData } from "./provider";
import { createSettingsStore } from "./settings-store";
import { sequentialIds, steppingClock } from "./testing";

let count = 0;

/**
 * Real app data for component tests: Dexie on fake-indexeddb (import
 * "fake-indexeddb/auto" in the test) and stores on jsdom's localStorage.
 */
export function createTestAppData(): { data: AppData; db: PomoDatabase } {
  localStorage.clear();
  const db = new PomoDatabase(`pomoapp-test-app-${++count}`);
  const settings = createSettingsStore(localStorage);
  const data: AppData = {
    ...createDexieRepositories(db, {
      now: steppingClock(),
      newId: sequentialIds(),
    }),
    settings,
    timer: createTimerStore(localStorage, settings.get),
  };
  return { data, db };
}
