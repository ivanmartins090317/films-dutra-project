import { formatInTimeZone } from "date-fns-tz";

import { SCHOOL_TIMEZONE, formatLessonDateTimeSchool } from "@/lib/school-timezone";
import type { AppSupabaseClient } from "@/lib/supabase/ssr-client-type";
import type { Database, PublicEnums } from "@/types/database";

export type LessonRow = Database["public"]["Tables"]["lessons"]["Row"];
export type EvolutionEntryRow = Database["public"]["Tables"]["evolution_entries"]["Row"];
export type SurfTripRow = Database["public"]["Tables"]["surf_trips"]["Row"];
export type TripRegistrationRow = Database["public"]["Tables"]["trip_registrations"]["Row"];

function schoolTodayDateKey(now: Date = new Date()): string {
  return formatInTimeZone(now, SCHOOL_TIMEZONE, "yyyy-MM-dd");
}

export async function fetchStudentUpcomingLessons(
  db: AppSupabaseClient,
  studentId: string,
  limit: number
): Promise<LessonRow[]> {
  const isoNow = new Date().toISOString();
  const { data, error } = await db
    .from("lessons")
    .select("*")
    .eq("student_id", studentId)
    .gte("scheduled_at", isoNow)
    .neq("status", "cancelled")
    .order("scheduled_at", { ascending: true })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data as LessonRow[];
}

export async function fetchStudentLessonHistory(
  db: AppSupabaseClient,
  studentId: string,
  limit: number
): Promise<LessonRow[]> {
  const { data, error } = await db
    .from("lessons")
    .select("*")
    .eq("student_id", studentId)
    .order("scheduled_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data as LessonRow[];
}

export async function fetchStudentEvolutionEntries(
  db: AppSupabaseClient,
  studentId: string,
  limit: number
): Promise<EvolutionEntryRow[]> {
  const { data, error } = await db
    .from("evolution_entries")
    .select("*")
    .eq("student_id", studentId)
    .order("entry_date", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data as EvolutionEntryRow[];
}

export interface StudentTripWithMine {
  trip: SurfTripRow;
  myStatus: PublicEnums["trip_registration_status"] | null;
  registrationId: string | null;
}

export async function fetchStudentTripsOpen(
  db: AppSupabaseClient,
  studentId: string
): Promise<StudentTripWithMine[]> {
  const todayKey = schoolTodayDateKey();
  const { data: trips, error: tripsErr } = await db
    .from("surf_trips")
    .select("*")
    .gte("trip_date", todayKey)
    .order("trip_date", { ascending: true });

  if (tripsErr || !trips?.length) {
    return [];
  }

  const typedTrips = trips as SurfTripRow[];
  const tripIds = typedTrips.map((t) => t.id);

  const { data: regs, error: regErr } = await db
    .from("trip_registrations")
    .select("id, trip_id, student_id, status")
    .eq("student_id", studentId)
    .in("trip_id", tripIds);

  const myByTrip = new Map<string, TripRegistrationRow>();
  if (!regErr && regs) {
    for (const r of regs as TripRegistrationRow[]) {
      myByTrip.set(r.trip_id, r);
    }
  }

  return typedTrips.map((trip) => {
    const mine = myByTrip.get(trip.id);
    return {
      trip,
      myStatus: mine?.status ?? null,
      registrationId: mine?.id ?? null,
    };
  });
}

export function lessonSummaryLine(lesson: LessonRow): string {
  const when = formatLessonDateTimeSchool(lesson.scheduled_at);
  const duration = `${lesson.duration_min} min`;
  return `${when} · ${duration}`;
}
