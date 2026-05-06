"use server";

import { revalidatePath } from "next/cache";

import type { SupabaseClient } from "@supabase/supabase-js";

import { requireAdminSession } from "@/lib/admin/session";
import {
  adminEvolutionFormSchema,
  parseEvolutionSkills,
  type AdminEvolutionFormInput,
} from "@/lib/validations/evolution";
import type { Database } from "@/types/database";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateUuid(id: string): boolean {
  return UUID_RE.test(id);
}

async function lessonBelongsToStudent(
  db: SupabaseClient<Database>,
  lessonId: string,
  studentId: string
): Promise<boolean> {
  const { data } = await db
    .from("lessons")
    .select("id")
    .eq("id", lessonId)
    .eq("student_id", studentId)
    .maybeSingle();
  return Boolean(data);
}

export async function createEvolutionEntryAdminAction(
  raw: unknown
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const parsed = adminEvolutionFormSchema.safeParse(raw);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ??
      parsed.error.flatten().formErrors.join(" ") ??
      "Dados inválidos.";
    return { ok: false, error: msg };
  }

  const data: AdminEvolutionFormInput = parsed.data;
  if (!validateUuid(data.student_id)) {
    return { ok: false, error: "Aluno inválido." };
  }

  const skills = parseEvolutionSkills(data.skills_input);
  let lessonId: string | null = data.lesson_id ?? null;
  if (lessonId && !validateUuid(lessonId)) {
    return { ok: false, error: "Aula vinculada inválida." };
  }

  const { supabase } = await requireAdminSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  if (lessonId) {
    const ok = await lessonBelongsToStudent(db, lessonId, data.student_id);
    if (!ok) {
      return { ok: false, error: "A aula selecionada não pertence a este aluno." };
    }
  } else {
    lessonId = null;
  }

  const { data: inserted, error } = await db
    .from("evolution_entries")
    .insert({
      student_id: data.student_id,
      lesson_id: lessonId,
      entry_date: data.entry_date,
      content: data.content,
      skills,
      media_urls: [],
    })
    .select("id")
    .maybeSingle();

  if (error || !inserted) {
    return { ok: false, error: error?.message ?? "Não foi possível salvar a entrada." };
  }

  revalidatePath("/admin/evolution");
  revalidatePath(`/admin/students/${data.student_id}`);
  return { ok: true, id: inserted.id };
}

export async function updateEvolutionEntryAdminAction(
  entryId: string,
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!validateUuid(entryId)) {
    return { ok: false, error: "Registro inválido." };
  }

  const parsed = adminEvolutionFormSchema.safeParse(raw);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ??
      parsed.error.flatten().formErrors.join(" ") ??
      "Dados inválidos.";
    return { ok: false, error: msg };
  }

  const data: AdminEvolutionFormInput = parsed.data;
  const skills = parseEvolutionSkills(data.skills_input);
  let lessonId: string | null = data.lesson_id ?? null;

  const { supabase } = await requireAdminSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  if (lessonId) {
    const ok = await lessonBelongsToStudent(db, lessonId, data.student_id);
    if (!ok) {
      return { ok: false, error: "A aula selecionada não pertence a este aluno." };
    }
  } else {
    lessonId = null;
  }

  const { error } = await db
    .from("evolution_entries")
    .update({
      student_id: data.student_id,
      lesson_id: lessonId,
      entry_date: data.entry_date,
      content: data.content,
      skills,
    })
    .eq("id", entryId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/evolution");
  revalidatePath(`/admin/students/${data.student_id}`);
  return { ok: true };
}

export async function deleteEvolutionEntryAdminAction(
  entryId: string,
  studentId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!validateUuid(entryId) || !validateUuid(studentId)) {
    return { ok: false, error: "Identificadores inválidos." };
  }

  const { supabase } = await requireAdminSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const { error } = await db.from("evolution_entries").delete().eq("id", entryId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/evolution");
  revalidatePath(`/admin/students/${studentId}`);
  return { ok: true };
}
