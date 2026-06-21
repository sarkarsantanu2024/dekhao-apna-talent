/**
 * Fixed platform-admin logins (User ID + password).
 *
 * The two admin identities are fixed, but their PASSWORDS come from environment
 * variables so no real credential ever lives in source control:
 *
 *   ADMIN_PASSWORD_PINTU      → pintu.gupta
 *   ADMIN_PASSWORD_SANTANU    → santanu.sarkar
 *
 * In production these MUST be set (in Vercel). If unset in production the admin
 * is dropped from the list (can't sign in) rather than falling back to a weak
 * default. Outside production a dev fallback keeps local work frictionless.
 *
 * Centre owners don't have fixed logins — their credentials are derived
 * deterministically from the centre row (see lib/auth/center-credentials.ts).
 */

export type FixedUser = {
  id: string;
  name: string;
  userId: string;
  password: string;
  role: "admin" | "center_owner";
  centerId: string | null;
};

/** Dev convenience only — never used in production builds. */
const devFallback = (pwd: string) => (process.env.NODE_ENV === "production" ? "" : pwd);

const ALL_ADMINS: FixedUser[] = [
  {
    id: "u-admin-1",
    name: "Pintu Gupta",
    userId: "pintu.gupta",
    password: process.env.ADMIN_PASSWORD_PINTU ?? devFallback("12345"),
    role: "admin",
    centerId: null,
  },
  {
    id: "u-admin-2",
    name: "Santanu Sarkar",
    userId: "santanu.sarkar",
    password: process.env.ADMIN_PASSWORD_SANTANU ?? devFallback("12345"),
    role: "admin",
    centerId: null,
  },
];

export const FIXED_USERS: FixedUser[] = ALL_ADMINS.filter((u) => u.password.length > 0);
