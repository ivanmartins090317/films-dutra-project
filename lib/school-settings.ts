import type { Database } from "@/types/database";
import type { AppSupabaseClient } from "@/lib/supabase/ssr-client-type";

export type SchoolSettingsRow = Database["public"]["Tables"]["school_settings"]["Row"];

/**
 * Linha singleton de configurações (quando migração ainda não rodou retorna null).
 */
export async function fetchSchoolSettings(client: AppSupabaseClient): Promise<SchoolSettingsRow | null> {
  const { data, error } = await client.from("school_settings").select("*").limit(1).maybeSingle();
  if (error) return null;
  return data as SchoolSettingsRow | null;
}

/** Se não há config ou coluna indefinida, o portal dos alunos fica habilitado (fail-open). */
export async function isStudentPortalEnabled(client: AppSupabaseClient): Promise<boolean> {
  const row = await fetchSchoolSettings(client);
  if (!row) return true;
  return row.student_portal_enabled !== false;
}

export function fallbackSchoolDisplayName(row: Pick<SchoolSettingsRow, "school_name"> | null): string {
  const trimmed = row?.school_name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "Films Dutra";
}
