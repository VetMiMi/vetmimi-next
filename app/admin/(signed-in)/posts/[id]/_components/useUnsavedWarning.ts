"use client";

import { useCallback, useEffect, useRef } from "react";

const QUESTION = "Leave this post? Your unsaved changes will be lost.";

// Warns before unsaved changes are lost: the browser's own prompt when the
// tab closes or reloads, and a confirm for a link inside admin, which
// next/link would otherwise follow without unloading the page. Returns
// `release`, for a reload Daw Mi asked for herself.
export function useUnsavedWarning(dirty: boolean) {
  const released = useRef(false);

  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!released.current) event.preventDefault();
    };
    // Capture on the document runs before React's own click handling, so
    // stopping here keeps next/link from navigating.
    const click = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (
        !link ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.getAttribute("target") === "_blank"
      )
        return;
      if (!window.confirm(QUESTION)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", click, true);
    };
  }, [dirty]);

  return useCallback(() => {
    released.current = true;
  }, []);
}
