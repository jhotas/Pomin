"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { PomoDatabase } from "./dexie/database";
import { createDexieRepositories } from "./dexie/repositories";
import type { Repositories } from "./repositories";
import { createSettingsStore, type SettingsStore } from "./settings-store";
import {
  createTimerStore,
  type TimerStore,
} from "@/features/timer/timer-store";

export type AppData = Repositories & {
  settings: SettingsStore;
  timer: TimerStore;
};

/** null while rendering on the server, where there is no browser storage. */
const AppDataContext = createContext<AppData | null | undefined>(undefined);

const noSubscription = () => () => {};

function createLocalAppData(): AppData | null {
  if (typeof window === "undefined") return null;
  const settings = createSettingsStore(window.localStorage);
  return {
    ...createDexieRepositories(new PomoDatabase()),
    settings,
    timer: createTimerStore(window.localStorage, settings.get),
  };
}

export function AppDataProvider({
  children,
  value,
}: {
  children: ReactNode;
  /** Replaces the browser's data, for tests. */
  value?: AppData;
}) {
  const [clientData] = useState(() => value ?? createLocalAppData());
  // Hydration must render what the server rendered (no data), or React keeps
  // the server's attributes (a `disabled` button) on the client. The browser's
  // data is handed out only after hydration.
  const data = useSyncExternalStore(
    noSubscription,
    () => clientData,
    () => value ?? null,
  );
  return (
    <AppDataContext.Provider value={data}>{children}</AppDataContext.Provider>
  );
}

export function useAppData(): AppData | null {
  const data = useContext(AppDataContext);
  if (data === undefined) {
    throw new Error("useAppData must be used inside <AppDataProvider>.");
  }
  return data;
}
