import { isDemoMode } from "@/lib/supabase/mock-client";

export function DemoBanner() {
  if (!isDemoMode()) return null;
  return (
    <div className="bg-amber-400 px-4 py-2 text-center text-xs font-medium text-amber-950">
      Demo mode · admin data persists in your browser&apos;s localStorage · login{" "}
      <span className="font-mono">admin@dekhaoapnatalent.com</span> /{" "}
      <span className="font-mono">Admin@123</span>
    </div>
  );
}
