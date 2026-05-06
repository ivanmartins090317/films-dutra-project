import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import { StudentCommsStrip } from "@/components/student/student-comms-strip";
import { fallbackSchoolDisplayName, fetchSchoolSettings } from "@/lib/school-settings";
import { lessonStatusLabelPt } from "@/lib/admin/lesson-status-label";
import {
  fetchStudentEvolutionEntries,
  fetchStudentUpcomingLessons,
  lessonSummaryLine,
} from "@/lib/student/student-portal-queries";
import { requireStudentSession } from "@/lib/student/session";
import { cn } from "@/lib/utils";

function formatEvolutionDay(d: string): string {
  return format(parseISO(`${d}T12:00:00`), "d MMM yyyy", { locale: ptBR });
}

export default async function StudentHomePage() {
  const { profile, supabase } = await requireStudentSession();
  const schoolRow = await fetchSchoolSettings(supabase);
  const schoolName = fallbackSchoolDisplayName(schoolRow);
  const contactEmail = schoolRow?.contact_email?.trim() ?? null;
  const contactPhone = schoolRow?.contact_phone?.trim() ?? null;

  const [upcomingLessons, evolutionPreview] = await Promise.all([
    fetchStudentUpcomingLessons(supabase, profile.id, 8),
    fetchStudentEvolutionEntries(supabase, profile.id, 3),
  ]);

  const firstName =
    profile.full_name?.trim().split(/\s+/)[0] ?? profile.full_name?.trim() ?? "aluno/a";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Olá, {firstName}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acompanhe suas aulas, evolução e surf trips pelo portal oficial da escola.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <section
          className={cn(
            "rounded-2xl border border-border px-5 py-5 text-foreground",
            "bg-secondary/50 shadow-[8px_8px_24px_rgb(215,204,188,0.35),_-6px_-6px_20px_rgb(255,253,247,0.85)]",
            "dark:bg-card dark:shadow-md"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Próximas aulas</h2>
            <Link
              href="/student/aulas"
              className="text-xs font-semibold uppercase tracking-wide text-primary underline-offset-4 hover:underline"
            >
              Ver histórico
            </Link>
          </div>
          {upcomingLessons.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Você não tem aulas agendadas pela frente — na ausência de aviso diverso, fale com a equipe.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcomingLessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className={cn(
                    "rounded-xl border border-border bg-background/80 px-4 py-3 text-sm backdrop-blur-sm",
                    "dark:bg-background/90"
                  )}
                >
                  <p className="font-medium text-foreground">{lessonSummaryLine(lesson)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {lessonStatusLabelPt(lesson.status)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <StudentCommsStrip
          schoolName={schoolName}
          contactEmail={contactEmail && contactEmail.length > 0 ? contactEmail : null}
          contactPhone={contactPhone && contactPhone.length > 0 ? contactPhone : null}
        />
      </div>

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Evolução recente</h2>
          <Link
            href="/student/evolucao"
            className="text-xs font-semibold uppercase tracking-wide text-primary underline-offset-4 hover:underline"
          >
            Timeline completa
          </Link>
        </div>
        {evolutionPreview.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Ainda não há registros públicos na sua timeline — assim que sua instrutora publicar atualizações, elas
            aparecem aqui.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            {evolutionPreview.map((e) => (
              <li key={e.id} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {formatEvolutionDay(e.entry_date)}
                </p>
                <p className="mt-2 line-clamp-4 text-sm text-foreground">{e.content.trim()}</p>
                {e.skills?.length ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {e.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
