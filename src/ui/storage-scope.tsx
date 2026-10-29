"use client";

import { Cloud, HardDrive } from "lucide-react";
import { useAccount } from "@/features/account/use-account";

/** The scope of the data, shown where a workspace switcher would sit. */
export function StorageScope() {
  const account = useAccount();
  const synced =
    account.kind === "ready" && account.state.status === "signedIn";
  const Icon = synced ? Cloud : HardDrive;
  return (
    <p className="flex items-center gap-2.5 px-2.5 text-small text-muted">
      <Icon aria-hidden size={16} strokeWidth={1.5} />
      {synced ? "Synced to your account" : "Saved in this browser"}
    </p>
  );
}
