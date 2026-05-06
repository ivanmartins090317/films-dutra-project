import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

import { getSupabaseEnv } from "@/lib/supabase/env";
import type { AppSupabaseClient } from "@/lib/supabase/ssr-client-type";

/**
 * Cliente Supabase no servidor (Server Actions, Route Handlers, Server Components).
 * Em RSC puro, cookies podem ser somente leitura — refresh de sessão fica no middleware.
 */
export function createServerSupabaseClient(): AppSupabaseClient {
  const cookieStore = cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* Server Component sem mutação de cookies */
        }
      },
    },
  }) as unknown as AppSupabaseClient;
}
