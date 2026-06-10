import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { FIXED_USERS } from "@/lib/auth/users";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "center_owner";
      centerId: string | null;
    } & DefaultSession["user"];
  }
}

const credSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // TEMPORARY auth: two fixed accounts (admin + centre owner). No database
      // yet — this will be replaced by Supabase auth + a real users table later.
      authorize: async (raw) => {
        const parsed = credSchema.safeParse(raw);
        if (!parsed.success) return null;
        const email = parsed.data.email.trim().toLowerCase();
        const { password } = parsed.data;

        const match = FIXED_USERS.find(
          (u) => u.email === email && u.password === password
        );
        if (!match) return null;

        return {
          id: match.id,
          email: match.email,
          name: match.name,
          role: match.role,
          centerId: match.centerId,
        };
      },
    }),
  ],
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
});
