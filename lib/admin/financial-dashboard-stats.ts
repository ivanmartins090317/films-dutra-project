/**
 * Agregações em memória para o painel financeiro (volume MVP).
 * Futuro: views/RPC no Postgres se a base crescer muito.
 */

import type { PaidEntryForChart } from "@/lib/admin/financial-queries";
import type { FinancialEntryRow } from "@/lib/admin/financial-queries";
import { deriveFinancialStatus } from "@/lib/admin/financial-status";

export interface FinancialDashboardSummary {
  monthRevenue: number;
  overdueCount: number;
  overdueAmount: number;
  pendingAmount: number;
  totalReceivedAllTime: number;
}

/** `paid_at` em formato AAAA-MM-DD dentro do mês civil indicado. */
export function isPaidAtInMonth(paidAt: string, year: number, month1to12: number): boolean {
  const m = `${year}-${String(month1to12).padStart(2, "0")}`;
  return paidAt.slice(0, 7) === m;
}

function isPaid(row: FinancialEntryRow): boolean {
  return Boolean(row.paid_at && row.paid_at.trim() !== "");
}

export function summarizeFinancialRows(
  rows: FinancialEntryRow[],
  opts: { year: number; month: number; todayKey: string }
): FinancialDashboardSummary {
  const { year, month, todayKey } = opts;
  let monthRevenue = 0;
  let overdueCount = 0;
  let overdueAmount = 0;
  let pendingAmount = 0;
  let totalReceivedAllTime = 0;

  for (const row of rows) {
    const amount = row.amount;

    if (isPaid(row) && row.paid_at) {
      totalReceivedAllTime += amount;
      if (isPaidAtInMonth(row.paid_at, year, month)) {
        monthRevenue += amount;
      }
      continue;
    }

    const effective = deriveFinancialStatus(row.due_date, null, todayKey);
    if (effective === "overdue") {
      overdueCount += 1;
      overdueAmount += amount;
    } else {
      pendingAmount += amount;
    }
  }

  return {
    monthRevenue,
    overdueCount,
    overdueAmount,
    pendingAmount,
    totalReceivedAllTime,
  };
}

export interface MonthlyReceivedDatum {
  year: number;
  month: number;
  label: string;
  total: number;
}

const MONTH_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function lastNClosedSchoolMonths(
  refYear: number,
  refMonth1to12: number,
  count: number
): { year: number; month: number }[] {
  const out: { year: number; month: number }[] = [];
  let y = refYear;
  let m = refMonth1to12;
  for (let i = 0; i < count; i++) {
    out.push({ year: y, month: m });
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
  }
  return out.reverse();
}

export function buildMonthlyReceivedSeries(
  paidRows: PaidEntryForChart[],
  refYear: number,
  refMonth1to12: number,
  months = 12
): MonthlyReceivedDatum[] {
  const buckets = lastNClosedSchoolMonths(refYear, refMonth1to12, months);
  return buckets.map(({ year, month }) => {
    let total = 0;
    for (const row of paidRows) {
      if (isPaidAtInMonth(row.paid_at, year, month)) {
        total += row.amount;
      }
    }
    return {
      year,
      month,
      label: `${MONTH_SHORT[month - 1]}/${String(year).slice(-2)}`,
      total,
    };
  });
}
