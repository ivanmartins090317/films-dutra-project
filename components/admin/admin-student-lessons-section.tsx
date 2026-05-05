import Link from "next/link";

import type { LessonWithStudent } from "@/lib/admin/lessons-queries";
import { lessonStatusLabelPt } from "@/lib/admin/lesson-status-label";
import {
  formatLessonDateTimeSchool,
  schoolNowYm,
  utcInstantToSchoolDateKey,
} from "@/lib/school-timezone";

interface AdminStudentLessonsSectionProps {
  lessons: LessonWithStudent[];
}

export function AdminStudentLessonsSection({ lessons }: AdminStudentLessonsSectionProps) {
  const { year: agendaYear, month: agendaMonth } = schoolNowYm();
  const todayKey = utcInstantToSchoolDateKey(new Date().toISOString());

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Aulas</h2>
        <Link
          href={`/admin/agenda?year=${agendaYear}&month=${agendaMonth}&day=${encodeURIComponent(todayKey)}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Abrir agenda →
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">
        Histórico recente de aulas deste aluno. Para criar ou editar, use a agenda.
      </p>
      {lessons.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma aula registrada ainda.</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {lessons.map((l) => {
            const dk = utcInstantToSchoolDateKey(l.scheduled_at);
            const [yStr, mStr] = dk.split("-");
            const y = Number(yStr);
            const m = Number(mStr);
            return (
              <li
                key={l.id}
                className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">{formatLessonDateTimeSchool(l.scheduled_at)}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.duration_min} min · {lessonStatusLabelPt(l.status)}
                    {l.cancel_reason && l.status === "cancelled" ? ` · ${l.cancel_reason}` : ""}
                  </p>
                  {l.skills_noted.length > 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Skills: {l.skills_noted.join(", ")}
                    </p>
                  ) : null}
                </div>
                <Link
                  href={`/admin/agenda?year=${y}&month=${m}&day=${encodeURIComponent(dk)}`}
                  className="shrink-0 text-xs font-medium text-primary hover:underline"
                >
                  Ver na agenda
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
