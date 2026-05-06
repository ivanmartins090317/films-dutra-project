import type { SupabaseClient } from "@supabase/supabase-js";

import { formatInTimeZone } from "date-fns-tz";

import type { createServerSupabaseClient } from "@/lib/supabase/server";
import { SCHOOL_TIMEZONE } from "@/lib/school-timezone";
import type { Database, PublicEnums } from "@/types/database";

export type AdminSupabase = ReturnType<typeof createServerSupabaseClient>;

export interface SurfTripRow {
  id: string;
  title: string;
  destination: string;
  trip_date: string;
  description: string;
  spots_total: number;
  spots_taken: number;
  cover_url: string;
  created_at: string;
}

export interface TripRegistrationWithStudent {
  id: string;
  trip_id: string;
  student_id: string;
  student_name: string | null;
  status: PublicEnums["trip_registration_status"];
  created_at: string;
}

export interface SurfTripWithRegistrations extends SurfTripRow {
  registrations: TripRegistrationWithStudent[];
}

export function schoolCalendarYearNow(): number {
  return Number.parseInt(formatInTimeZone(new Date(), SCHOOL_TIMEZONE, "yyyy"), 10);
}

export async function fetchSurfTripsWithRegistrationsForYear(
  client: AdminSupabase,
  year: number
): Promise<SurfTripWithRegistrations[]> {
  const db = client as unknown as SupabaseClient<Database>;
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;

  const { data: trips, error: tripsErr } = await db
    .from("surf_trips")
    .select(
      "id, title, destination, trip_date, description, spots_total, spots_taken, cover_url, created_at"
    )
    .gte("trip_date", start)
    .lte("trip_date", end)
    .order("trip_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (tripsErr || !trips?.length) {
    return [];
  }

  const tripIds = trips.map((t) => t.id);
  const { data: regs } = await db
    .from("trip_registrations")
    .select("id, trip_id, student_id, status, created_at")
    .in("trip_id", tripIds)
    .order("created_at", { ascending: true });

  const studentIds = Array.from(new Set((regs ?? []).map((r) => r.student_id)));
  const { data: profiles } =
    studentIds.length > 0
      ? await db.from("profiles").select("id, full_name").in("id", studentIds)
      : { data: [] as { id: string; full_name: string | null }[] };

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name] as const));

  const byTrip = new Map<string, TripRegistrationWithStudent[]>();
  for (const tid of tripIds) {
    byTrip.set(tid, []);
  }
  for (const r of regs ?? []) {
    const list = byTrip.get(r.trip_id);
    if (!list) continue;
    list.push({
      id: r.id,
      trip_id: r.trip_id,
      student_id: r.student_id,
      student_name: nameById.get(r.student_id) ?? null,
      status: r.status,
      created_at: r.created_at,
    });
  }

  return trips.map((t) => ({
    id: t.id,
    title: t.title,
    destination: t.destination,
    trip_date: t.trip_date,
    description: t.description,
    spots_total: t.spots_total,
    spots_taken: t.spots_taken,
    cover_url: t.cover_url,
    created_at: t.created_at,
    registrations: byTrip.get(t.id) ?? [],
  }));
}
