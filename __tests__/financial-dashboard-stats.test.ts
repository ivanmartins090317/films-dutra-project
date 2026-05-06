import { describe, expect, it } from "vitest";

import {
  buildMonthlyReceivedSeries,
  isPaidAtInMonth,
  summarizeFinancialRows,
} from "@/lib/admin/financial-dashboard-stats";
import type { FinancialEntryRow } from "@/lib/admin/financial-queries";

describe("isPaidAtInMonth", () => {
  it("filtra por mês civil", () => {
    expect(isPaidAtInMonth("2026-03-15", 2026, 3)).toBe(true);
    expect(isPaidAtInMonth("2026-03-15", 2026, 4)).toBe(false);
  });
});

describe("summarizeFinancialRows", () => {
  const todayKey = "2026-05-06";

  it("soma receita do mês por paid_at", () => {
    const rows: FinancialEntryRow[] = [
      {
        id: "a",
        student_id: "s1",
        type: "monthly",
        amount: 100,
        due_date: "2026-05-01",
        paid_at: "2026-05-02",
        status: "paid",
        notes: "",
        created_at: "2026-05-01T00:00:00Z",
      },
      {
        id: "b",
        student_id: "s1",
        type: "monthly",
        amount: 50,
        due_date: "2026-04-01",
        paid_at: "2026-04-28",
        status: "paid",
        notes: "",
        created_at: "2026-04-01T00:00:00Z",
      },
    ];
    const s = summarizeFinancialRows(rows, { year: 2026, month: 5, todayKey });
    expect(s.monthRevenue).toBe(100);
    expect(s.totalReceivedAllTime).toBe(150);
  });

  it("classifica vencido e pendente sem pagamento", () => {
    const rows: FinancialEntryRow[] = [
      {
        id: "a",
        student_id: "s1",
        type: "single",
        amount: 40,
        due_date: "2026-04-01",
        paid_at: null,
        status: "overdue",
        notes: "",
        created_at: "2026-04-01T00:00:00Z",
      },
      {
        id: "b",
        student_id: "s1",
        type: "single",
        amount: 60,
        due_date: "2026-06-01",
        paid_at: null,
        status: "pending",
        notes: "",
        created_at: "2026-04-01T00:00:00Z",
      },
    ];
    const s = summarizeFinancialRows(rows, { year: 2026, month: 5, todayKey });
    expect(s.overdueAmount).toBe(40);
    expect(s.overdueCount).toBe(1);
    expect(s.pendingAmount).toBe(60);
  });
});

describe("buildMonthlyReceivedSeries", () => {
  it("agrega por mês", () => {
    const series = buildMonthlyReceivedSeries(
      [
        { paid_at: "2026-05-10", amount: 100 },
        { paid_at: "2026-05-20", amount: 50 },
        { paid_at: "2026-04-01", amount: 10 },
      ],
      2026,
      5,
      3
    );
    const may = series.find((d) => d.year === 2026 && d.month === 5);
    const apr = series.find((d) => d.year === 2026 && d.month === 4);
    expect(may?.total).toBe(150);
    expect(apr?.total).toBe(10);
  });
});
