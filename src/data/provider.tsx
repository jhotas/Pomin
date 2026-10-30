"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createBackupService, type BackupService } from "./backup";
import { PomoDatabase } from "./dexie/database";
import { createDexieRepositories } from "./dexie/repositories";
import { ChangeNotifier } from "./notifier";
import type { Repositories } from "./repositories";
import { createSettingsStore, type SettingsStore } from "./settings-store";
import {
  createAccountStore,
  type AccountStore,
} from "@/features/account/account-store";
import { createBrowserSupabase } from "@/features/account/supabase";
import {
  createTimerStore,
  type TimerStore,
} from "@/features/timer/timer-store";

export type AppData = Repositories & {
  settings: SettingsStore;
  timer: TimerStore;
  backup: BackupService;
  /** null when no Supabase project is configured. */
  account: AccountStore | null;
};

/** null while rendering on the server, where there is no browser storage. */
const AppDataContext = createContext<AppData | null | undefined>(undefined);

const noSubscription = () => () => {};

function createLocalAppData(): AppData | null {
  if (typeof window === "undefined") return null;
  const storage = window.localStorage;
  const db = new PomoDatabase();
  // Repositories and sync write the same database, so they share a notifier.
  const notifier = new ChangeNotifier();
  const settings = createSettingsStore(storage);
  const timer = createTimerStore(storage, settings.get);
  const supabase = createBrowserSupabase();
  const repositories = createDexieRepositories(db, { notifier });
  // Every browser has the default skill, also right after a sign-out clears
  // the data. Signing in merges it into the account's own by name.
  const keepDefaultSkill = () => {
    repositories.skills.ensureDefault().catch((error: unknown) => {
      console.error("Could not create the default skill", error);
    });
  };
  keepDefaultSkill();
  notifier.subscribe(keepDefaultSkill);
  return {
    ...repositories,
    settings,
    timer,
    backup: createBackupService({ db, notifier, settings }),
    account: supabase
      ? createAccountStore({ supabase, db, notifier, timer, storage })
      : null,
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
