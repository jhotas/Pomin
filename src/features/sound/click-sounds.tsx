"use client";

import { useEffect } from "react";
import { useAppData } from "@/data/provider";
import { playClick } from "./chiptune";

/** What counts as pressing a button: buttons, links and menu options. */
const PRESSABLE =
  'button, a[href], [role="option"], [role="switch"], [role="combobox"]';

/**
 * Plays a quiet blip whenever a button, link or option is pressed, by mouse,
 * touch or keyboard, unless sound is off in the settings. Renders nothing.
 */
export function ClickSounds() {
  const data = useAppData();

  useEffect(() => {
    if (!data) return;
    const onClick = (event: MouseEvent) => {
      if (!data.settings.get().soundEnabled) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const pressed = target.closest(PRESSABLE);
      if (!pressed) return;
      if (
        pressed.matches(":disabled") ||
        pressed.getAttribute("aria-disabled") === "true"
      ) {
        return;
      }
      playClick();
    };
    // Capture, so a handler that stops the event still gets its sound.
    document.addEventListener("click", onClick, { capture: true });
    return () =>
      document.removeEventListener("click", onClick, { capture: true });
  }, [data]);

  return null;
}
