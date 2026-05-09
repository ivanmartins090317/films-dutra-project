"use server";

import { Buffer } from "node:buffer";

import { revalidatePath } from "next/cache";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mimeToAvatarExtension,
  parseFormDataImageBlob,
  validateAvatarUploadFile,
} from "@/lib/admin/student-avatar-upload";
import { requireAdminSession } from "@/lib/admin/session";
import {
  adminSurfTripFormSchema,
  tripRegistrationAdminSchema,
  tripRegistrationStatusUpdateSchema,
  type AdminSurfTripFormInput,
  type TripRegistrationAdminInput,
  type TripRegistrationStatusUpdateInput,
} from "@/lib/validations/surf-trip";
import type { Database, PublicEnums } from "@/types/database";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateUuid(id: string): boolean {
  return UUID_RE.test(id);
}

async function studentExistsActive(
  db: SupabaseClient<Database>,
  studentId: string
): Promise<boolean> {
  const { data } = await db
    .from("profiles")
    .select("id")
    .eq("id", studentId)
    .eq("role", "student")
    .eq("is_active", true)
    .maybeSingle();
  return Boolean(data);
}

async function getConfirmedCount(
  db: SupabaseClient<Database>,
  tripId: string
): Promise<number> {
  const { count, error } = await db
    .from("trip_registrations")
    .select("id", { count: "exact", head: true })
    .eq("trip_id", tripId)
    .eq("status", "confirmed");
  if (error) {
    return 0;
  }
  return count ?? 0;
}

async function syncTripSpotsTaken(
  db: SupabaseClient<Database>,
  tripId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const n = await getConfirmedCount(db, tripId);
  const { data: trip } = await db
    .from("surf_trips")
    .select("spots_total")
    .eq("id", tripId)
    .maybeSingle();
  if (!trip) {
    return { ok: false, error: "Trip não encontrada." };
  }
  if (n > trip.spots_total) {
    return {
      ok: false,
      error: `Há ${n} confirmados e apenas ${trip.spots_total} vagas. Aumente as vagas ou altere status.`,
    };
  }
  const { error } = await db.from("surf_trips").update({ spots_taken: n }).eq("id", tripId);
  if (error) {
    return { ok: false, error: error.message ?? "Não foi possível sincronizar vagas ocupadas." };
  }
  return { ok: true };
}

function confirmationDelta(
  oldStatus: PublicEnums["trip_registration_status"],
  newStatus: PublicEnums["trip_registration_status"]
): number {
  const was = oldStatus === "confirmed" ? 1 : 0;
  const will = newStatus === "confirmed" ? 1 : 0;
  return will - was;
}

async function loadTripSpotsTotal(
  db: SupabaseClient<Database>,
  tripId: string
): Promise<number | null> {
  const { data } = await db.from("surf_trips").select("spots_total").eq("id", tripId).maybeSingle();
  return data?.spots_total ?? null;
}

function revalidateTripsDashboard() {
  revalidatePath("/admin/surf-trips");
  revalidatePath("/admin");
}

export async function createSurfTripAdminAction(
  raw: unknown
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const parsed = adminSurfTripFormSchema.safeParse(raw);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ??
      parsed.error.flatten().formErrors.join(" ") ??
      "Dados inválidos.";
    return { ok: false, error: msg };
  }
  const data: AdminSurfTripFormInput = parsed.data;

  const { supabase } = await requireAdminSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const { data: inserted, error } = await db
    .from("surf_trips")
    .insert({
      title: data.title,
      destination: data.destination,
      trip_date: data.trip_date,
      description: data.description ?? "",
      spots_total: data.spots_total,
      spots_taken: 0,
      cover_url: data.cover_url ?? "",
    })
    .select("id, trip_date")
    .maybeSingle();

  if (error || !inserted) {
    return { ok: false, error: error?.message ?? "Não foi possível criar a trip." };
  }

  revalidateTripsDashboard();
  return { ok: true, id: inserted.id };
}

export async function updateSurfTripAdminAction(
  tripId: string,
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!validateUuid(tripId)) {
    return { ok: false, error: "Trip inválida." };
  }

  const parsed = adminSurfTripFormSchema.safeParse(raw);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ??
      parsed.error.flatten().formErrors.join(" ") ??
      "Dados inválidos.";
    return { ok: false, error: msg };
  }
  const data: AdminSurfTripFormInput = parsed.data;

  const { supabase } = await requireAdminSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const confirmed = await getConfirmedCount(db, tripId);
  if (data.spots_total < confirmed) {
    return {
      ok: false,
      error: `Existem ${confirmed} inscrições confirmadas. Defina pelo menos ${confirmed} vagas.`,
    };
  }

  const { data: existing, error: loadErr } = await db
    .from("surf_trips")
    .select("id, trip_date")
    .eq("id", tripId)
    .maybeSingle();

  if (loadErr || !existing) {
    return { ok: false, error: "Trip não encontrada." };
  }

  const { error } = await db
    .from("surf_trips")
    .update({
      title: data.title,
      destination: data.destination,
      trip_date: data.trip_date,
      description: data.description ?? "",
      spots_total: data.spots_total,
      cover_url: data.cover_url ?? "",
    })
    .eq("id", tripId);

  if (error) {
    return { ok: false, error: error.message ?? "Não foi possível salvar." };
  }

  const sync = await syncTripSpotsTaken(db, tripId);
  if (!sync.ok) {
    return sync;
  }

  revalidateTripsDashboard();
  return { ok: true };
}

