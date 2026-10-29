"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useAppData, type AppData } from "./provider";
import type { TimeRange } from "./repositories";
import {
  DEFAULT_SETTINGS,
  type Session,
  type Settings,
  type Skill,
} from "./schemas";

export type QueryResult<T> =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "success"; data: T; error?: undefined }
  | { status: "error"; data?: undefined; error: Error };

/**
 * Runs `load` against the app's data and again after every change. Repository
 * reads are async, so this subscribes with an effect rather than
 * useSyncExternalStore, which needs a synchronous snapshot.
 */
function useLiveQuery<T>(
  load: (data: AppData) => Promise<T>,
  key: string,
): QueryResult<T> {
  const data = useAppData();
  const [result, setResult] = useState<{ key: string; value: QueryResult<T> }>({
    key,
    value: { status: "loading" },
  });

  useEffect(() => {
    if (!data) return;
    let latest = 0;
    const run = () => {
      const request = ++latest;
      load(data).then(
        (value) => {
          if (request === latest) {
            setResult({ key, value: { status: "success", data: value } });
          }
        },
        (error: unknown) => {
          if (request === latest) {
            const asError =
              error instanceof Error ? error : new Error(String(error));
            setResult({ key, value: { status: "error", error: asError } });
          }
        },
      );
    };
    run();
    const unsubscribe = data.skills.subscribe(run);
    return () => {
      latest = Number.NaN;
      unsubscribe();
    };
    // `key` identifies the query; `load` is re-created on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, key]);

  // A result for another key belongs to the previous query.
  return result.key === key ? result.value : { status: "loading" };
}

export function useSkills(options: { includeArchived?: boolean } = {}) {
  const includeArchived = options.includeArchived ?? false;
  return useLiveQuery<Skill[]>(
    (data) => data.skills.list({ includeArchived }),
    `skills:${includeArchived}`,
  );
}

export function useSkill(id: string) {
  return useLiveQuery<Skill | undefined>(
    (data) => data.skills.get(id),
    `skill:${id}`,
  );
}

export function useSkillSessions(skillId: string, range?: TimeRange) {
  return useLiveQuery<Session[]>(
    (data) => data.sessions.listBySkill(skillId, range),
    `sessions:${skillId}:${range?.from ?? ""}:${range?.to ?? ""}`,
  );
}

export function useRecentSessions(limit: number) {
  return useLiveQuery<Session[]>(
    (data) => data.sessions.listRecent(limit),
    `recent:${limit}`,
  );
}

const noSubscription = () => () => {};

export function useSettings(): [
  Settings,
  (patch: Partial<Settings>) => Settings,
] {
  const data = useAppData();
  const store = data?.settings;
  const settings = useSyncExternalStore(
    store?.subscribe ?? noSubscription,
    () => store?.get() ?? DEFAULT_SETTINGS,
    () => DEFAULT_SETTINGS,
  );
  const update = useCallback(
    (patch: Partial<Settings>) => {
      if (!store) throw new Error("Settings are not available yet.");
      return store.update(patch);
    },
    [store],
  );
  return [settings, update];
}
