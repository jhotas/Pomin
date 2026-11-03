import { useState } from "react";

/**
 * Counts the times `value` went up while `scope` stayed the same, so a
 * component can replay a "just gained" animation keyed on the count. The
 * first value seen, a value still loading (undefined) and a change of scope
 * count as nothing gained: only a rise the person saw happen does.
 */
export function useGains(value: number | undefined, scope: string): number {
  const [seen, setSeen] = useState({ value, scope, gains: 0 });
  if (value !== seen.value || scope !== seen.scope) {
    const rose =
      scope === seen.scope &&
      value !== undefined &&
      seen.value !== undefined &&
      value > seen.value;
    const next = { value, scope, gains: seen.gains + (rose ? 1 : 0) };
    // Adjusting state while rendering, as React documents for values that
    // depend on the previous render; React re-renders before painting.
    setSeen(next);
    return next.gains;
  }
  return seen.gains;
}
