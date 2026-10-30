import type { ReactNode } from "react";

/** A white sheet under a page, so its text reads clearly on the phase colour. */
export function PageSheet({ children }: { children: ReactNode }) {
  return (
    <div className="card bg-surface px-5 py-6 md:px-10 md:py-9">{children}</div>
  );
}
