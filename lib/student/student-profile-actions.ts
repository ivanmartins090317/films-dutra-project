"use server";

import { Buffer } from "node:buffer";

import { revalidatePath } from "next/cache";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mimeToAvatarExtension,
  parseFormDataImageBlob,
  validateAvatarUploadFile,
} from "@/lib/admin/student-avatar-upload";
import { requireStudentSession } from "@/lib/student/session";
import {
  studentSelfProfileSchema,
  type StudentSelfProfileInput,
} from "@/lib/validations/student-profile";
import type { Database } from "@/types/database";

export async function uploadStudentAvatarStudentAction(
  formData: FormData
): Promise<{ ok: true; publicUrl: string } | { ok: false; error: string }> {
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

  const { supabase, user } = await requireStudentSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const path = `${user.id}/avatar.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(path, buffer, { upsert: true, contentType: file.type });

  if (upErr) {
    return {
      ok: false,
      error: "Falha ao enviar a imagem. Tente novamente ou avise a escola.",
    };
  }

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  const { error: dbErr } = await db.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);

  if (dbErr) {
    return { ok: false, error: "Upload ok, mas não foi possível atualizar o perfil." };
  }

  revalidatePath("/student/perfil");
  revalidatePath(`/admin/students/${user.id}`);
  revalidatePath("/admin/students");
  return { ok: true, publicUrl };
}

export async function updateStudentProfileStudentAction(
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, user } = await requireStudentSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const parsed = studentSelfProfileSchema.safeParse(raw);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ??
      parsed.error.flatten().formErrors.join(" ") ??
      "Dados inválidos.";
    return { ok: false, error: msg };
  }

  const data: StudentSelfProfileInput = parsed.data;

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
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: "Não foi possível salvar o perfil." };
  }

  revalidatePath("/student/perfil");
  revalidatePath(`/admin/students/${user.id}`);
  revalidatePath("/admin/students");
  return { ok: true };
}
