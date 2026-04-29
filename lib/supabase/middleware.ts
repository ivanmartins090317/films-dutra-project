import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database, ProfileRow } from "@/types/database";

import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Atualiza a sessão Supabase (cookies) e aplica regras de rota admin/aluno.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  let profile: Pick<ProfileRow, "role"> | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    profile = data as Pick<ProfileRow, "role"> | null;
  }

  const isLoginArea = pathname.startsWith("/login");

  if (user && profile && isLoginArea) {
    const target = new URL(request.url);
    target.pathname = profile.role === "admin" ? "/admin" : "/student";
    target.search = "";
    return NextResponse.redirect(target);
  }

  if (!user && (pathname.startsWith("/admin") || pathname.startsWith("/student"))) {
    const urlLogin = new URL("/login", request.url);
    urlLogin.searchParams.set("next", pathname);
    return NextResponse.redirect(urlLogin);
  }

  if (user && profile) {
    if (pathname.startsWith("/admin") && profile.role !== "admin") {
      return NextResponse.redirect(new URL("/student", request.url));
    }
    if (pathname.startsWith("/student") && profile.role !== "student") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  if (
    user &&
    !profile &&
    (pathname.startsWith("/admin") || pathname.startsWith("/student"))
  ) {
    const urlLogin = new URL("/login", request.url);
    urlLogin.searchParams.set("error", "profile");
    return NextResponse.redirect(urlLogin);
  }

  return supabaseResponse;
}
