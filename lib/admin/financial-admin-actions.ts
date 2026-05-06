"use server";

import { revalidatePath } from "next/cache";

import type { SupabaseClient } from "@supabase/supabase-js";

import { deriveFinancialStatus, schoolTodayDateKey } from "@/lib/admin/financial-status";
import { requireAdminSession } from "@/lib/admin/session";
import {
  adminFinancialFormSchema,
  type AdminFinancialFormInput,
} from "@/lib/validations/financial";
import type { Database } from "@/types/database";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateUuid(id: string): boolean {
  return UUID_RE.test(id);
}

async function studentExists(
  db: SupabaseClient<Database>,
  studentId: string
): Promise<boolean> {
  const { data } = await db
    .from("profiles")
    .select("id")
    .eq("id", studentId)
    .eq("role", "student")
    .eq("is_active", true)
    .maybeSingle();
  return Boolean(data);
}

export async function createFinancialEntryAdminAction(
  raw: unknown
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const parsed = adminFinancialFormSchema.safeParse(raw);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ??
      parsed.error.flatten().formErrors.join(" ") ??
      "Dados inválidos.";
    return { ok: false, error: msg };
  }

  const data: AdminFinancialFormInput = parsed.data;
  if (!validateUuid(data.student_id)) {
    return { ok: false, error: "Aluno inválido." };
  }

  const todayKey = schoolTodayDateKey();
  const status = deriveFinancialStatus(data.due_date, data.paid_at, todayKey);

  const { supabase } = await requireAdminSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const okStudent = await studentExists(db, data.student_id);
  if (!okStudent) {
    return { ok: false, error: "Aluno não encontrado ou inativo." };
  }

  const { data: inserted, error } = await db
    .from("financials")
    .insert({
      student_id: data.student_id,
      type: data.type,
      amount: data.amount,
      due_date: data.due_date,
      paid_at: data.paid_at,
      status,
      notes: data.notes ?? "",
    })
    .select("id")
    .maybeSingle();

  if (error || !inserted) {
    return { ok: false, error: error?.message ?? "Não foi possível salvar o lançamento." };
  }

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
  revalidatePath(`/admin/students/${data.student_id}`);
  return { ok: true, id: inserted.id };
}

export async function updateFinancialEntryAdminAction(
  entryId: string,
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!validateUuid(entryId)) {
    return { ok: false, error: "Registro inválido." };
  }

  const parsed = adminFinancialFormSchema.safeParse(raw);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ??
      parsed.error.flatten().formErrors.join(" ") ??
      "Dados inválidos.";
    return { ok: false, error: msg };
  }

  const data: AdminFinancialFormInput = parsed.data;

  const { supabase } = await requireAdminSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const okStudent = await studentExists(db, data.student_id);
  if (!okStudent) {
    return { ok: false, error: "Aluno não encontrado ou inativo." };
  }

  const { data: existing, error: loadErr } = await db
    .from("financials")
    .select("id, student_id")
    .eq("id", entryId)
    .maybeSingle();

  if (loadErr || !existing) {
    return { ok: false, error: "Lançamento não encontrado." };
  }

  if (existing.student_id !== data.student_id) {
    return { ok: false, error: "Não é permitido mover o lançamento para outro aluno." };
  }

  const todayKey = schoolTodayDateKey();
  const status = deriveFinancialStatus(data.due_date, data.paid_at, todayKey);

  const { error } = await db
    .from("financials")
    .update({
      type: data.type,
      amount: data.amount,
      due_date: data.due_date,
      paid_at: data.paid_at,
      status,
      notes: data.notes ?? "",
    })
    .eq("id", entryId);

  if (error) {
    return { ok: false, error: error.message ?? "Não foi possível atualizar." };
  }

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
  revalidatePath(`/admin/students/${data.student_id}`);
  return { ok: true };
}

export async function deleteFinancialEntryAdminAction(
  entryId: string,
  studentId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!validateUuid(entryId) || !validateUuid(studentId)) {
    return { ok: false, error: "Registro inválido." };
  }

  const { supabase } = await requireAdminSession();
  const db = supabase as unknown as SupabaseClient<Database>;

  const { error } = await db
    .from("financials")
    .delete()
    .eq("id", entryId)
    .eq("student_id", studentId);

  if (error) {
    return { ok: false, error: error.message ?? "Não foi possível excluir." };
  }

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
  revalidatePath(`/admin/students/${studentId}`);
  return { ok: true };
}
