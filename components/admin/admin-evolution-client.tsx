"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { aggregateSkillCounts } from "@/lib/admin/evolution-skill-stats";
import type { ActiveStudentOption } from "@/lib/admin/lessons-queries";
import type { EvolutionEntryRow, LessonOptionForEvolution } from "@/lib/admin/evolution-queries";
import { formatLessonDateTimeSchool } from "@/lib/school-timezone";
import { cn } from "@/lib/utils";

import { EvolutionFormDialog } from "@/components/admin/evolution-form-dialog";
import { EvolutionSkillsChart } from "@/components/admin/evolution-skills-chart";
import { Button } from "@/components/ui/button";

interface AdminEvolutionClientProps {
  initialStudentId: string | null;
  students: ActiveStudentOption[];
  entries: EvolutionEntryRow[];
  lessonOptions: LessonOptionForEvolution[];
  defaultEntryDate: string;
}

function formatEntryDatePt(isoDate: string): string {
  try {
    return format(new Date(`${isoDate}T12:00:00`), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return isoDate;
  }
}

export function AdminEvolutionClient({
  initialStudentId,
  students,
  entries,
  lessonOptions,
  defaultEntryDate,
}: AdminEvolutionClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<EvolutionEntryRow | null>(null);

  const selectedId = initialStudentId;
  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedId) ?? null,
    [students, selectedId]
  );

  const skillStats = useMemo(() => aggregateSkillCounts(entries), [entries]);

  function onStudentChange(nextId: string) {
    if (!nextId) {
      router.push("/admin/evolution");
      return;
    }
    router.push(`/admin/evolution?student=${encodeURIComponent(nextId)}`);
  }

  function openCreate() {
    setDialogMode("create");
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(row: EvolutionEntryRow) {
    setDialogMode("edit");
    setEditing(row);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2 sm:max-w-md">
          <label htmlFor="evo-student" className="text-sm font-medium text-foreground">
            Aluno
          </label>
          <select
            id="evo-student"
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            value={selectedId ?? ""}
            onChange={(e) => onStudentChange(e.target.value)}
          >
            <option value="">Selecione…</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name?.trim() || s.id.slice(0, 8)}
              </option>
            ))}
          </select>
        </div>
        <Button type="button" disabled={!selectedId} onClick={openCreate}>
          Nova entrada
        </Button>
      </div>

      {!selectedId ? (
        <p className="text-sm text-muted-foreground">Escolha um aluno para ver e registrar a evolução.</p>
      ) : null}

      {selectedId && students.length === 0 ? (
        <p className="text-sm text-muted-foreground">Não há alunos ativos cadastrados.</p>
      ) : null}

      {selectedId ? (
        <>
          <section
            className={cn(
              "space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6",
              "bg-[#F0E8DE]/40 dark:bg-card"
            )}
          >
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Habilidades (Recharts)</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Contagem de tags nas entradas de {selectedStudent?.full_name?.trim() || "aluno"}.
              </p>
            </div>
            <EvolutionSkillsChart data={skillStats} />
          </section>

          <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
            <h2 className="text-lg font-semibold tracking-tight">Linha do tempo</h2>
            <p className="text-sm text-muted-foreground">
              Mais recentes primeiro. Clique para editar ou excluir.
            </p>
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma entrada ainda para este aluno.</p>
            ) : (
              <ul className="divide-y divide-border rounded-xl border border-border">
                {entries.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      className="flex w-full flex-col gap-1 px-4 py-3 text-left text-sm transition-colors hover:bg-accent/60"
                      onClick={() => openEdit(row)}
                    >
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-semibold text-foreground">{formatEntryDatePt(row.entry_date)}</span>
                        {row.lesson_scheduled_at ? (
                          <span className="text-xs text-muted-foreground">
                            Aula: {formatLessonDateTimeSchool(row.lesson_scheduled_at)}
                          </span>
                        ) : null}
                      </div>
                      <p className="line-clamp-2 text-muted-foreground">{row.content}</p>
                      {row.skills.length > 0 ? (
                        <p className="text-xs text-muted-foreground">Skills: {row.skills.join(", ")}</p>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}

      <EvolutionFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        mode={dialogMode}
        entry={editing}
        studentId={selectedId ?? ""}
        lessonOptions={lessonOptions}
        defaultEntryDate={defaultEntryDate}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
