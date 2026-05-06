import Link from "next/link";

import { AdminFinanceiroClient } from "@/components/admin/admin-financeiro-client";
import {
  buildMonthlyReceivedSeries,
  summarizeFinancialRows,
} from "@/lib/admin/financial-dashboard-stats";
import {
  fetchAllFinancialsForSummary,
  fetchFinancialsForStudent,
  fetchPaidFinancialsForChart,
} from "@/lib/admin/financial-queries";
import { fetchActiveStudentsForSelect } from "@/lib/admin/lessons-queries";
import { requireAdminSession } from "@/lib/admin/session";
import { schoolNowYm } from "@/lib/school-timezone";
import { schoolTodayDateKey } from "@/lib/admin/financial-status";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface FinanceiroPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function parseYearMonth(
  rawYear: string | undefined,
  rawMonth: string | undefined
): { year: number; month: number } {
  const now = schoolNowYm();
  const year = rawYear ? Number.parseInt(rawYear, 10) : now.year;
  const month = rawMonth ? Number.parseInt(rawMonth, 10) : now.month;
  if (
    !Number.isFinite(year) ||
    year < 2000 ||
    year > 2100 ||
    !Number.isFinite(month) ||
    month < 1 ||
    month > 12
  ) {
    return now;
  }
  return { year, month };
}

export default async function AdminFinanceiroPage({ searchParams }: FinanceiroPageProps) {
  const { supabase } = await requireAdminSession();

  const students = await fetchActiveStudentsForSelect(supabase);
  const activeIds = new Set(students.map((s) => s.id));

  const yr = typeof searchParams.year === "string" ? searchParams.year : undefined;
  const mo = typeof searchParams.month === "string" ? searchParams.month : undefined;
  const { year: refYear, month: refMonth } = parseYearMonth(yr, mo);

  const studentRaw = searchParams.student;
  const studentParam = typeof studentRaw === "string" ? studentRaw : undefined;
  const studentId =
    studentParam && UUID_RE.test(studentParam) && activeIds.has(studentParam)
      ? studentParam
      : students[0]?.id ?? null;

  const todayKey = schoolTodayDateKey();
  const defaultDueDate = `${refYear}-${String(refMonth).padStart(2, "0")}-01`;

  const [allSummaryRows, paidChartRows, studentEntries] = await Promise.all([
    fetchAllFinancialsForSummary(supabase),
    fetchPaidFinancialsForChart(supabase),
    studentId ? fetchFinancialsForStudent(supabase, studentId) : Promise.resolve([]),
  ]);

  const summary = summarizeFinancialRows(allSummaryRows, {
    year: refYear,
    month: refMonth,
    todayKey,
  });
  const chartData = buildMonthlyReceivedSeries(paidChartRows, refYear, refMonth, 12);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Painel
        </Link>
        <div className="mt-4 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Financeiro</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Lançamentos por aluno com situação pago, pendente ou vencido. Consolidado mensal,
            inadimplência e gráfico de recebidos. Área do aluno não lista estes dados (RLS apenas
            administrador nesta tabela).
          </p>
        </div>
      </div>

      <AdminFinanceiroClient
        refYear={refYear}
        refMonth={refMonth}
        todayKey={todayKey}
        defaultDueDate={defaultDueDate}
        initialStudentId={studentId}
        students={students}
        entries={studentEntries}
        summary={summary}
        chartData={chartData}
      />
    </div>
  );
}
