import type { SupabaseClient } from "@supabase/supabase-js";

import { rollupStudentFinancialStatuses } from "@/lib/admin/student-financial-rollup";
import type { ParsedStudentsListParams } from "@/lib/admin/students-list-params";
import type { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database, ProfileRow, PublicEnums } from "@/types/database";

export type StudentListRow = Pick<
  ProfileRow,
  "id" | "full_name" | "phone" | "avatar_url" | "is_active" | "role" | "created_at"
>;

export interface StudentListRowEnriched extends StudentListRow {
  lastLessonScheduledAt: string | null;
  lastLessonStatus: PublicEnums["lesson_status"] | null;
  paymentSummary: ReturnType<typeof rollupStudentFinancialStatuses>;
}

export interface AdminStudentsListResult {
  students: StudentListRowEnriched[];
  totalCount: number;
  page: number;
  error: Error | null;
}

/** Limite de linhas ao buscar aulas recentes por página — cobre histórico típico sem RPC. */
const LESSON_SCAN_LIMIT = 2500;

export async function fetchAdminStudentsList(
  client: ReturnType<typeof createServerSupabaseClient>,
  rawParams: ParsedStudentsListParams
): Promise<AdminStudentsListResult> {
  let countQuery = client
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "student");

  if (rawParams.q) countQuery = countQuery.ilike("full_name", `%${rawParams.q}%`);
  if (rawParams.status === "active") countQuery = countQuery.eq("is_active", true);
  if (rawParams.status === "inactive") countQuery = countQuery.eq("is_active", false);

  const { count: rawCount, error: countErr } = await countQuery;

  if (countErr) {
    return { students: [], totalCount: 0, page: 1, error: new Error(countErr.message) };
  }

  const totalCount = rawCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / rawParams.perPage));
  const page = Math.min(Math.max(1, rawParams.page), totalPages);
  const from = (page - 1) * rawParams.perPage;
  const to = from + rawParams.perPage - 1;

  let dataQuery = client
    .from("profiles")
    .select("id, full_name, phone, avatar_url, is_active, role, created_at")
    .eq("role", "student");

  if (rawParams.q) dataQuery = dataQuery.ilike("full_name", `%${rawParams.q}%`);
  if (rawParams.status === "active") dataQuery = dataQuery.eq("is_active", true);
  if (rawParams.status === "inactive") dataQuery = dataQuery.eq("is_active", false);

  switch (rawParams.sort) {
    case "name_desc":
      dataQuery = dataQuery.order("full_name", { ascending: false });
      break;
    case "created_desc":
      dataQuery = dataQuery.order("created_at", { ascending: false });
      break;
    default:
      dataQuery = dataQuery.order("full_name", { ascending: true });
  }

  const { data: rows, error: dataErr } = await dataQuery.range(from, to);

  if (dataErr) {
    return { students: [], totalCount, page, error: new Error(dataErr.message) };
  }

  const studentsBase = (rows ?? []) as StudentListRow[];

  const enriched = await enrichStudentsListRows(client, studentsBase);

  return { students: enriched, totalCount, page, error: null };
}

async function enrichStudentsListRows(
  client: ReturnType<typeof createServerSupabaseClient>,
  students: StudentListRow[]
): Promise<StudentListRowEnriched[]> {
  if (students.length === 0) return [];

  const db = client as unknown as SupabaseClient<Database>;
  const ids = students.map((s) => s.id);

  const nowIso = new Date().toISOString();

  const [{ data: lessonRows }, { data: financialRows }] = await Promise.all([
    db
      .from("lessons")
      .select("student_id, scheduled_at, status")
      .in("student_id", ids)
      .lte("scheduled_at", nowIso)
      .order("scheduled_at", { ascending: false })
      .limit(LESSON_SCAN_LIMIT),
    db.from("financials").select("student_id, status").in("student_id", ids),
  ]);

  const lastLessonByStudent = new Map<
    string,
    { scheduled_at: string; status: PublicEnums["lesson_status"] }
  >();
  for (const row of lessonRows ?? []) {
    if (!lastLessonByStudent.has(row.student_id)) {
      lastLessonByStudent.set(row.student_id, {
        scheduled_at: row.scheduled_at,
        status: row.status,
      });
    }
  }

  const financesByStudent = new Map<string, PublicEnums["financial_status"][]>();
  for (const row of financialRows ?? []) {
    const arr = financesByStudent.get(row.student_id) ?? [];
    arr.push(row.status);
    financesByStudent.set(row.student_id, arr);
  }

  return students.map((s) => {
    const last = lastLessonByStudent.get(s.id);
    return {
      ...s,
      lastLessonScheduledAt: last?.scheduled_at ?? null,
      lastLessonStatus: last?.status ?? null,
      paymentSummary: rollupStudentFinancialStatuses(financesByStudent.get(s.id)),
    };
  });
}
