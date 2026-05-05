import type { SupabaseClient } from "@supabase/supabase-js";

import { getSchoolDayBoundsUtc } from "@/lib/school-timezone";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

/** Mesmo tipo que `requireAdminSession` passa — evita conflito de genéricos SSR vs `SupabaseClient<Database>`. */
export type AdminDashboardSupabaseClient = ReturnType<typeof createServerSupabaseClient>;

export interface AdminDashboardCounts {
  activeStudents: number;
  lessonsToday: number;
  financialOverdue: number;
  tripsOpen: number;
}

function schoolTodayBounds(): { start: string; end: string } {
  return getSchoolDayBoundsUtc(new Date());
}

export async function fetchAdminDashboardCounts(
  supabase: AdminDashboardSupabaseClient
): Promise<AdminDashboardCounts> {
  /** Cast interno: `@supabase/ssr` e `@supabase/supabase-js` divergem nos genéricos do cliente; o cast restaura inferência em `.from()`/`Row`. */
  const db = supabase as unknown as SupabaseClient<Database>;

  const { start, end } = schoolTodayBounds();

  const [
    activeStudentsRes,
    lessonsTodayRes,
    financialOverdueRes,
    tripsFutureRes,
  ] = await Promise.all([
    db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student")
      .eq("is_active", true),
    db
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .gte("scheduled_at", start)
      .lt("scheduled_at", end)
      .neq("status", "cancelled"),
    db
      .from("financials")
      .select("id", { count: "exact", head: true })
      .eq("status", "overdue"),
    db
      .from("surf_trips")
      .select("id, spots_total, spots_taken")
      .gte("trip_date", new Date().toISOString().slice(0, 10)),
  ]);

  const tripsRows = tripsFutureRes.data ?? [];
  const tripsOpen = tripsRows.filter((t) => t.spots_taken < t.spots_total).length;

  return {
    activeStudents: activeStudentsRes.count ?? 0,
    lessonsToday: lessonsTodayRes.count ?? 0,
    financialOverdue: financialOverdueRes.count ?? 0,
    tripsOpen,
  };
}
