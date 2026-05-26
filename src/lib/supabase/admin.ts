import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mockClient, isDemoMode } from "./mock-client";

/**
 * Server-only Supabase client.
 *
 * In demo mode (no env configured, or DEMO_MODE=true) this returns an
 * in-memory mock that mimics the Supabase JS surface this app uses. Data
 * resets every time the Node process restarts. Perfect for client demos —
 * swap to real Supabase later by populating .env.local.
 */
let _admin: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (isDemoMode()) {
    return mockClient as unknown as SupabaseClient;
  }
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  _admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}
