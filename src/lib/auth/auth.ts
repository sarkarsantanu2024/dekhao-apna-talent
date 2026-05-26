import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyPassword } from "@/lib/auth/password";

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
      authorize: async (raw) => {
        const parsed = credSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const { data: user, error } = await supabaseAdmin()
          .from("users")
          .select("id, name, email, password_hash, role, center_id")
          .eq("email", email)
          .maybeSingle();
        if (error || !user) return null;

        const ok = await verifyPassword(password, user.password_hash as string);
        if (!ok) return null;

        return {
          id: user.id as string,
          email: user.email as string,
          name: user.name as string,
          role: user.role as "admin" | "center_owner",
          centerId: (user.center_id as string | null) ?? null,
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
