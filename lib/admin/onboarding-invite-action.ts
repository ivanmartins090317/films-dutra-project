"use server";

import { randomBytes } from "crypto";

import { requireAdminSession } from "@/lib/admin/session";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/supabase/env";

const DEFAULT_VALID_DAYS = 7;

export async function createOnboardingInviteAction(
  notes?: string
): Promise<{ ok: true; inviteUrl: string } | { ok: false; error: string }> {
  const { user } = await requireAdminSession();

  let adminClient;
  try {
    adminClient = createServiceRoleClient();
  } catch {
    return {
      ok: false,
      error: "Servidor sem SUPABASE_SERVICE_ROLE_KEY — não é possível gerar convites.",
    };
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + DEFAULT_VALID_DAYS);

  const { error } = await adminClient.from("onboarding_tokens").insert({
    token,
    expires_at: expiresAt.toISOString(),
    notes: notes?.trim() ?? "",
    created_by: user.id,
  });

  if (error) {
    return { ok: false, error: "Não foi possível criar o convite. Tente novamente." };
  }

  const base = getSiteUrl();
  const inviteUrl = `${base}/onboarding/${token}`;

  return { ok: true, inviteUrl };
}
