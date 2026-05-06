import type { SupabaseClient } from "@supabase/supabase-js";

import type { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database, PublicEnums } from "@/types/database";

export type AdminSupabase = ReturnType<typeof createServerSupabaseClient>;

export interface EvolutionEntryRow {
  id: string;
  student_id: string;
  lesson_id: string | null;
  entry_date: string;
  content: string;
  skills: string[];
  created_at: string;
  lesson_scheduled_at: string | null;
}

interface EvolutionSelectRow {
  id: string;
  student_id: string;
  lesson_id: string | null;
  entry_date: string;
  content: string;
  skills: string[];
  created_at: string;
  lessons: { scheduled_at: string } | null;
}

const ENTRIES_LIMIT = 200;

export async function fetchEvolutionEntriesForStudent(
  client: AdminSupabase,
  studentId: string
): Promise<EvolutionEntryRow[]> {
  const db = client as unknown as SupabaseClient<Database>;
  const { data, error } = await db
    .from("evolution_entries")
    .select(
      "id, student_id, lesson_id, entry_date, content, skills, created_at, lessons ( scheduled_at )"
    )
    .eq("student_id", studentId)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(ENTRIES_LIMIT);

  if (error || !data?.length) {
    return [];
  }

  return (data as EvolutionSelectRow[]).map((row) => ({
    id: row.id,
    student_id: row.student_id,
    lesson_id: row.lesson_id,
    entry_date: row.entry_date,
    content: row.content,
    skills: row.skills ?? [],
    created_at: row.created_at,
    lesson_scheduled_at: row.lessons?.scheduled_at ?? null,
  }));
}

export interface LessonOptionForEvolution {
  id: string;
  scheduled_at: string;
  status: PublicEnums["lesson_status"];
}

const LESSON_OPTIONS_LIMIT = 80;

export async function fetchLessonsForEvolutionSelect(
  client: AdminSupabase,
  studentId: string
): Promise<LessonOptionForEvolution[]> {
  const db = client as unknown as SupabaseClient<Database>;
  const { data, error } = await db
    .from("lessons")
    .select("id, scheduled_at, status")
    .eq("student_id", studentId)
    .order("scheduled_at", { ascending: false })
    .limit(LESSON_OPTIONS_LIMIT);

  if (error || !data?.length) {
    return [];
  }

  return data as LessonOptionForEvolution[];
}
