"use client";

import { Download, Upload } from "lucide-react";
import { useId, useRef, useState, type ChangeEvent } from "react";
import { BackupSchema } from "@/data/backup";
import { useAppData } from "@/data/provider";
import { buttonClass } from "@/ui/button";
import { SettingsSection } from "@/ui/settings-section";

type Status =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "done"; message: string }
  | { kind: "error"; message: string };

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

function saveFile(name: string, contents: string) {
  const url = URL.createObjectURL(
    new Blob([contents], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  // The download has its own copy once it starts.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Where the data lives, and a JSON copy of it to download or bring back. */
export function DataSection() {
  const data = useAppData();
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const working = status.kind === "working";

  async function exportData() {
    if (!data) return;
    setStatus({ kind: "working" });
    try {
      const backup = await data.backup.export();
      const day = backup.exportedAt.slice(0, 10);
      saveFile(`pomoapp-${day}.json`, JSON.stringify(backup, null, 2));
      setStatus({
        kind: "done",
        message: `Saved ${plural(backup.skills.length, "skill")} and ${plural(backup.sessions.length, "session")}.`,
      });
    } catch {
      setStatus({ kind: "error", message: "The copy could not be made." });
    }
  }

  async function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // The same file can be picked again later.
    event.target.value = "";
    if (!data || !file) return;
    setStatus({ kind: "working" });
    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      setStatus({ kind: "error", message: `${file.name} is not JSON.` });
      return;
    }
    const backup = BackupSchema.safeParse(parsed);
    if (!backup.success) {
      setStatus({
        kind: "error",
        message: `${file.name} is not a pomoapp copy.`,
      });
      return;
    }
    try {
      const result = await data.backup.import(backup.data);
      setStatus({
        kind: "done",
        message:
          result.skills === 0 && result.sessions === 0
            ? "Everything in that copy is already here. Settings restored."
            : `Added or updated ${plural(result.skills, "skill")} and ${plural(result.sessions, "session")}, and restored the settings.`,
      });
    } catch {
      setStatus({
        kind: "error",
        message: "The copy could not be brought in.",
      });
    }
  }

  return (
    <SettingsSection
      title="Data"
      description="This browser keeps its own copy of your skills and sessions. Save it as a file, or bring a saved one back."
    >
      <p>
        The app reads from this copy, so it works offline. Signed out, clearing
        this site&apos;s data in your browser deletes it; signed in, your
        account keeps a copy.
      </p>
      <p className="mt-2 text-muted">
        Bringing a copy back adds what is missing and keeps the later version of
        anything already here. Nothing is deleted.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={exportData}
          disabled={!data || working}
          className={buttonClass("secondary")}
        >
          <Download aria-hidden size={18} strokeWidth={2.5} />
          Save a copy
        </button>
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={!data || working}
          className={buttonClass("secondary")}
        >
          <Upload aria-hidden size={18} strokeWidth={2.5} />
          Bring a copy back
        </button>
        <input
          ref={input}
          id={inputId}
          type="file"
          accept="application/json,.json"
          onChange={importData}
          aria-label="pomoapp copy to bring back"
          className="sr-only"
          tabIndex={-1}
        />
      </div>
      <p
        role="status"
        className={`mt-3 empty:hidden ${status.kind === "error" ? "text-negative" : ""}`}
      >
        {status.kind === "done" || status.kind === "error"
          ? status.message
          : ""}
      </p>
    </SettingsSection>
  );
}
