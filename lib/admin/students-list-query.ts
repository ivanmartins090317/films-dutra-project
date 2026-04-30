import type { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/database";

import type { ParsedStudentsListParams } from "@/lib/admin/students-list-params";

export type StudentListRow = Pick<
  ProfileRow,
  "id" | "full_name" | "phone" | "avatar_url" | "is_active" | "role" | "created_at"
>;

export interface AdminStudentsListResult {
  students: StudentListRow[];
  totalCount: number;
  page: number;
  error: Error | null;
}

export async function fetchAdminStudentsList(
  client: ReturnType<typeof createServerSupabaseClient>,
  rawParams: ParsedStudentsListParams
): Promise<AdminStudentsListResult> {
  let countQuery = client
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "student");

  if (rawParams.q) countQuery = countQuery.ilike("full_name", `%${rawParams.q}%`);
  if (rawParams.status === "active") countQuery = countQuery.eq("is_active", true);
  if (rawParams.status === "inactive") countQuery = countQuery.eq("is_active", false);

  const { count: rawCount, error: countErr } = await countQuery;

  if (countErr) {
    return { students: [], totalCount: 0, page: 1, error: new Error(countErr.message) };
  }

  const totalCount = rawCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / rawParams.perPage));
  const page = Math.min(Math.max(1, rawParams.page), totalPages);
  const from = (page - 1) * rawParams.perPage;
  const to = from + rawParams.perPage - 1;

  let dataQuery = client
    .from("profiles")
    .select("id, full_name, phone, avatar_url, is_active, role, created_at")
    .eq("role", "student");

  if (rawParams.q) dataQuery = dataQuery.ilike("full_name", `%${rawParams.q}%`);
  if (rawParams.status === "active") dataQuery = dataQuery.eq("is_active", true);
  if (rawParams.status === "inactive") dataQuery = dataQuery.eq("is_active", false);

  switch (rawParams.sort) {
    case "name_desc":
      dataQuery = dataQuery.order("full_name", { ascending: false });
      break;
    case "created_desc":
      dataQuery = dataQuery.order("created_at", { ascending: false });
      break;
    default:
      dataQuery = dataQuery.order("full_name", { ascending: true });
  }

  const { data: rows, error: dataErr } = await dataQuery.range(from, to);

  if (dataErr) {
    return { students: [], totalCount, page, error: new Error(dataErr.message) };
  }

  const students = (rows ?? []) as StudentListRow[];

  return { students, totalCount, page, error: null };
}
