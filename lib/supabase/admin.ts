import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Cliente com service role — apenas em Server Actions / Route Handlers.
 * Nunca importar em componentes de cliente.
 */
export function createServiceRoleClient() {
  const { url } = getSupabaseEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL ausente (necessário para onboarding)."
    );
  }
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
