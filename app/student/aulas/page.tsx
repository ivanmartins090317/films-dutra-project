import Link from "next/link";

import { lessonStatusLabelPt } from "@/lib/admin/lesson-status-label";
import { fetchStudentLessonHistory, lessonSummaryLine } from "@/lib/student/student-portal-queries";
import { requireStudentSession } from "@/lib/student/session";

export default async function StudentLessonsPage() {
  const { profile, supabase } = await requireStudentSession();

  const history = await fetchStudentLessonHistory(supabase, profile.id, 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <Link
            href="/student"
            className="text-xs font-semibold uppercase tracking-wide text-primary underline-offset-4 hover:underline"
          >
            ← Início
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Aulas</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Histórico de aulas pelo calendário da escola — somente leitura conforme combinado entre instrutoria e você.
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">Você ainda não tem aulas cadastradas no sistema.</p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {history.map((lesson) => (
            <li key={lesson.id} className="px-4 py-4 sm:grid sm:grid-cols-[1fr_auto] sm:gap-6 sm:px-6">
              <div>
                <p className="font-medium text-foreground">{lessonSummaryLine(lesson)}</p>
                {lesson.skills_noted?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {lesson.skills_noted.map((s) => (
                      <span key={s} className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : null}
                {lesson.notes?.trim() ? (
                  <p className="mt-3 text-sm text-muted-foreground">{lesson.notes.trim()}</p>
                ) : null}
                {lesson.status === "cancelled" && lesson.cancel_reason.trim() ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Motivo do cancelamento: {lesson.cancel_reason.trim()}
                  </p>
                ) : null}
              </div>
              <div className="mt-3 sm:mt-0 sm:text-right">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                  {lessonStatusLabelPt(lesson.status)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
