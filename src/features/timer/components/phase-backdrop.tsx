"use client";

import { useSyncExternalStore } from "react";
import { useAppData } from "@/data/provider";
import type { Phase } from "../core/timer";
import { PHASE_COLOR } from "../phase";

const noSubscription = () => () => {};

/**
 * The timer's phase colour over the whole page, behind the menu too, on every
 * page. The server and the first render show the focus colour.
 */
export function PhaseBackdrop() {
  const store = useAppData()?.timer;
  const phase = useSyncExternalStore<Phase>(
    store?.subscribe ?? noSubscription,
    () => store?.get().state.phase ?? "focus",
    () => "focus",
  );
  return (
    <div
      aria-hidden
      className={`fixed inset-0 -z-10 transition-colors duration-500 ${PHASE_COLOR[phase].field}`}
    />
  );
}
