import type { ReactNode } from "react";

/** An empty block keeps its frame and says, in one sentence, what goes here. */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-control px-4 py-3 text-muted">
      {children}
    </div>
  );
}
