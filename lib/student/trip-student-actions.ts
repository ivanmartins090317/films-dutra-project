"use server";

import { revalidatePath } from "next/cache";
import { formatInTimeZone } from "date-fns-tz";
import type { SupabaseClient } from "@supabase/supabase-js";

import { SCHOOL_TIMEZONE } from "@/lib/school-timezone";
import { requireStudentSession } from "@/lib/student/session";
import { studentTripRegistrationUpsertSchema } from "@/lib/validations/student-trip";
import type { Database, PublicEnums } from "@/types/database";

function schoolTodayDateKey(): string {
  return formatInTimeZone(new Date(), SCHOOL_TIMEZONE, "yyyy-MM-dd");
}

function revalidateStudentTrips() {
  revalidatePath("/student");
  revalidatePath("/student/trips");
}

export async function upsertStudentTripRegistrationAction(
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = studentTripRegistrationUpsertSchema.safeParse(raw);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ??
      parsed.error.flatten().formErrors.join(" ") ??
      "Dados inválidos.";
    return { ok: false, error: msg };
  }

  const { tripId, status } = parsed.data;
  const { supabase, profile } = await requireStudentSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const { data: trip, error: tripErr } = await db
    .from("surf_trips")
    .select("id, trip_date, spots_total, spots_taken")
    .eq("id", tripId)
    .maybeSingle();

  if (tripErr || !trip) {
    return { ok: false, error: "Trip não encontrada ou indisponível." };
  }

  if (trip.trip_date < schoolTodayDateKey()) {
    return { ok: false, error: "Esta trip já passou; não é possível alterar a inscrição." };
  }

  const { data: mine, error: mineErr } = await db
    .from("trip_registrations")
    .select("id, status")
    .eq("trip_id", tripId)
    .eq("student_id", profile.id)
    .maybeSingle();

  if (mineErr) {
    return { ok: false, error: mineErr.message ?? "Não foi possível carregar sua inscrição." };
  }

  const previous = (mine?.status ?? null) as PublicEnums["trip_registration_status"] | null;
  const wouldConsumeSlot = status === "confirmed" && previous !== "confirmed";
  const freeSlots = trip.spots_total - trip.spots_taken;
  if (wouldConsumeSlot && freeSlots <= 0) {
    return { ok: false, error: "Não há vagas disponíveis para confirmação nesta trip." };
  }

  const row = {
    trip_id: tripId,
    student_id: profile.id,
    status,
  };

  if (mine?.id) {
    const { error } = await db.from("trip_registrations").update({ status }).eq("id", mine.id);
    if (error) {
      return { ok: false, error: mapTripRegError(error.message ?? "") };
    }
  } else {
    const { error } = await db.from("trip_registrations").insert(row);
    if (error) {
      return { ok: false, error: mapTripRegError(error.message ?? "") };
    }
  }

  revalidateStudentTrips();
  return { ok: true };
}

function mapTripRegError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("vagas") || lower.includes("spots")) {
    return "Não foi possível confirmar: vagas esgotadas ou limite ultrapassado.";
  }
  return message.length > 0 ? message : "Não foi possível salvar a inscrição.";
}
