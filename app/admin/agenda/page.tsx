import Link from "next/link";

import { AdminAgendaClient } from "@/components/admin/admin-agenda-client";
import {
  fetchActiveStudentsForSelect,
  fetchLessonsInSchoolMonth,
} from "@/lib/admin/lessons-queries";
import { requireAdminSession } from "@/lib/admin/session";
import { schoolNowYm, utcInstantToSchoolDateKey } from "@/lib/school-timezone";

interface AgendaPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function parseYm(searchParams: AgendaPageProps["searchParams"]): { year: number; month: number } {
  const fallback = schoolNowYm();
  const yRaw = searchParams.year;
  const mRaw = searchParams.month;
  const year =
    typeof yRaw === "string" && /^\d{4}$/.test(yRaw)
      ? Number(yRaw)
      : fallback.year;
  let month =
    typeof mRaw === "string" && /^\d{1,2}$/.test(mRaw) ? Number(mRaw) : fallback.month;
  month = Math.min(12, Math.max(1, month));
  return { year, month };
}

function resolveInitialDayKey(
  year: number,
  month: number,
  dayParam: string | undefined
): string {
  const viewYm = `${year}-${String(month).padStart(2, "0")}`;
  const todayKey = utcInstantToSchoolDateKey(new Date().toISOString());
  if (dayParam && /^\d{4}-\d{2}-\d{2}$/.test(dayParam) && dayParam.startsWith(viewYm)) {
    return dayParam;
  }
  if (todayKey.startsWith(viewYm)) {
    return todayKey;
  }
  return `${viewYm}-01`;
}

export default async function AdminAgendaPage({ searchParams }: AgendaPageProps) {
  const { supabase } = await requireAdminSession();
  const { year, month } = parseYm(searchParams);
  const dayRaw = searchParams.day;
  const dayParam = typeof dayRaw === "string" ? dayRaw : undefined;
  const initialDayKey = resolveInitialDayKey(year, month, dayParam);
  const [lessons, students] = await Promise.all([
    fetchLessonsInSchoolMonth(supabase, year, month),
    fetchActiveStudentsForSelect(supabase),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Painel
        </Link>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Agenda</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Calendário de aulas em horário de Brasília (
              <span className="whitespace-nowrap">America/São_Paulo</span>). Cadastro e edição com
              validação de conflito por aluno.
            </p>
          </div>
        </div>
      </div>

      <AdminAgendaClient
        key={`${year}-${month}`}
        year={year}
        month={month}
        initialDayKey={initialDayKey}
        lessons={lessons}
        students={students}
      />
    </div>
  );
}
