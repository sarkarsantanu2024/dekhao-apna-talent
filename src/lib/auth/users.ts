/**
 * TEMPORARY fixed logins.
 *
 * Until Supabase auth + a real users table are wired up, the portal has exactly
 * two accounts: one platform admin and one centre owner. Change the passwords
 * here (or move them to env vars) before any public deployment.
 *
 * The centre owner's `centerId` matches the seeded demo centre in
 * src/services/local-store.ts (DEMO_CENTRE_ID) so the centre dashboard shows
 * its data. When Supabase is connected, replace this whole file.
 */

export type FixedUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "center_owner";
  centerId: string | null;
};

export const FIXED_USERS: FixedUser[] = [
  {
    id: "u-admin",
    name: "Administrator",
    email: "admin@dekhaoapnatalent.com",
    password: "Admin@123",
    role: "admin",
    centerId: null,
  },
  {
    id: "u-centre",
    name: "Centre Owner",
    email: "centre@dekhaoapnatalent.com",
    password: "Centre@123",
    role: "center_owner",
    centerId: "11111111-1111-1111-1111-111111111111",
  },
];
