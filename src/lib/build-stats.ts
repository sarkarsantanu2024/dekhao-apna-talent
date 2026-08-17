import type { Center, Payment, Student } from "@/types";
import type { DashboardStats } from "@/services/store";

/**
 * Compute DashboardStats from raw lists on the client. Mirrors the store's
 * getStats() so pages that filter rows (e.g. hiding marked test data) can show
 * numbers that mean exactly the same thing as the unfiltered ones.
 */
export function buildStats(
  students: Student[],
  payments: Payment[],
  centers: Center[],
): DashboardStats {
  const byCat = new Map<string, number>();
  let pendingStudents = 0, approvedStudents = 0, rejectedStudents = 0, activeStudents = 0;
  for (const s of students) {
    byCat.set(s.category_name, (byCat.get(s.category_name) ?? 0) + 1);
    if      (s.status === "pending")  pendingStudents++;
    else if (s.status === "approved") approvedStudents++;
    else if (s.status === "rejected") rejectedStudents++;
    else if (s.status === "active")   activeStudents++;
  }
  let pendingPayments = 0, approvedPayments = 0, rejectedPayments = 0, collected = 0;
  for (const p of payments) {
    if      (p.status === "pending")  pendingPayments++;
    else if (p.status === "approved") { approvedPayments++; collected += Number(p.amount); }
    else if (p.status === "rejected") rejectedPayments++;
  }
  return {
    students: students.length,
    centers: centers.length,
    pendingStudents, approvedStudents, rejectedStudents, activeStudents,
    pendingPayments, approvedPayments, rejectedPayments,
    collected,
    byCategory: Array.from(byCat.entries()).map(([categoryName, count]) => ({ categoryName, count })),
  };
}