export async function deleteSurfTripAdminAction(
  tripId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!validateUuid(tripId)) {
    return { ok: false, error: "Trip inválida." };
  }

  const { supabase } = await requireAdminSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const { error } = await db.from("surf_trips").delete().eq("id", tripId);
  if (error) {
    return { ok: false, error: error.message ?? "Não foi possível excluir." };
  }

  revalidateTripsDashboard();
  return { ok: true };
}

export async function uploadTripCoverAdminAction(
  tripId: string,
  formData: FormData
): Promise<{ ok: true; publicUrl: string } | { ok: false; error: string }> {
  if (!validateUuid(tripId)) {
    return { ok: false, error: "Trip inválida." };
  }

  const file = parseFormDataImageBlob(formData, "file");
  if (!file) {
    return { ok: false, error: "Selecione uma imagem." };
  }

  const valid = validateAvatarUploadFile(file);
  if (!valid.ok) {
    return valid;
  }

  const ext = mimeToAvatarExtension(file.type);
  if (!ext) {
    return { ok: false, error: "Formato de imagem não suportado." };
  }

  const { supabase } = await requireAdminSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const path = `${tripId}/cover.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from("trip-covers")
    .upload(path, buffer, { upsert: true, contentType: file.type });

  if (upErr) {
    return {
      ok: false,
      error: "Falha ao enviar a imagem. Confira se o bucket trip-covers está configurado.",
    };
  }

  const { data: urlData } = supabase.storage.from("trip-covers").getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  const { error: dbErr } = await db.from("surf_trips").update({ cover_url: publicUrl }).eq("id", tripId);

  if (dbErr) {
    return { ok: false, error: "Upload ok, mas não foi possível atualizar a trip." };
  }

  revalidateTripsDashboard();
  return { ok: true, publicUrl };
}

export async function createTripRegistrationAdminAction(
  raw: unknown
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const parsed = tripRegistrationAdminSchema.safeParse(raw);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ??
      parsed.error.flatten().formErrors.join(" ") ??
      "Dados inválidos.";
    return { ok: false, error: msg };
  }
  const data: TripRegistrationAdminInput = parsed.data;

  const { supabase } = await requireAdminSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const okStudent = await studentExistsActive(db, data.student_id);
  if (!okStudent) {
    return { ok: false, error: "Aluno não encontrado ou inativo." };
  }

  const { data: trip } = await db
    .from("surf_trips")
    .select("id, spots_total, trip_date")
    .eq("id", data.trip_id)
    .maybeSingle();
  if (!trip) {
    return { ok: false, error: "Trip não encontrada." };
  }

  if (data.status === "confirmed") {
    const n = await getConfirmedCount(db, data.trip_id);
    if (n + 1 > trip.spots_total) {
      return { ok: false, error: "Não há vagas disponíveis para nova confirmação." };
    }
  }

  const { data: inserted, error } = await db
    .from("trip_registrations")
    .insert({
      trip_id: data.trip_id,
      student_id: data.student_id,
      status: data.status,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Este aluno já está inscrito nesta trip." };
    }
    return { ok: false, error: error.message ?? "Não foi possível inscrever." };
  }
  if (!inserted) {
    return { ok: false, error: "Não foi possível inscrever." };
  }

  const sync = await syncTripSpotsTaken(db, data.trip_id);
  if (!sync.ok) {
    return sync;
  }

  revalidateTripsDashboard();
  return { ok: true, id: inserted.id };
}

export async function updateTripRegistrationStatusAdminAction(
  registrationId: string,
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!validateUuid(registrationId)) {
    return { ok: false, error: "Inscrição inválida." };
  }

  const parsed = tripRegistrationStatusUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ??
      parsed.error.flatten().formErrors.join(" ") ??
      "Dados inválidos.";
    return { ok: false, error: msg };
  }
  const data: TripRegistrationStatusUpdateInput = parsed.data;

  const { supabase } = await requireAdminSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const { data: reg } = await db
    .from("trip_registrations")
    .select("id, trip_id, status")
    .eq("id", registrationId)
    .maybeSingle();

  if (!reg) {
    return { ok: false, error: "Inscrição não encontrada." };
  }

  const delta = confirmationDelta(reg.status, data.status);
  if (delta > 0) {
    const spotsTotal = await loadTripSpotsTotal(db, reg.trip_id);
    if (spotsTotal == null) {
      return { ok: false, error: "Trip não encontrada." };
    }
    const n = await getConfirmedCount(db, reg.trip_id);
    if (n + delta > spotsTotal) {
      return { ok: false, error: "Não há vagas disponíveis para confirmar." };
    }
  }

  const { error } = await db
    .from("trip_registrations")
    .update({ status: data.status })
    .eq("id", registrationId);

  if (error) {
    return { ok: false, error: error.message ?? "Não foi possível atualizar." };
  }

  const sync = await syncTripSpotsTaken(db, reg.trip_id);
  if (!sync.ok) {
    return sync;
  }

  revalidateTripsDashboard();
  return { ok: true };
}

export async function deleteTripRegistrationAdminAction(
  registrationId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!validateUuid(registrationId)) {
    return { ok: false, error: "Inscrição inválida." };
  }

  const { supabase } = await requireAdminSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const { data: reg } = await db
    .from("trip_registrations")
    .select("trip_id")
    .eq("id", registrationId)
    .maybeSingle();

  if (!reg) {
    return { ok: false, error: "Inscrição não encontrada." };
  }

  const { error } = await db.from("trip_registrations").delete().eq("id", registrationId);
  if (error) {
    return { ok: false, error: error.message ?? "Não foi possível remover." };
  }

  await syncTripSpotsTaken(db, reg.trip_id);
  revalidateTripsDashboard();
  return { ok: true };
}
