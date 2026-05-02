/** Início do dia UTC para comparar com próximo aniversário. */
function utcDayStartMs(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export interface BirthdayCandidate {
  id: string;
  full_name: string;
  birth_date: string | null;
}

export interface BirthdaySoonRow extends BirthdayCandidate {
  birth_date: string;
  /** Dias até o aniversário (0 = hoje), sempre relativo ao parâmetro `nowUtc`. */
  daysUntil: number;
}

/** Extrai mês (1–12) e dia do campo `birth_date` ISO `YYYY-MM-DD`. */
export function parseBirthMonthDay(iso: string): { month: number; day: number } | null {
  const m = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { month, day };
}

/**
 * Dias até a próxima ocorrência do aniversário (MM-DD), contados a partir do dia UTC de `nowUtc`.
 * Anos bissextos: 29/02 usa 28/02 em anos não bissextos.
 */
export function daysUntilNextBirthdayUtc(
  month: number,
  day: number,
  nowUtc: Date
): number | null {
  const sod = utcDayStartMs(nowUtc);
  const y = nowUtc.getUTCFullYear();

  function targetMs(year: number): number {
    let d = day;
    if (month === 2 && d === 29) {
      const isLeap =
        (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      if (!isLeap) d = 28;
    }
    const t = Date.UTC(year, month - 1, d);
    const check = new Date(t);
    if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== d) return NaN;
    return t;
  }

  let tMs = targetMs(y);
  if (Number.isNaN(tMs)) return null;
  if (tMs < sod) {
    tMs = targetMs(y + 1);
    if (Number.isNaN(tMs)) return null;
  }

  return Math.round((tMs - sod) / 86_400_000);
}

/**
 * Filtra alunos com aniversário nos próximos `windowDays` dias (inclui hoje), ordenados por proximidade.
 */
export function filterBirthdaysWithinUtcDays(
  candidates: BirthdayCandidate[],
  nowUtc: Date,
  windowDays: number
): BirthdaySoonRow[] {
  const out: BirthdaySoonRow[] = [];

  for (const c of candidates) {
    if (!c.birth_date) continue;
    const md = parseBirthMonthDay(c.birth_date);
    if (!md) continue;
    const daysUntil = daysUntilNextBirthdayUtc(md.month, md.day, nowUtc);
    if (daysUntil === null) continue;
    if (daysUntil > windowDays) continue;

    out.push({
      ...c,
      birth_date: c.birth_date,
      daysUntil,
    });
  }

  out.sort((a, b) => a.daysUntil - b.daysUntil || (a.full_name || "").localeCompare(b.full_name || ""));
  return out;
}
