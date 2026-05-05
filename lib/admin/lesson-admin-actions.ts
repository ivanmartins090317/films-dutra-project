"use server";

import { revalidatePath } from "next/cache";

import type { SupabaseClient } from "@supabase/supabase-js";

import { lessonOverlapsExisting } from "@/lib/admin/lesson-overlap";
import { requireAdminSession } from "@/lib/admin/session";
import { schoolLocalDateTimeToUtcIso } from "@/lib/school-timezone";
import {
  adminLessonFormSchema,
  parseSkillsNoted,
  type AdminLessonFormInput,
} from "@/lib/validations/lesson";
import type { Database } from "@/types/database";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateUuid(id: string): boolean {
  return UUID_RE.test(id);
}

async function loadStudentLessonsForOverlap(
  db: SupabaseClient<Database>,
  studentId: string
): Promise<
  {
    id: string;
    scheduled_at: string;
    duration_min: number;
    status: import("@/types/database").PublicEnums["lesson_status"];
  }[]
> {
  const { data, error } = await db
    .from("lessons")
    .select("id, scheduled_at, duration_min, status")
    .eq("student_id", studentId);

  if (error || !data) {
    return [];
  }
  return data;
}

export async function createLessonAdminAction(
  raw: unknown
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const parsed = adminLessonFormSchema.safeParse(raw);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ??
      parsed.error.flatten().formErrors.join(" ") ??
      "Dados inválidos.";
    return { ok: false, error: msg };
  }

  const data: AdminLessonFormInput = parsed.data;
  if (!validateUuid(data.student_id)) {
    return { ok: false, error: "Aluno inválido." };
  }

  const scheduledAt = schoolLocalDateTimeToUtcIso(data.scheduled_date, data.scheduled_time);
  const skills = parseSkillsNoted(data.skills_noted);

  const { supabase } = await requireAdminSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const existing = await loadStudentLessonsForOverlap(db, data.student_id);
  const clash = lessonOverlapsExisting(scheduledAt, data.duration_min, undefined, existing);
  if (clash) {
    return {
      ok: false,
      error:
        "Conflito de horário: já existe uma aula não cancelada que cruza este intervalo para o mesmo aluno.",
    };
  }

  const { data: inserted, error } = await db
    .from("lessons")
    .insert({
      student_id: data.student_id,
      scheduled_at: scheduledAt,
      duration_min: data.duration_min,
      status: data.status,
      cancel_reason: data.cancel_reason.trim(),
      notes: data.notes.trim(),
      skills_noted: skills,
    })
    .select("id")
    .maybeSingle();

  if (error || !inserted) {
    return { ok: false, error: error?.message ?? "Não foi possível criar a aula." };
  }

  revalidatePath("/admin/agenda");
  revalidatePath("/admin");
  revalidatePath(`/admin/students/${data.student_id}`);
  return { ok: true, id: inserted.id };
}

export async function updateLessonAdminAction(
  lessonId: string,
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!validateUuid(lessonId)) {
    return { ok: false, error: "Aula inválida." };
  }

  const parsed = adminLessonFormSchema.safeParse(raw);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ??
      parsed.error.flatten().formErrors.join(" ") ??
      "Dados inválidos.";
    return { ok: false, error: msg };
  }

  const data: AdminLessonFormInput = parsed.data;
  const scheduledAt = schoolLocalDateTimeToUtcIso(data.scheduled_date, data.scheduled_time);
  const skills = parseSkillsNoted(data.skills_noted);

  const { supabase } = await requireAdminSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const existingRows = await loadStudentLessonsForOverlap(db, data.student_id);
  const clash = lessonOverlapsExisting(scheduledAt, data.duration_min, lessonId, existingRows);
  if (clash) {
    return {
      ok: false,
      error:
        "Conflito de horário: já existe uma aula não cancelada que cruza este intervalo para o mesmo aluno.",
    };
  }

  const { error } = await db
    .from("lessons")
    .update({
      student_id: data.student_id,
      scheduled_at: scheduledAt,
      duration_min: data.duration_min,
      status: data.status,
      cancel_reason: data.cancel_reason.trim(),
      notes: data.notes.trim(),
      skills_noted: skills,
    })
    .eq("id", lessonId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/agenda");
  revalidatePath("/admin");
  revalidatePath(`/admin/students/${data.student_id}`);
  return { ok: true };
}

export async function deleteLessonAdminAction(
  lessonId: string,
  studentId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!validateUuid(lessonId) || !validateUuid(studentId)) {
    return { ok: false, error: "Identificadores inválidos." };
  }

  const { supabase } = await requireAdminSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const { error } = await db.from("lessons").delete().eq("id", lessonId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/agenda");
  revalidatePath("/admin");
  revalidatePath(`/admin/students/${studentId}`);
  return { ok: true };
}
