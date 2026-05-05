"use server";

import { Buffer } from "node:buffer";

import { revalidatePath } from "next/cache";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mimeToAvatarExtension,
  validateAvatarUploadFile,
} from "@/lib/admin/student-avatar-upload";
import { requireAdminSession } from "@/lib/admin/session";
import {
  adminStudentDetailsSchema,
  adminStudentProfileSchema,
  type AdminStudentDetailsInput,
  type AdminStudentProfileInput,
} from "@/lib/validations/admin-student";
import { parseOtherSports } from "@/lib/validations/onboarding";
import type { Database } from "@/types/database";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateUuid(id: string): boolean {
  return UUID_RE.test(id);
}

export async function uploadStudentAvatarAdminAction(
  profileId: string,
  formData: FormData
): Promise<{ ok: true; publicUrl: string } | { ok: false; error: string }> {
  if (!validateUuid(profileId)) {
    return { ok: false, error: "Identificador inválido." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
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

  const path = `${profileId}/avatar.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(path, buffer, { upsert: true, contentType: file.type });

  if (upErr) {
    return {
      ok: false,
      error: "Falha ao enviar a imagem. Confira se a migração do Storage foi aplicada.",
    };
  }

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  const { error: dbErr } = await db.from("profiles").update({ avatar_url: publicUrl }).eq("id", profileId);

  if (dbErr) {
    return { ok: false, error: "Upload ok, mas não foi possível atualizar o perfil." };
  }

  revalidatePath(`/admin/students/${profileId}`);
  revalidatePath("/admin/students");
  return { ok: true, publicUrl };
}

export async function updateStudentProfileAdminAction(
  profileId: string,
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!validateUuid(profileId)) {
    return { ok: false, error: "Identificador inválido." };
  }

  const { supabase } = await requireAdminSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const parsed = adminStudentProfileSchema.safeParse(raw);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ??
      parsed.error.flatten().formErrors.join(" ") ??
      "Dados inválidos.";
    return { ok: false, error: msg };
  }

  const data: AdminStudentProfileInput = parsed.data;

  const { error } = await db
    .from("profiles")
    .update({
      full_name: data.full_name,
      phone: data.phone ?? null,
      birth_date: data.birth_date ?? null,
      birth_year: data.birth_year ?? null,
      address: data.address ?? null,
      sexual_orientation: data.sexual_orientation ?? null,
      height_cm: data.height_cm ?? null,
      weight_kg: data.weight_kg ?? null,
      avatar_url: data.avatar_url,
      is_active: data.is_active,
    })
    .eq("id", profileId);

  if (error) {
    return { ok: false, error: "Não foi possível salvar o perfil." };
  }

  revalidatePath(`/admin/students/${profileId}`);
  revalidatePath("/admin/students");
  return { ok: true };
}

export async function upsertStudentDetailsAdminAction(
  studentId: string,
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!validateUuid(studentId)) {
    return { ok: false, error: "Identificador inválido." };
  }

  const { supabase } = await requireAdminSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const parsed = adminStudentDetailsSchema.safeParse(raw);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ??
      parsed.error.flatten().formErrors.join(" ") ??
      "Dados inválidos.";
    return { ok: false, error: msg };
  }

  const data: AdminStudentDetailsInput = parsed.data;
  const other_sports = parseOtherSports(data.other_sports_raw);

  const payload = {
    surfs_already: data.surfs_already,
    surf_level: data.surf_level,
    surf_time_years: data.surf_time_years,
    other_sports,
    health_conditions: data.health_conditions,
    surgeries: data.surgeries,
    menstrual_cycle: data.menstrual_cycle?.trim() || null,
    equipment_has: data.equipment_has,
    equipment_model: data.equipment_model,
    surf_goal: data.surf_goal,
    preferred_days: data.preferred_days,
    weekly_frequency: data.weekly_frequency,
    suggestions: data.suggestions,
  };

  const { data: existing, error: selErr } = await db
    .from("student_details")
    .select("id")
    .eq("student_id", studentId)
    .maybeSingle();

  if (selErr) {
    return { ok: false, error: "Não foi possível verificar os dados de surf." };
  }

  if (existing) {
    const { error } = await db.from("student_details").update(payload).eq("student_id", studentId);
    if (error) {
      return { ok: false, error: "Não foi possível atualizar surf e saúde." };
    }
  } else {
    const { error } = await db.from("student_details").insert({
      student_id: studentId,
      ...payload,
    });
    if (error) {
      return { ok: false, error: "Não foi possível criar os dados de surf." };
    }
  }

  revalidatePath(`/admin/students/${studentId}`);
  return { ok: true };
}
