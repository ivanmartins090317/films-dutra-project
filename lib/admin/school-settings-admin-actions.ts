"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/admin/session";
import {
  schoolSettingsFormSchema,
  type SchoolSettingsFormInput,
} from "@/lib/validations/school-settings";

export async function updateSchoolSettingsAdminAction(
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = schoolSettingsFormSchema.safeParse(raw);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ??
      parsed.error.flatten().formErrors.join(" ") ??
      "Dados inválidos.";
    return { ok: false, error: msg };
  }

  const data: SchoolSettingsFormInput = parsed.data;
  const { supabase } = await requireAdminSession();

  const { error } = await supabase
    .from("school_settings")
    .update({
      school_name: data.school_name.trim(),
      contact_email: data.contact_email.trim(),
      contact_phone: data.contact_phone.trim(),
      logo_url: data.logo_url.trim() === "" ? null : data.logo_url.trim(),
      student_portal_enabled: data.student_portal_enabled,
    })
    .eq("singleton", true);

  if (error) {
    return { ok: false, error: error.message ?? "Não foi possível salvar as configurações." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/configuracoes");
  revalidatePath("/login");
  revalidatePath("/student");
  return { ok: true };
}
