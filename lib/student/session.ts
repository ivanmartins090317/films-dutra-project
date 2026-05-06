import { redirect } from "next/navigation";

import type { User } from "@supabase/supabase-js";

import { fetchSchoolSettings } from "@/lib/school-settings";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/database";

export interface StudentSessionContext {
  supabase: ReturnType<typeof createServerSupabaseClient>;
  user: User;
  profile: ProfileRow;
}

/**
 * Sessão aluno ativa com portal liberado — defesa em profundidade junto ao middleware/layout.
 */
export async function requireStudentSession(): Promise<StudentSessionContext> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/student");
  }

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  const profile = data as ProfileRow | null;

  if (!profile?.is_active) {
    await supabase.auth.signOut();
    redirect("/login?error=inactive");
  }

  const schoolRow = await fetchSchoolSettings(supabase);
  if (schoolRow?.student_portal_enabled === false) {
    await supabase.auth.signOut();
    redirect("/login?error=portal");
  }

  if (profile.role !== "student") {
    redirect("/admin");
  }

  return { supabase, user, profile };
}
