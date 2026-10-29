"use client";

import { useLayoutEffect } from "react";

/**
 * Sets the tab title while `title` is a string. Titles that depend on browser
 * data (a skill's name, the time left) are unknown to the route's metadata,
 * which the framework may write after this runs, so the title is re-applied
 * whenever the head changes. On cleanup it restores the old title only if the
 * title is still its own: a new page may already have set one.
 */
export function useDocumentTitle(title: string | null) {
  // A layout effect cleans up inside the commit that unmounts the screen,
  // before the observer could re-apply this title over the next page's.
  useLayoutEffect(() => {
    if (title === null) return;
    const previous = document.title;
    const apply = () => {
      if (document.title !== title) document.title = title;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    return () => {
      observer.disconnect();
      if (document.title === title) document.title = previous;
    };
  }, [title]);
}
