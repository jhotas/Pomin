import { HardDrive } from "lucide-react";

/** The scope of the data, shown where a workspace switcher would sit. */
export function StorageScope() {
  return (
    <p className="flex items-center gap-2.5 px-2.5 text-small text-muted">
      <HardDrive aria-hidden size={16} strokeWidth={1.5} />
      Saved in this browser
    </p>
  );
}
