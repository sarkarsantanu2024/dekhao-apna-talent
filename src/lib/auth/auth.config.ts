import type { NextAuthConfig } from "next-auth";
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "center_owner";
      centerId: string | null;
    } & DefaultSession["user"];
  }
}

/**
 * Edge-safe auth config — NO Node APIs (fs, etc.) and NO providers here, so it
 * can be imported by the edge middleware. The Credentials provider (which reads
 * the local centre-logins file) lives in auth.ts, used only in the Node runtime.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: "admin" | "center_owner" }).role;
        token.centerId = (user as { centerId: string | null }).centerId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "center_owner";
        session.user.centerId = (token.centerId as string | null) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
