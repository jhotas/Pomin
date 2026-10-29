"use client";

import { useEffect } from "react";

/** Sets the tab title while `title` is a string; restores the old one after. */
export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    if (title === null) return;
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
