import type { SupabaseClient } from "@supabase/supabase-js";

import { getSchoolMonthRangeUtc } from "@/lib/school-timezone";
import type { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database, PublicEnums } from "@/types/database";

export type AdminSupabase = ReturnType<typeof createServerSupabaseClient>;

export interface LessonWithStudent {
  id: string;
  student_id: string;
  student_name: string | null;
  scheduled_at: string;
  duration_min: number;
  status: PublicEnums["lesson_status"];
  cancel_reason: string;
  notes: string;
  skills_noted: string[];
}

export interface ActiveStudentOption {
  id: string;
  full_name: string | null;
}

export async function fetchActiveStudentsForSelect(client: AdminSupabase): Promise<ActiveStudentOption[]> {
  const db = client as unknown as SupabaseClient<Database>;
  const { data, error } = await db
    .from("profiles")
    .select("id, full_name")
    .eq("role", "student")
    .eq("is_active", true)
    .order("full_name", { ascending: true, nullsFirst: false });

  if (error) {
    return [];
  }
  return (data ?? []) as ActiveStudentOption[];
}

export async function fetchLessonsInSchoolMonth(
  client: AdminSupabase,
  year: number,
  month1to12: number
): Promise<LessonWithStudent[]> {
  const db = client as unknown as SupabaseClient<Database>;
  const { start, end } = getSchoolMonthRangeUtc(year, month1to12);

  const { data: lessons, error: lessonsErr } = await db
    .from("lessons")
    .select("id, student_id, scheduled_at, duration_min, status, cancel_reason, notes, skills_noted")
    .gte("scheduled_at", start)
    .lt("scheduled_at", end)
    .order("scheduled_at", { ascending: true });

  if (lessonsErr || !lessons?.length) {
    return [];
  }

  const studentIds = Array.from(new Set(lessons.map((l) => l.student_id)));
  const { data: profiles } = await db.from("profiles").select("id, full_name").in("id", studentIds);
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name] as const));

  return lessons.map((l) => ({
    id: l.id,
    student_id: l.student_id,
    student_name: nameById.get(l.student_id) ?? null,
    scheduled_at: l.scheduled_at,
    duration_min: l.duration_min,
    status: l.status,
    cancel_reason: l.cancel_reason,
    notes: l.notes,
    skills_noted: l.skills_noted,
  }));
}

const STUDENT_LESSONS_LIMIT = 80;

export async function fetchLessonsForStudent(
  client: AdminSupabase,
  studentId: string
): Promise<LessonWithStudent[]> {
  const db = client as unknown as SupabaseClient<Database>;
  const { data: lessons, error } = await db
    .from("lessons")
    .select("id, student_id, scheduled_at, duration_min, status, cancel_reason, notes, skills_noted")
    .eq("student_id", studentId)
    .order("scheduled_at", { ascending: false })
    .limit(STUDENT_LESSONS_LIMIT);

  if (error || !lessons?.length) {
    return [];
  }

  const { data: profile } = await db.from("profiles").select("full_name").eq("id", studentId).maybeSingle();
  const name = profile?.full_name ?? null;

  return lessons.map((l) => ({
    id: l.id,
    student_id: l.student_id,
    student_name: name,
    scheduled_at: l.scheduled_at,
    duration_min: l.duration_min,
    status: l.status,
    cancel_reason: l.cancel_reason,
    notes: l.notes,
    skills_noted: l.skills_noted,
  }));
}
