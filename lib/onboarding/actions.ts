"use server";

import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  mapProfileBirthFields,
  mapStudentDetailsInsert,
  parseOnboardingPayload,
  parseOtherSports,
} from "@/lib/validations/onboarding";

export type OnboardingTokenReason = "invalid" | "expired" | "used" | "config";

export async function validateOnboardingTokenAction(
  token: string
): Promise<{ ok: true } | { ok: false; reason: OnboardingTokenReason }> {
  const trimmed = token?.trim();
  if (!trimmed) {
    return { ok: false, reason: "invalid" };
  }

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch {
    return { ok: false, reason: "config" };
  }

  const { data, error } = await supabase
    .from("onboarding_tokens")
    .select("id, expires_at, used_at")
    .eq("token", trimmed)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, reason: "invalid" };
  }
  if (data.used_at) {
    return { ok: false, reason: "used" };
  }
  const exp = new Date(data.expires_at);
  if (Number.isNaN(exp.getTime()) || exp < new Date()) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true };
}

export async function completeOnboardingAction(
  token: string,
  payload: Record<string, unknown>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = token?.trim();
  if (!trimmed) {
    return { ok: false, error: "Link inválido." };
  }

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch {
    return {
      ok: false,
      error: "Servidor não configurado para finalizar cadastro. Contate a escola.",
    };
  }

  const parsed = parseOnboardingPayload(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error };
  }
  const d = parsed.data;

  const { data: tokenRow, error: tokenErr } = await supabase
    .from("onboarding_tokens")
    .select("id, expires_at, used_at")
    .eq("token", trimmed)
    .maybeSingle();

  if (tokenErr || !tokenRow || tokenRow.used_at) {
    return { ok: false, error: "Este convite não é mais válido." };
  }
  const exp = new Date(tokenRow.expires_at);
  if (Number.isNaN(exp.getTime()) || exp < new Date()) {
    return { ok: false, error: "Este convite expirou." };
  }

  const birth = mapProfileBirthFields(d);
  const otherSports = parseOtherSports(d.other_sports_raw);

  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: d.email.trim().toLowerCase(),
    password: d.password,
    email_confirm: true,
    user_metadata: {
      full_name: d.full_name,
    },
  });

  if (createErr || !created.user) {
    const msg = createErr?.message ?? "";
    if (/already|registered|exists/i.test(msg)) {
      return {
        ok: false,
        error: "Este e-mail já possui cadastro. Use entrar com sua senha ou recuperação de senha.",
      };
    }
    return { ok: false, error: "Não foi possível criar o usuário. Tente novamente ou contate a escola." };
  }

  const userId = created.user.id;
  const nowIso = new Date().toISOString();

  const { error: profileErr } = await supabase.from("profiles").update({
    full_name: d.full_name,
    birth_date: birth.birth_date,
    birth_year: birth.birth_year,
    address: d.address,
    phone: d.phone,
    sexual_orientation: d.sexual_orientation?.trim() ? d.sexual_orientation.trim() : null,
    height_cm: d.height_cm ?? null,
    weight_kg: d.weight_kg ?? null,
    lgpd_accepted_at: nowIso,
  }).eq("id", userId);

  if (profileErr) {
    return { ok: false, error: "Erro ao salvar perfil. Contate a escola." };
  }

  const detailsInsert = mapStudentDetailsInsert(userId, d, d, d, otherSports);

  const { error: detailsErr } = await supabase.from("student_details").insert(detailsInsert);

  if (detailsErr) {
    return { ok: false, error: "Erro ao salvar dados complementares. Contate a escola." };
  }

  const { error: usedErr } = await supabase
    .from("onboarding_tokens")
    .update({ used_at: nowIso })
    .eq("id", tokenRow.id);

  if (usedErr) {
    return { ok: false, error: "Cadastro concluído, mas o convite não pôde ser fechado. Avise a escola." };
  }

  return { ok: true };
}
