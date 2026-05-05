import { ptBR } from "date-fns/locale";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

/** Fuso da escola (MVP). Futuro: mover para configurações (Fase 10). */
export const SCHOOL_TIMEZONE = "America/Sao_Paulo";

export function schoolNowYm(): { year: number; month: number } {
  const key = formatInTimeZone(new Date(), SCHOOL_TIMEZONE, "yyyy-MM");
  const [y, m] = key.split("-").map(Number);
  return { year: y, month: m };
}

/** Limites UTC do dia civil na escola (para contagens tipo \"aulas hoje\"). */
export function getSchoolDayBoundsUtc(day: Date): { start: string; end: string } {
  const ymd = formatInTimeZone(day, SCHOOL_TIMEZONE, "yyyy-MM-dd");
  const [y, mo, d] = ymd.split("-").map(Number);
  const startWall = new Date(y, mo - 1, d, 0, 0, 0, 0);
  const endWall = new Date(y, mo - 1, d + 1, 0, 0, 0, 0);
  return {
    start: fromZonedTime(startWall, SCHOOL_TIMEZONE).toISOString(),
    end: fromZonedTime(endWall, SCHOOL_TIMEZONE).toISOString(),
  };
}

/** Intervalo UTC [start, end) do mês civil na escola. */
export function getSchoolMonthRangeUtc(year: number, month1to12: number): { start: string; end: string } {
  const startWall = new Date(year, month1to12 - 1, 1, 0, 0, 0, 0);
  const endWall =
    month1to12 === 12
      ? new Date(year + 1, 0, 1, 0, 0, 0, 0)
      : new Date(year, month1to12, 1, 0, 0, 0, 0);
  return {
    start: fromZonedTime(startWall, SCHOOL_TIMEZONE).toISOString(),
    end: fromZonedTime(endWall, SCHOOL_TIMEZONE).toISOString(),
  };
}

/** Instantes UTC de meio-dia de cada dia civil do mês (para grade). */
export function listSchoolMonthDayInstants(year: number, month1to12: number): Date[] {
  const out: Date[] = [];
  for (let day = 1; day <= 31; day++) {
    const wall = new Date(year, month1to12 - 1, day, 12, 0, 0, 0);
    if (wall.getMonth() !== month1to12 - 1) break;
    out.push(fromZonedTime(wall, SCHOOL_TIMEZONE));
  }
  return out;
}

export function utcInstantToSchoolDateKey(iso: string): string {
  return formatInTimeZone(new Date(iso), SCHOOL_TIMEZONE, "yyyy-MM-dd");
}

export function formatLessonDateTimeSchool(iso: string): string {
  return formatInTimeZone(new Date(iso), SCHOOL_TIMEZONE, "EEE dd/MM/yyyy · HH:mm", {
    locale: ptBR,
  });
}

/** Interpreta data + hora como horário local da escola e retorna ISO UTC. */
export function schoolLocalDateTimeToUtcIso(dateStr: string, timeStr: string): string {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const wall = new Date(y, mo - 1, d, hh, mm, 0, 0);
  return fromZonedTime(wall, SCHOOL_TIMEZONE).toISOString();
}

export function utcIsoToSchoolDateAndTime(iso: string): { dateStr: string; timeStr: string } {
  const dateStr = formatInTimeZone(new Date(iso), SCHOOL_TIMEZONE, "yyyy-MM-dd");
  const timeStr = formatInTimeZone(new Date(iso), SCHOOL_TIMEZONE, "HH:mm");
  return { dateStr, timeStr };
}
