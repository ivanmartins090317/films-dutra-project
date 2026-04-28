import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
/** Anon ou publishable (novo painel Supabase); mesma função no client. */
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

/**
 * Cliente Supabase no browser. Configure `NEXT_PUBLIC_SUPABASE_*` no `.env.local` (Fase 2+).
 * Sem URL/chave válidos, o client não consegue falar com o backend — esperado em dev puro.
 */
export function createBrowserSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
