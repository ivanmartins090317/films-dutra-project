export type StudentsListStatus = "all" | "active" | "inactive";

export type StudentsListSort = "name_asc" | "name_desc" | "created_desc";

export interface ParsedStudentsListParams {
  q: string;
  page: number;
  perPage: number;
  status: StudentsListStatus;
  sort: StudentsListSort;
}

const PER_PAGE_OPTIONS = [10, 20, 50] as const;
const DEFAULT_PER_PAGE = 20;
const MAX_PAGE = 10_000;

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, MAX_PAGE);
}

export function parseStudentsListSearchParams(
  raw: Record<string, string | string[] | undefined>
): ParsedStudentsListParams {
  const qRaw = raw.q;
  const q =
    (typeof qRaw === "string" ? qRaw : Array.isArray(qRaw) ? qRaw[0] : "").trim();

  const page = parsePositiveInt(
    typeof raw.page === "string" ? raw.page : undefined,
    1
  );

  let perPage = parsePositiveInt(
    typeof raw.per_page === "string" ? raw.per_page : undefined,
    DEFAULT_PER_PAGE
  );
  if (!PER_PAGE_OPTIONS.includes(perPage as (typeof PER_PAGE_OPTIONS)[number])) {
    perPage = DEFAULT_PER_PAGE;
  }

  const statusRaw = typeof raw.status === "string" ? raw.status : "all";
  const status: StudentsListStatus =
    statusRaw === "active" || statusRaw === "inactive" ? statusRaw : "all";

  const sortRaw = typeof raw.sort === "string" ? raw.sort : "name_asc";
  const sort: StudentsListSort =
    sortRaw === "name_desc" || sortRaw === "created_desc" ? sortRaw : "name_asc";

  return { q, page, perPage, status, sort };
}

/** Monta query string a partir do estado atual + sobrescritas (ex.: próxima página). */
export function studentsListQueryString(
  current: ParsedStudentsListParams,
  patch: Partial<ParsedStudentsListParams> = {}
): string {
  const merged: ParsedStudentsListParams = { ...current, ...patch };
  const p = new URLSearchParams();

  if (merged.q) p.set("q", merged.q);
  if (merged.page > 1) p.set("page", String(merged.page));
  if (merged.perPage !== DEFAULT_PER_PAGE) p.set("per_page", String(merged.perPage));
  if (merged.status !== "all") p.set("status", merged.status);
  if (merged.sort !== "name_asc") p.set("sort", merged.sort);

  const s = p.toString();
  return s ? `?${s}` : "";
}

export const STUDENTS_PER_PAGE_OPTIONS = PER_PAGE_OPTIONS;
