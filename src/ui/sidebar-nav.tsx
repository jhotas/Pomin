"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { NavList } from "./nav-list";

function CurrentNavList({ onNavigate }: { onNavigate?: () => void }) {
  return <NavList pathname={usePathname()} onNavigate={onNavigate} />;
}

/**
 * The main navigation with the current page marked. Reading the URL is
 * request data, so it sits in Suspense; the static shell shows the same links
 * without a mark.
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Suspense fallback={<NavList pathname="" onNavigate={onNavigate} />}>
      <CurrentNavList onNavigate={onNavigate} />
    </Suspense>
  );
}
