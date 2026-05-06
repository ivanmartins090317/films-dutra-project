import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database, ProfileRow } from "@/types/database";

import type { AppSupabaseClient } from "@/lib/supabase/ssr-client-type";
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
  }) as unknown as AppSupabaseClient;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  let profile: Pick<ProfileRow, "role" | "is_active"> | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();
    profile = data as Pick<ProfileRow, "role" | "is_active"> | null;
  }

  let studentPortalEnabled = true;
  if (user && profile?.role === "student") {
    const { data: schoolRow } = await supabase
      .from("school_settings")
      .select("student_portal_enabled")
      .limit(1)
      .maybeSingle();
    studentPortalEnabled = schoolRow?.student_portal_enabled !== false;
  }

  const studentAccessBlocked =
    profile?.role === "student" && (!profile.is_active || !studentPortalEnabled);

  const isLoginArea = pathname.startsWith("/login");

  if (user && profile && isLoginArea) {
    const target = new URL(request.url);
    if (profile.role === "admin") {
      target.pathname = "/admin";
      target.search = "";
      return NextResponse.redirect(target);
    }
    if (profile.role === "student" && !studentAccessBlocked) {
      target.pathname = "/student";
      target.search = "";
      return NextResponse.redirect(target);
    }
  }

  if (!user && (pathname.startsWith("/admin") || pathname.startsWith("/student"))) {
    const urlLogin = new URL("/login", request.url);
    urlLogin.searchParams.set("next", pathname);
    return NextResponse.redirect(urlLogin);
  }

  if (
    user &&
    profile?.role === "student" &&
    studentAccessBlocked &&
    pathname.startsWith("/student")
  ) {
    const urlLogin = new URL("/login", request.url);
    urlLogin.searchParams.set("error", profile.is_active ? "portal" : "inactive");
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
