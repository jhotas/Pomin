"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "./logo";
import { StorageScope } from "./storage-scope";

function CurrentExtras({ side }: { side: "start" | "end" }) {
  // The home page shows the menu and the timer only.
  if (usePathname() === "/") return null;
  return side === "start" ? (
    <Link href="/">
      <Logo />
    </Link>
  ) : (
    <StorageScope />
  );
}

/**
 * The logo or the storage note beside the menu, on every page but the home
 * page. Reading the URL is request data, so it sits in Suspense.
 */
export function HeaderExtras({ side }: { side: "start" | "end" }) {
  return (
    <Suspense fallback={null}>
      <CurrentExtras side={side} />
    </Suspense>
  );
}
