import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { FIXED_USERS } from "@/lib/auth/users";
import { authConfig } from "@/lib/auth/auth.config";
import { findCenterLogin } from "@/lib/auth/center-login-store";
import { buildCenterCredentials } from "@/lib/auth/center-credentials";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/supabase/mock-client";
import type { Center } from "@/types";

const credSchema = z.object({
  userId: z.string().min(3),
  password: z.string().min(4),
});

/**
 * Validate a centre login against Supabase by deriving each centre's
 * deterministic credentials (same logic as the Credentials page) and matching.
 * Stateless — no file needed — so it works on serverless hosts (Vercel).
 */
async function findSupabaseCenterLogin(userId: string, password: string) {
  try {
    const { data, error } = await supabaseAdmin()
      .from("centers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return null;
    const creds = buildCenterCredentials(data as unknown as Center[]);
    const match = creds.find(
      (c) => c.login_id.toLowerCase() === userId && c.login_password === password,
    );
    return match ? { center_id: match.center.id, center_name: match.center.center_name, login_id: match.login_id } : null;
  } catch {
    return null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        userId: { label: "User ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // TEMPORARY auth. Fixed admin/centre accounts + locally-generated centre
      // logins (see center-login-store.ts). Replaced by Supabase auth later.
      authorize: async (raw) => {
        const parsed = credSchema.safeParse(raw);
        if (!parsed.success) return null;
        const userId = parsed.data.userId.trim().toLowerCase();
        const { password } = parsed.data;

        // 1) Fixed accounts (two admins + demo centre owner).
        const fixed = FIXED_USERS.find((u) => u.userId === userId && u.password === password);
        if (fixed) {
          return {
            id: fixed.id,
            email: fixed.userId,
            name: fixed.name,
            role: fixed.role,
            centerId: fixed.centerId,
          };
        }

        // 2) Centre owners — deterministic per-centre credentials.
        //    Supabase mode derives them from the centres table (stateless,
        //    Vercel-safe); local demo falls back to the file-backed store.
        const centre = isDemoMode()
          ? await findCenterLogin(userId, password)
          : await findSupabaseCenterLogin(userId, password);
        if (centre) {
          return {
            id: `centre:${centre.center_id}`,
            email: centre.login_id,
            name: centre.center_name,
            role: "center_owner",
            centerId: centre.center_id,
          };
        }

        return null;
      },
    }),
  ],
});
