"use client";

import { useCallback, useSyncExternalStore } from "react";

export const MOBILE_QUERY = "(max-width: 767px)";

/**
 * Subscribes to a media query. Unlike reading `window.innerWidth` in an effect,
 * this resolves during render on the client, so it never triggers a second
 * cascading render, and it keeps tracking the query as the viewport changes.
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query]
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  // The server can't know the viewport; assume desktop so the markup stays stable.
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsMobile() {
  return useMediaQuery(MOBILE_QUERY);
}
