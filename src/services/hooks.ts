"use client";

/**
 * React hooks that bind UI to the active DataStore.
 *
 * Every hook returns `{ data, loading, error, reload }`. All hooks subscribe to
 * the `STORE_CHANGED` event so any mutation (from any component) instantly
 * re-renders consumers. They also listen to `storage` for cross-tab sync.
 *
 * Re-fetching on argument change: each domain hook wraps its store call in a
 * `useCallback` keyed by a stable JSON snapshot of its options. When the key
 * changes, the fetcher's identity changes, which makes `useAsync`'s effect
 * (which depends on `reload`, which depends on the fetcher) re-run and pull
 * fresh data. This is what makes `useStudents({ centerId })` correctly
 * re-scope when the resolved `centerId` flips from `undefined` to a real id
 * after `useCenters` settles.
 */

import { useCallback, useEffect, useState } from "react";
import { store, STORE_CHANGED } from "./index";
import type { DashboardStats } from "./store";
import type { Category, Center, Payment, PaymentStatus, Student, StudentStatus } from "@/types";

type Result<T> = { data: T; loading: boolean; error: Error | null; reload: () => void };

function useAsync<T>(initial: T, fetcher: () => Promise<T>): Result<T> {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    fetcher()
      .then((d) => { setData(d); setError(null); })
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [fetcher]);

  useEffect(() => {
    void store.ensureSeeded().then(reload);

    const handler = () => reload();
    window.addEventListener(STORE_CHANGED, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(STORE_CHANGED, handler);
      window.removeEventListener("storage", handler);
    };
  }, [reload]);

  return { data, loading, error, reload };
}

/* ---------- domain hooks ---------- */

const emptyStats: DashboardStats = {
  students: 0,
  centers: 0,
  pendingStudents: 0,
  approvedStudents: 0,
  rejectedStudents: 0,
  activeStudents: 0,
  pendingPayments: 0,
  approvedPayments: 0,
  rejectedPayments: 0,
  collected: 0,
  byCategory: [],
};

export function useStats() {
  return useAsync<DashboardStats>(emptyStats, useCallback(() => store.getStats(), []));
}

export function useStudents(opts?: { centerId?: string; status?: StudentStatus }) {
  const key = JSON.stringify(opts ?? {});
  return useAsync<Student[]>([], useCallback(() => store.listStudents(opts), [key])); // eslint-disable-line react-hooks/exhaustive-deps
}

export function useCenters() {
  return useAsync<Center[]>([], useCallback(() => store.listCenters(), []));
}

export function usePayments(opts?: { status?: PaymentStatus; centerId?: string }) {
  const key = JSON.stringify(opts ?? {});
  return useAsync<Payment[]>([], useCallback(() => store.listPayments(opts), [key])); // eslint-disable-line react-hooks/exhaustive-deps
}

export function useCategories() {
  return useAsync<Category[]>([], useCallback(() => store.listCategories(), []));
}
