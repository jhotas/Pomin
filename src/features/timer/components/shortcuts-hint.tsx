import { Kbd } from "@/ui/kbd";
import { SHORTCUTS } from "../shortcuts";

/**
 * The keyboard shortcuts, one per line, in a card at the foot of the page,
 * tucked below the bottom edge with its rim showing and rising while the
 * pointer is near it, like the menu at the top. Only with a mouse: touch
 * screens have no keys to show.
 */
export function ShortcutsHint() {
  return (
    <div className="group fixed bottom-0 left-1/2 z-10 hidden -translate-x-1/2 px-10 pt-4 pb-5 [@media(hover:hover)]:block">
      <dl
        aria-label="Keyboard shortcuts"
        className="grid translate-y-[calc(100%+0.75rem)] gap-2 rounded-card border-2 border-text bg-surface py-3 pr-5 pl-3 whitespace-nowrap shadow-sticker-sm transition-transform delay-300 duration-300 ease-out group-hover:translate-y-0 group-hover:delay-0 motion-reduce:transition-none"
      >
        {SHORTCUTS.map(({ key, short }) => (
          <div key={key} className="grid grid-cols-[4rem_auto] items-center">
            <dt className="justify-self-end pr-3">
              <Kbd>{key}</Kbd>
            </dt>
            <dd className="font-display font-medium">{short}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
