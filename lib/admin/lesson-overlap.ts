import type { PublicEnums } from "@/types/database";

export interface LessonIntervalRow {
  id: string;
  scheduled_at: string;
  duration_min: number;
  status: PublicEnums["lesson_status"];
}

function lessonEndMs(startIso: string, durationMin: number): number {
  return new Date(startIso).getTime() + durationMin * 60 * 1000;
}

/** Intervalos [start, end) sobrepostos no tempo. */
export function intervalsOverlapExclusiveEnd(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Conflito se ambas não são canceladas e os intervalos [início, início+duração) se cruzam.
 */
export function lessonOverlapsExisting(
  scheduledAtIso: string,
  durationMin: number,
  excludeLessonId: string | undefined,
  existing: LessonIntervalRow[]
): LessonIntervalRow | undefined {
  const start = new Date(scheduledAtIso).getTime();
  const end = lessonEndMs(scheduledAtIso, durationMin);

  for (const row of existing) {
    if (excludeLessonId && row.id === excludeLessonId) continue;
    if (row.status === "cancelled") continue;
    const oStart = new Date(row.scheduled_at).getTime();
    const oEnd = lessonEndMs(row.scheduled_at, row.duration_min);
    if (intervalsOverlapExclusiveEnd(start, end, oStart, oEnd)) {
      return row;
    }
  }
  return undefined;
}
