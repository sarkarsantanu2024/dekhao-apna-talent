/**
 * IDs of the pre-launch test/dummy rows in the live Supabase database,
 * snapshotted on 16 Aug 2026 (all data present at that point was test data —
 * confirmed by the admin). The dashboard's "Show test data" toggle uses these
 * to filter test rows out, so real rows created afterwards always show.
 *
 * When the test rows are finally deleted from the database (Reports → Reset,
 * or manually), this file can be emptied or removed along with the toggle.
 */

export const TEST_CENTER_IDS: ReadonlySet<string> = new Set([
  "e9d24c05-47f5-41c7-9828-fd631a4dccf9",
  "5c61f1ee-f813-44eb-9c8e-b8b41d6d88dc",
  "97043e66-d82d-4518-b8ef-12c30133d949",
]);

export const TEST_STUDENT_IDS: ReadonlySet<string> = new Set([
  "400b99d1-70c1-46c6-a9c0-85c04e80c41b",
  "5d311dcf-3023-4ed5-9067-aa376546ea2b",
  "a307c230-2ca0-4dc6-b15c-a891a17d4bcb",
  "c8f6360e-9210-41b9-b5f2-537965819852",
  "f59570df-f0fa-485d-b4a9-e96bc7702542",
  "96174d0e-8f61-44ee-acc1-88120c0c4450",
  "3ce9b972-4c79-45ab-8c19-1b3dde8a15b0",
  "b1e85a6f-283d-4f98-a9f9-4f2ead1a9ab7",
  "2a3a3b3e-5431-494f-86d7-a340510df20f",
  "8e85ad1d-61ab-49a6-b6a2-48a8d96dffc2",
]);

export const TEST_PAYMENT_IDS: ReadonlySet<string> = new Set([
  "229ea2a5-71c1-460c-9347-5b091ea166e6",
  "120e8207-aa3c-4f96-8d1c-adf9ea150101",
  "f4f56dad-55cc-489f-b4e6-f315c8c7a628",
  "43cdd4f0-5b97-4729-80d9-720391eff89a",
  "d43c0380-6fb8-499c-9ef9-e2d9640cdade",
  "e5f83edf-30ba-41c3-a2e9-a3314a75282a",
  "f6c2c435-8b62-467a-8626-b1e8d3239f75",
  "830f15ab-ab11-4fe1-89ac-56282d3e232e",
  "af99fd0c-9f77-4cc3-af5f-72aa369a45aa",
  "f6248965-4b0d-4d8c-a1a6-724d7e68d485",
]);
