import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Cliente com schema `Database` (PostgREST + `school_settings`, etc.).
 * O retorno de `createServerClient` do `@supabase/ssr` usa genéricos extra;
 * faça `as AppSupabaseClient` ao criar o cliente.
 */
export type AppSupabaseClient = SupabaseClient<Database>;
