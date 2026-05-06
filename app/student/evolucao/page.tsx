import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import { fetchStudentEvolutionEntries } from "@/lib/student/student-portal-queries";
import { requireStudentSession } from "@/lib/student/session";

function formatEvolutionHeading(d: string): string {
  return format(parseISO(`${d}T12:00:00`), "d 'de' MMMM yyyy", { locale: ptBR });
}

export default async function StudentEvolutionPage() {
  const { profile, supabase } = await requireStudentSession();
  const entries = await fetchStudentEvolutionEntries(supabase, profile.id, 200);

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
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Evolução</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Registros publicados pela equipe — apenas leitura no portal (vídeos e imagens ficam planejados para versões futuras).
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ainda não há entradas de evolução para você neste painel.</p>
      ) : (
        <ol className="relative space-y-6 border-l border-border pl-6">
          {entries.map((entry) => (
            <li key={entry.id} className="relative">
              <span className="-left-[27px] absolute mt-2 size-2 rounded-full bg-primary md:-left-[31px]" />
              <article className="rounded-2xl border border-border bg-card p-4 md:p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {formatEvolutionHeading(entry.entry_date)}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{entry.content.trim()}</p>
                {entry.skills?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {entry.skills.map((s) => (
                      <span key={s} className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
