"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { PomoDatabase } from "./dexie/database";
import { createDexieRepositories } from "./dexie/repositories";
import type { Repositories } from "./repositories";
import { createSettingsStore, type SettingsStore } from "./settings-store";

export type AppData = Repositories & { settings: SettingsStore };

/** null while rendering on the server, where there is no browser storage. */
const AppDataContext = createContext<AppData | null | undefined>(undefined);

function createLocalAppData(): AppData | null {
  if (typeof window === "undefined") return null;
  return {
    ...createDexieRepositories(new PomoDatabase()),
    settings: createSettingsStore(window.localStorage),
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
  const [data] = useState(() => value ?? createLocalAppData());
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
