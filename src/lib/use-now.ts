"use client";

import { useState, useSyncExternalStore } from "react";

const noSubscription = () => () => {};

/**
 * The time the screen was opened, or null while rendering on the server and
 * hydrating, so the server's HTML and the first client render agree.
 */
export function useNow(): Date | null {
  const [clientNow] = useState(() =>
    typeof window === "undefined" ? null : new Date(Date.now()),
  );
  return useSyncExternalStore(
    noSubscription,
    () => clientNow,
    () => null,
  );
}
