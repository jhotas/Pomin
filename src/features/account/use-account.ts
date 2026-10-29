"use client";

import { useSyncExternalStore } from "react";
import { useAppData } from "@/data/provider";
import type { AccountState, AccountStore } from "./account-store";

const noSubscription = () => () => {};

export type AccountView =
  /** The browser's data is not ready yet (server render, hydration). */
  | { kind: "pending" }
  /** No Supabase project is configured for this copy of the app. */
  | { kind: "unavailable" }
  | { kind: "ready"; store: AccountStore; state: AccountState };

export function useAccount(): AccountView {
  const data = useAppData();
  const store = data?.account ?? null;
  const state = useSyncExternalStore(
    store?.subscribe ?? noSubscription,
    () => store?.get() ?? null,
    () => null,
  );
  if (!data) return { kind: "pending" };
  if (!store || !state) return { kind: "unavailable" };
  return { kind: "ready", store, state };
}
