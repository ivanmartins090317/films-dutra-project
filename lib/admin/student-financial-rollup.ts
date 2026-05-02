import type { PublicEnums } from "@/types/database";

export type StudentPaymentRollup = "overdue" | "pending" | "clear" | "none";

export function rollupStudentFinancialStatuses(
  statuses: PublicEnums["financial_status"][] | undefined
): StudentPaymentRollup {
  if (!statuses?.length) return "none";
  if (statuses.some((s) => s === "overdue")) return "overdue";
  if (statuses.some((s) => s === "pending")) return "pending";
  return "clear";
}
