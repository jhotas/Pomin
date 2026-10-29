"use client";

import { useEffect } from "react";

type Shortcuts = { toggle: () => void; skip: () => void; reset: () => void };

const TEXT_ENTRY = 'input, textarea, select, [contenteditable="true"]';
const ACTIVATES_ON_SPACE = `${TEXT_ENTRY}, button, a, summary`;

/** Space starts or pauses, S skips, R resets. Typing in a field is left alone. */
export function useTimerShortcuts({ toggle, skip, reset }: Shortcuts) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;

      if (event.key === " ") {
        // Space already presses a focused button; don't press twice.
        if (target?.closest(ACTIVATES_ON_SPACE)) return;
        event.preventDefault();
        toggle();
        return;
      }
      if (target?.closest(TEXT_ENTRY)) return;
      const key = event.key.toLowerCase();
      if (key === "s") skip();
      else if (key === "r") reset();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle, skip, reset]);
}
