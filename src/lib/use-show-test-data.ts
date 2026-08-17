"use client";

/**
 * Global "Show test data" preference. The switch lives on the dashboard, but
 * every admin list page consumes this hook so hiding test data hides it
 * everywhere at once. Persisted per-browser; synced across pages/tabs via a
 * custom event + the storage event.
 */

import { useCallback, useEffect, useState } from "react";

const KEY = "dat:show-test-data";
const EVT = "dat:show-test-data-changed";

export function useShowTestData(): [boolean, (v: boolean) => void] {
  // Default true (also the SSR value) — corrected from localStorage on mount.
  const [show, setShow] = useState(true);

  useEffect(() => {
    const read = () => setShow(window.localStorage.getItem(KEY) !== "0");
    read();
    window.addEventListener(EVT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(EVT, read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const set = useCallback((v: boolean) => {
    window.localStorage.setItem(KEY, v ? "1" : "0");
    setShow(v);
    window.dispatchEvent(new Event(EVT));
  }, []);

  return [show, set];
}
