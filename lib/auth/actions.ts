"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/env";
import { isStudentPortalEnabled } from "@/lib/school-settings";
import { loginSchema } from "@/lib/validations/auth";
import type { ProfileRow } from "@/types/database";

export interface AuthFormState {
  error?: string;
  success?: string;
}

function sanitizeInternalPath(next: string): string | null {
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  if (next.includes("://")) return null;
  return next;
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Verifique e-mail e senha." };
  }

  const supabase = createServerSupabaseClient();
  const { error: signError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (signError) {
    return { error: "Não foi possível entrar. Verifique e-mail e senha." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sessão inválida." };
  }

  const { data } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  const profile = data as Pick<ProfileRow, "role" | "is_active"> | null;

  if (!profile) {
    await supabase.auth.signOut();
    return { error: "Perfil não encontrado. Entre em contato com a escola." };
  }
  if (!profile.is_active) {
    await supabase.auth.signOut();
    return { error: "Conta inativa. Entre em contato com a escola." };
  }

  if (profile.role === "student") {
    const portalOk = await isStudentPortalEnabled(supabase);
    if (!portalOk) {
      await supabase.auth.signOut();
      return {
        error: "O portal dos alunos está desativado. Entre em contato com a escola.",
      };
    }
  }

  const nextRaw = String(formData.get("next") ?? "");
  const next = sanitizeInternalPath(nextRaw);
  if (next && (next.startsWith("/admin") || next.startsWith("/student"))) {
    redirect(next);
  }
  redirect(profile.role === "admin" ? "/admin" : "/student");
}

export async function logoutAction() {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordResetAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Informe o e-mail." };
  }

  const emailParsed = z.string().email().safeParse(email);
  if (!emailParsed.success) {
    return { error: "E-mail inválido." };
  }

  const supabase = createServerSupabaseClient();
  const site = getSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(emailParsed.data, {
    redirectTo: `${site}/auth/callback?next=${encodeURIComponent("/auth/update-password")}`,
  });
  if (error) {
    return { error: "Não foi possível enviar o e-mail. Tente novamente." };
  }
  return {
    success:
      "Se o e-mail existir na base, você receberá um link para redefinir a senha.",
  };
}
