/**
 * One small dot per focus block in the round before a long break, filled as
 * each block is completed.
 */
export function PomoDots({ done, total }: { done: number; total: number }) {
  return (
    <div
      role="img"
      aria-label={`${done} of ${total} pomodoros done`}
      className="flex items-center gap-2"
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`size-3 rounded-full border-2 border-text transition-colors duration-300 md:size-3.5 ${
            index < done ? "bg-primary" : "bg-surface"
          }`}
        />
      ))}
    </div>
  );
}
