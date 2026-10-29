import { ChangeNotifier } from "./notifier";
import type { Unsubscribe } from "./repositories";
import { DEFAULT_SETTINGS, SettingsSchema, type Settings } from "./schemas";

export const SETTINGS_KEY = "pomoapp:settings";

export type SettingsStore = {
  /** The current settings; the same object until they change. */
  get(): Settings;
  /** Validates and saves a change; throws if the result is invalid. */
  update(patch: Partial<Settings>): Settings;
  subscribe(listener: () => void): Unsubscribe;
};

/** Settings kept in `localStorage`. Without storage (SSR) it keeps them in memory. */
export function createSettingsStore(
  storage: Storage | undefined,
): SettingsStore {
  const notifier = new ChangeNotifier();
  let current: Settings | undefined;

  function load(): Settings {
    const stored = storage?.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    try {
      const parsed = SettingsSchema.safeParse(JSON.parse(stored));
      return parsed.success ? parsed.data : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  return {
    get() {
      current ??= load();
      return current;
    },

    update(patch) {
      const next = SettingsSchema.parse({ ...this.get(), ...patch });
      storage?.setItem(SETTINGS_KEY, JSON.stringify(next));
      current = next;
      notifier.notify();
      return next;
    },

    subscribe: (listener) => notifier.subscribe(listener),
  };
}
