import { isDemoMode } from "@/lib/supabase/mock-client";

export function DemoBanner() {
  if (!isDemoMode()) return null;
  return (
    <div className="bg-amber-400 px-4 py-2 text-center text-xs font-medium text-amber-950">
      Demo mode · in-memory data · resets on server restart · backend not connected
    </div>
  );
}
