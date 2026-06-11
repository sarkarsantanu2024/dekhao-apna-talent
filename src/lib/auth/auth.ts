import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { FIXED_USERS } from "@/lib/auth/users";
import { authConfig } from "@/lib/auth/auth.config";
import { findCenterLogin } from "@/lib/auth/center-login-store";

const credSchema = z.object({
  userId: z.string().min(3),
  password: z.string().min(4),
});

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

        // 2) Locally-generated centre logins (demo stopgap, file-backed).
        const centre = await findCenterLogin(userId, password);
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
