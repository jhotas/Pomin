import { Pomo } from "./pomo";

/** Pomin's face beside the name, set in the display face. */
export function Logo() {
  return (
    <span className="flex items-center gap-2 font-display text-section font-semibold">
      <Pomo size={30} />
      Pomin
    </span>
  );
}
