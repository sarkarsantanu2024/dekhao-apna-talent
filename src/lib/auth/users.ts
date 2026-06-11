/**
 * TEMPORARY fixed logins (User ID + password).
 *
 * Until Supabase auth + a real users table are wired up, the portal authenticates
 * against this list: two platform admins and one demo centre owner. When Supabase
 * is connected, replace this whole file (and the credentials provider in auth.ts).
 *
 * The centre owner's `centerId` matches the seeded demo centre in
 * src/services/local-store.ts (DEMO_CENTRE_ID).
 */

export type FixedUser = {
  id: string;
  name: string;
  userId: string;
  password: string;
  role: "admin" | "center_owner";
  centerId: string | null;
};

export const FIXED_USERS: FixedUser[] = [
  {
    id: "u-admin-1",
    name: "Pintu Gupta",
    userId: "pintu.gupta",
    password: "12345",
    role: "admin",
    centerId: null,
  },
  {
    id: "u-admin-2",
    name: "Santanu Sarkar",
    userId: "santanu.sarkar",
    password: "12345",
    role: "admin",
    centerId: null,
  },
  {
    id: "u-centre",
    name: "Centre Owner",
    userId: "centre.owner",
    password: "12345",
    role: "center_owner",
    centerId: "11111111-1111-1111-1111-111111111111",
  },
];
