import type { ReactNode } from "react";

/** A key on the keyboard, drawn as a small sticker keycap. */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg border-2 border-text bg-cream px-1.5 font-display text-small font-medium shadow-pressed">
      {children}
    </kbd>
  );
}
