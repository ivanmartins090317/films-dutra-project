import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export interface AdminDashboardCounts {
  activeStudents: number;
  lessonsToday: number;
  financialOverdue: number;
  tripsOpen: number;
}

function utcDayBounds(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function fetchAdminDashboardCounts(
  supabase: SupabaseClient<Database>
): Promise<AdminDashboardCounts> {
  const { start, end } = utcDayBounds();

  const [
    activeStudentsRes,
    lessonsTodayRes,
    financialOverdueRes,
    tripsFutureRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student")
      .eq("is_active", true),
    supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .gte("scheduled_at", start)
      .lt("scheduled_at", end),
    supabase
      .from("financials")
      .select("id", { count: "exact", head: true })
      .eq("status", "overdue"),
    supabase
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
