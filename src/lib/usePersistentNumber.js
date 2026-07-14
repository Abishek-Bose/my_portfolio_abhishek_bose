"use client";

import { useCallback, useSyncExternalStore } from "react";

// localStorage fires "storage" only for *other* tabs, so same-tab writes are
// broadcast through these listeners. The cache keeps getSnapshot referentially
// stable, which useSyncExternalStore requires.
const listeners = new Map();
const cache = new Map();

function emit(key) {
  const set = listeners.get(key);
  if (set) set.forEach((fn) => fn());
}

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const n = parseInt(raw, 10);
    return Number.isNaN(n) ? fallback : n;
  } catch {
    return fallback;
  }
}

/**
 * A number persisted in localStorage, read during render rather than hydrated
 * in via an effect. Returns [value, setValue]; setValue persists and notifies.
 */
export function usePersistentNumber(key, fallback = 0) {
  const subscribe = useCallback(
    (onChange) => {
      let set = listeners.get(key);
      if (!set) {
        set = new Set();
        listeners.set(key, set);
      }
      set.add(onChange);

      const onStorage = (e) => {
        if (e.key === key) {
          cache.delete(key);
          onChange();
        }
      };
      window.addEventListener("storage", onStorage);

      return () => {
        set.delete(onChange);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key]
  );

  const getSnapshot = useCallback(() => {
    if (!cache.has(key)) cache.set(key, read(key, fallback));
    return cache.get(key);
  }, [key, fallback]);

  const getServerSnapshot = useCallback(() => fallback, [fallback]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next) => {
      cache.set(key, next);
      try {
        window.localStorage.setItem(key, String(next));
      } catch {
        // Private mode / quota — keep the in-memory value and carry on.
      }
      emit(key);
    },
    [key]
  );

  return [value, setValue];
}
