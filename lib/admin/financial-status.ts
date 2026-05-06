import { formatInTimeZone } from "date-fns-tz";

import type { PublicEnums } from "@/types/database";

import { SCHOOL_TIMEZONE } from "@/lib/school-timezone";

export function schoolTodayDateKey(now: Date = new Date()): string {
  return formatInTimeZone(now, SCHOOL_TIMEZONE, "yyyy-MM-dd");
}

/** Deriva status persistido a partir de vencimento e pagamento (fuso da escola). */
export function deriveFinancialStatus(
  dueDate: string,
  paidAt: string | null | undefined,
  todayKey: string
): PublicEnums["financial_status"] {
  if (paidAt && paidAt.trim() !== "") {
    return "paid";
  }
  if (dueDate < todayKey) {
    return "overdue";
  }
  return "pending";
}

export function financialStatusLabelPt(status: PublicEnums["financial_status"]): string {
  const map: Record<PublicEnums["financial_status"], string> = {
    paid: "Pago",
    pending: "Pendente",
    overdue: "Vencido",
  };
  return map[status];
}

export function financialTypeLabelPt(type: PublicEnums["financial_type"]): string {
  const map: Record<PublicEnums["financial_type"], string> = {
    monthly: "Mensalidade",
    package: "Pacote",
    single: "Avulso",
  };
  return map[type];
}
