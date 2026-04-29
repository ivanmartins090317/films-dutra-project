import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/database";

export interface AdminSessionContext {
  supabase: ReturnType<typeof createServerSupabaseClient>;
  user: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>["auth"]["getUser"]>["data"]["user"]>;
  profile: ProfileRow;
}

/**
 * Garante sessão autenticada, perfil ativo e papel admin (defesa em profundidade além do middleware).
 */
export async function requireAdminSession(): Promise<AdminSessionContext> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  const profile = data as ProfileRow | null;

  if (!profile?.is_active) {
    await supabase.auth.signOut();
    redirect("/login?error=inactive");
  }

  if (profile.role !== "admin") {
    redirect("/student");
  }

  return { supabase, user, profile };
}
