"use client";

import { addDays, getISODay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CaretLeft, CaretRight, NotePencil, Plus } from "@phosphor-icons/react";

import { LessonFormDialog } from "@/components/admin/lesson-form-dialog";
import { Button } from "@/components/ui/button";
import type { ActiveStudentOption, LessonWithStudent } from "@/lib/admin/lessons-queries";
import { lessonStatusLabelPt } from "@/lib/admin/lesson-status-label";
import {
  formatLessonDateTimeSchool,
  listSchoolMonthDayInstants,
  schoolLocalDateTimeToUtcIso,
  SCHOOL_TIMEZONE,
  utcInstantToSchoolDateKey,
} from "@/lib/school-timezone";
import { cn } from "@/lib/utils";

interface AdminAgendaClientProps {
  year: number;
  month: number;
  initialDayKey: string;
  lessons: LessonWithStudent[];
  students: ActiveStudentOption[];
}

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;

export function AdminAgendaClient({
  year,
  month,
  initialDayKey,
  lessons,
  students,
}: AdminAgendaClientProps) {
  const router = useRouter();
  const [selectedDayKey, setSelectedDayKey] = useState(initialDayKey);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingLesson, setEditingLesson] = useState<LessonWithStudent | null>(null);

  const monthLabel = useMemo(
    () =>
      formatInTimeZone(
        listSchoolMonthDayInstants(year, month)[0] ?? new Date(),
        SCHOOL_TIMEZONE,
        "MMMM yyyy",
        { locale: ptBR }
      ),
    [year, month]
  );

  const viewYm = `${year}-${String(month).padStart(2, "0")}`;

  const lessonsByDay = useMemo(() => {
    const m = new Map<string, LessonWithStudent[]>();
    for (const l of lessons) {
      const k = utcInstantToSchoolDateKey(l.scheduled_at);
      const arr = m.get(k) ?? [];
      arr.push(l);
      m.set(k, arr);
    }
    for (const arr of Array.from(m.values())) {
      arr.sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
    }
    return m;
  }, [lessons]);

  const monthFirstInstants = useMemo(() => listSchoolMonthDayInstants(year, month), [year, month]);
  const first = monthFirstInstants[0];
  const gridCells = useMemo(() => {
    if (!first) return [];
    const mondayOffset = getISODay(first) - 1;
    const gridStart = addDays(first, -mondayOffset);
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [first]);

  const selectedLessons = lessonsByDay.get(selectedDayKey) ?? [];

  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };

  function openCreate() {
    setDialogMode("create");
    setEditingLesson(null);
    setDialogOpen(true);
  }

  function openEdit(lesson: LessonWithStudent) {
    setDialogMode("edit");
    setEditingLesson(lesson);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link
              href={`/admin/agenda?year=${prev.y}&month=${prev.m}`}
              aria-label="Mês anterior"
            >
              <CaretLeft className="size-5" weight="bold" />
            </Link>
          </Button>
          <h2 className="min-w-[10rem] text-center text-lg font-semibold capitalize tracking-tight">
            {monthLabel}
          </h2>
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/agenda?year=${next.y}&month=${next.m}`} aria-label="Próximo mês">
              <CaretRight className="size-5" weight="bold" />
            </Link>
          </Button>
        </div>
        <Button type="button" className="gap-2" onClick={openCreate}>
          <Plus className="size-5" weight="bold" aria-hidden />
          Nova aula
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,22rem)] lg:items-start">
        <div
          className="rounded-2xl border border-border bg-[#F0E8DE]/40 p-3 shadow-[8px_8px_16px_rgba(212,184,160,0.35),-6px_-6px_14px_rgba(255,252,248,0.9)] dark:bg-card/60 dark:shadow-none"
          data-neo="agenda-month"
        >
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-2">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {gridCells.map((cellInstant) => {
              const dateKey = utcInstantToSchoolDateKey(cellInstant.toISOString());
              const inMonth = dateKey.startsWith(`${viewYm}-`);
              const dayNum = dateKey.slice(-2);
              const isSelected = dateKey === selectedDayKey;
              const dayLessons = lessonsByDay.get(dateKey) ?? [];
              const isToday =
                dateKey === utcInstantToSchoolDateKey(new Date().toISOString());

              return (
                <button
                  key={dateKey + cellInstant.toISOString()}
                  type="button"
                  onClick={() => setSelectedDayKey(dateKey)}
                  className={cn(
                    "flex min-h-[4.5rem] flex-col gap-0.5 rounded-xl border p-1.5 text-left text-sm transition-colors",
                    inMonth
                      ? "border-border/60 bg-card/80 hover:bg-accent/30"
                      : "border-transparent bg-transparent opacity-50",
                    isSelected && "ring-2 ring-primary/50",
                    isToday && inMonth && "bg-primary/10"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-semibold tabular-nums",
                      inMonth ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {Number(dayNum)}
                  </span>
                  <div className="mt-0.5 space-y-0.5">
                    {dayLessons.slice(0, 2).map((l) => (
                      <span
                        key={l.id}
                        className="block truncate rounded bg-primary/15 px-1 text-[10px] font-medium text-primary"
                        title={l.student_name ?? ""}
                      >
                        {l.student_name?.split(" ")[0] ?? "Aula"}{" "}
                        {formatInTimeZone(new Date(l.scheduled_at), SCHOOL_TIMEZONE, "HH:mm")}
                      </span>
                    ))}
                    {dayLessons.length > 2 ? (
                      <span className="text-[10px] text-muted-foreground">+{dayLessons.length - 2}</span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold tracking-tight">
              {formatInTimeZone(
                new Date(schoolLocalDateTimeToUtcIso(selectedDayKey, "12:00")),
                SCHOOL_TIMEZONE,
                "EEEE, dd/MM/yyyy",
                { locale: ptBR }
              )}
            </h3>
            <Button type="button" variant="ghost" size="sm" className="gap-1 text-xs" onClick={openCreate}>
              <Plus className="size-4" />
              Incluir
            </Button>
          </div>
          {selectedLessons.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma aula neste dia.</p>
          ) : (
            <ul className="space-y-2">
              {selectedLessons.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    className="flex w-full flex-col gap-1 rounded-xl border border-border bg-background/60 px-3 py-2 text-left text-sm transition-colors hover:bg-accent/40"
                    onClick={() => openEdit(l)}
                  >
                    <span className="font-medium text-foreground">
                      {l.student_name?.trim() || "Aluno"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatLessonDateTimeSchool(l.scheduled_at)} · {l.duration_min} min ·{" "}
                      {lessonStatusLabelPt(l.status)}
                    </span>
                    {l.notes ? (
                      <span className="line-clamp-2 text-xs text-muted-foreground">{l.notes}</span>
                    ) : null}
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                      <NotePencil className="size-3.5" />
                      Editar
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[11px] leading-snug text-muted-foreground">
            Toque em um dia na grade ou escolha uma aula para editar. Conflitos para o mesmo aluno são
            bloqueados automaticamente.
          </p>
        </aside>
      </div>

      <LessonFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        mode={dialogMode}
        lesson={editingLesson}
        students={students}
        defaultDateKey={selectedDayKey}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
