import type { SupabaseClient } from "@supabase/supabase-js";

import type { AdminDashboardSupabaseClient } from "@/lib/admin/dashboard-queries";
import {
  filterBirthdaysWithinUtcDays,
  type BirthdaySoonRow,
} from "@/lib/admin/student-birthday-window";
import type { Database, PublicEnums } from "@/types/database";

export interface UpcomingLessonFeedRow {
  id: string;
  student_id: string;
  student_name: string | null;
  scheduled_at: string;
  duration_min: number;
  status: PublicEnums["lesson_status"];
}

export interface OverdueFinancialFeedRow {
  id: string;
  student_id: string;
  student_name: string | null;
  amount: number;
  due_date: string;
}

const UPCOMING_LESSONS_LIMIT = 10;
const OVERDUE_FINANCIAL_LIMIT = 10;
const BIRTHDAY_WINDOW_DAYS = 7;
const BIRTHDAY_LIST_LIMIT = 8;

export interface AdminDashboardFeed {
  upcomingLessons: UpcomingLessonFeedRow[];
  overdueFinancials: OverdueFinancialFeedRow[];
  birthdaysSoon: BirthdaySoonRow[];
}

export async function fetchAdminDashboardFeed(
  supabase: AdminDashboardSupabaseClient
): Promise<AdminDashboardFeed> {
  const db = supabase as unknown as SupabaseClient<Database>;
  const nowIso = new Date().toISOString();

  const [lessonsRes, financialRes, profilesRes] = await Promise.all([
    db
      .from("lessons")
      .select("id, student_id, scheduled_at, duration_min, status")
      .gte("scheduled_at", nowIso)
      .neq("status", "cancelled")
      .order("scheduled_at", { ascending: true })
      .limit(UPCOMING_LESSONS_LIMIT),
    db
      .from("financials")
      .select("id, student_id, amount, due_date")
      .eq("status", "overdue")
      .order("due_date", { ascending: true })
      .limit(OVERDUE_FINANCIAL_LIMIT),
    db
      .from("profiles")
      .select("id, full_name, birth_date")
      .eq("role", "student")
      .eq("is_active", true)
      .not("birth_date", "is", null),
  ]);

  const lessonRows = lessonsRes.data ?? [];
  const financialRows = financialRes.data ?? [];
  const profileRows = profilesRes.data ?? [];

  const studentIds = new Set<string>();
  for (const l of lessonRows) studentIds.add(l.student_id);
  for (const f of financialRows) studentIds.add(f.student_id);

  const namesMap = new Map<string, string | null>();
  if (studentIds.size > 0) {
    const { data: nameRows } = await db
      .from("profiles")
      .select("id, full_name")
      .in("id", Array.from(studentIds));
    for (const r of nameRows ?? []) namesMap.set(r.id, r.full_name);
  }

  const upcomingLessons: UpcomingLessonFeedRow[] = lessonRows.map((l) => ({
    id: l.id,
    student_id: l.student_id,
    student_name: namesMap.get(l.student_id) ?? null,
    scheduled_at: l.scheduled_at,
    duration_min: l.duration_min,
    status: l.status,
  }));

  const overdueFinancials: OverdueFinancialFeedRow[] = financialRows.map((f) => ({
    id: f.id,
    student_id: f.student_id,
    student_name: namesMap.get(f.student_id) ?? null,
    amount: f.amount,
    due_date: f.due_date,
  }));

  const birthdaysSoon = filterBirthdaysWithinUtcDays(
    profileRows.map((p) => ({
      id: p.id,
      full_name: p.full_name,
      birth_date: p.birth_date,
    })),
    new Date(),
    BIRTHDAY_WINDOW_DAYS
  ).slice(0, BIRTHDAY_LIST_LIMIT);

  return { upcomingLessons, overdueFinancials, birthdaysSoon };
}
