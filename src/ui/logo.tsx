/**
 * The mark is the mastery grid in miniature: 10,000 hours drawn as blocks,
 * the finished ones in ink and the block in progress in the data hue.
 */
export function Logo() {
  return (
    <span className="flex items-center gap-2 text-section font-medium">
      <svg aria-hidden width="20" height="20" viewBox="0 0 20 20">
        <rect x="1" y="1" width="8" height="8" rx="1.5" fill="var(--text)" />
        <rect x="11" y="1" width="8" height="8" rx="1.5" fill="var(--text)" />
        <rect x="1" y="11" width="8" height="8" rx="1.5" fill="var(--text)" />
        <rect x="11" y="11" width="8" height="8" rx="1.5" fill="var(--data)" />
      </svg>
      pomoapp
    </span>
  );
}
