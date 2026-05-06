import type { SupabaseClient } from "@supabase/supabase-js";

import type { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database, PublicEnums } from "@/types/database";

export type AdminSupabase = ReturnType<typeof createServerSupabaseClient>;

export interface FinancialEntryRow {
  id: string;
  student_id: string;
  type: PublicEnums["financial_type"];
  amount: number;
  due_date: string;
  paid_at: string | null;
  status: PublicEnums["financial_status"];
  notes: string;
  created_at: string;
}

function coerceAmount(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function fetchFinancialsForStudent(
  client: AdminSupabase,
  studentId: string
): Promise<FinancialEntryRow[]> {
  const db = client as unknown as SupabaseClient<Database>;
  const { data, error } = await db
    .from("financials")
    .select("id, student_id, type, amount, due_date, paid_at, status, notes, created_at")
    .eq("student_id", studentId)
    .order("due_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    student_id: row.student_id,
    type: row.type,
    amount: coerceAmount(row.amount),
    due_date: row.due_date,
    paid_at: row.paid_at,
    status: row.status,
    notes: row.notes,
    created_at: row.created_at,
  }));
}

export interface PaidEntryForChart {
  paid_at: string;
  amount: number;
}

/** Todas as linhas para cards de resumo (MVP: volume moderado). */
export async function fetchAllFinancialsForSummary(client: AdminSupabase): Promise<FinancialEntryRow[]> {
  const db = client as unknown as SupabaseClient<Database>;
  const { data, error } = await db
    .from("financials")
    .select("id, student_id, type, amount, due_date, paid_at, status, notes, created_at")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    student_id: row.student_id,
    type: row.type,
    amount: coerceAmount(row.amount),
    due_date: row.due_date,
    paid_at: row.paid_at,
    status: row.status,
    notes: row.notes,
    created_at: row.created_at,
  }));
}

export async function fetchPaidFinancialsForChart(client: AdminSupabase): Promise<PaidEntryForChart[]> {
  const db = client as unknown as SupabaseClient<Database>;
  const { data, error } = await db
    .from("financials")
    .select("paid_at, amount")
    .eq("status", "paid")
    .not("paid_at", "is", null);

  if (error || !data) {
    return [];
  }

  const out: PaidEntryForChart[] = [];
  for (const r of data) {
    const paidAt = r.paid_at;
    if (paidAt == null || paidAt === "") {
      continue;
    }
    out.push({ paid_at: paidAt, amount: coerceAmount(r.amount) });
  }
  return out;
}
