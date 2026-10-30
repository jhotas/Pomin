"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { NavList } from "./nav-list";

function CurrentNavList() {
  return <NavList pathname={usePathname()} />;
}

/**
 * The main navigation with the current page marked. Reading the URL is
 * request data, so it sits in Suspense; the static shell shows the same links
 * without a mark.
 */
export function MainNav() {
  return (
    <Suspense fallback={<NavList pathname="" />}>
      <CurrentNavList />
    </Suspense>
  );
}
