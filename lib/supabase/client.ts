import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Cliente Supabase no browser. Configure `NEXT_PUBLIC_SUPABASE_*` no `.env.local` (Fase 2+).
 * Sem URL/chave válidos, o client não consegue falar com o backend — esperado em dev puro.
 */
export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createClient<Database>(url, anonKey);
}
