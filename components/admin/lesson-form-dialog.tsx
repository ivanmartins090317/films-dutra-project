"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useTransition } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { LessonWithStudent, ActiveStudentOption } from "@/lib/admin/lessons-queries";
import {
  createLessonAdminAction,
  deleteLessonAdminAction,
  updateLessonAdminAction,
} from "@/lib/admin/lesson-admin-actions";
import { lessonStatusLabelPt } from "@/lib/admin/lesson-status-label";
import { utcIsoToSchoolDateAndTime } from "@/lib/school-timezone";
import {
  adminLessonFormSchema,
  type AdminLessonFormInput,
} from "@/lib/validations/lesson";

interface LessonFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  lesson: LessonWithStudent | null;
  students: ActiveStudentOption[];
  /** yyyy-MM-dd na escola */
  defaultDateKey: string;
  onSaved: () => void;
}

export function LessonFormDialog({
  open,
  onClose,
  mode,
  lesson,
  students,
  defaultDateKey,
  onSaved,
}: LessonFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();

  const { reset, watch, ...methods } = useForm<AdminLessonFormInput>({
    resolver: zodResolver(adminLessonFormSchema) as Resolver<AdminLessonFormInput>,
    defaultValues: defaultValuesFromLesson(lesson, defaultDateKey),
  });

  const statusWatch = watch("status");

  useEffect(() => {
    if (!open) {
      dialogRef.current?.close();
      return;
    }
    reset(defaultValuesFromLesson(lesson, defaultDateKey));
    queueMicrotask(() => dialogRef.current?.showModal());
  }, [open, lesson?.id, mode, defaultDateKey, lesson, reset]);

  function handleClose() {
    dialogRef.current?.close();
    onClose();
  }

  function onSubmit(values: AdminLessonFormInput) {
    startTransition(async () => {
      if (mode === "create") {
        const res = await createLessonAdminAction(values);
        if (!res.ok) {
          methods.setError("root", { message: res.error });
          return;
        }
        onSaved();
        handleClose();
        return;
      }
      if (!lesson) return;
      const res = await updateLessonAdminAction(lesson.id, values);
      if (!res.ok) {
        methods.setError("root", { message: res.error });
        return;
      }
      onSaved();
      handleClose();
    });
  }

  function handleDelete() {
    if (!lesson || mode !== "edit") return;
    if (!confirm("Excluir esta aula permanentemente?")) return;
    startTransition(async () => {
      const res = await deleteLessonAdminAction(lesson.id, lesson.student_id);
      if (!res.ok) {
        methods.setError("root", { message: res.error });
        return;
      }
      onSaved();
      handleClose();
    });
  }

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-lg backdrop:bg-black/40"
      onClose={onClose}
    >
      <form
        className="flex max-h-[85vh] flex-col gap-4 overflow-y-auto p-5"
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            {mode === "create" ? "Nova aula" : "Editar aula"}
          </h2>
          <button
            type="button"
            className="rounded-md text-sm text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            Fechar
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-muted-foreground">
            Aluno
            <select
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              disabled={pending}
              {...methods.register("student_id")}
            >
              <option value="">Selecione…</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name?.trim() || s.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </label>
          {methods.formState.errors.student_id ? (
            <p className="text-xs text-destructive">{methods.formState.errors.student_id.message}</p>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs font-medium text-muted-foreground">
              Data
              <Input type="date" className="mt-1" disabled={pending} {...methods.register("scheduled_date")} />
            </label>
            <label className="block text-xs font-medium text-muted-foreground">
              Hora
              <Input type="time" className="mt-1" disabled={pending} {...methods.register("scheduled_time")} />
            </label>
          </div>

          <label className="block text-xs font-medium text-muted-foreground">
            Duração (minutos)
            <Input
              type="number"
              min={15}
              max={480}
              step={15}
              className="mt-1"
              disabled={pending}
              {...methods.register("duration_min", { valueAsNumber: true })}
            />
          </label>

          <label className="block text-xs font-medium text-muted-foreground">
            Status
            <select
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              disabled={pending}
              {...methods.register("status")}
            >
              {(["scheduled", "completed", "cancelled", "missed"] as const).map((s) => (
                <option key={s} value={s}>
                  {lessonStatusLabelPt(s)}
                </option>
              ))}
            </select>
          </label>

          <label
            className={cn(
              "block text-xs font-medium text-muted-foreground",
              statusWatch !== "cancelled" && "sr-only"
            )}
          >
            Motivo do cancelamento
            <Textarea
              className={cn("mt-1 min-h-[72px]", statusWatch !== "cancelled" && "hidden")}
              disabled={pending}
              aria-hidden={statusWatch !== "cancelled"}
              {...methods.register("cancel_reason")}
            />
          </label>

          <label className="block text-xs font-medium text-muted-foreground">
            Anotações
            <Textarea className="mt-1 min-h-[72px]" disabled={pending} {...methods.register("notes")} />
          </label>

          <label className="block text-xs font-medium text-muted-foreground">
            Skills observadas (separar por vírgula)
            <Input className="mt-1" disabled={pending} {...methods.register("skills_noted")} />
          </label>
        </div>

        {methods.formState.errors.root ? (
          <p className="text-sm text-destructive">{methods.formState.errors.root.message}</p>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
          {mode === "edit" && lesson ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={pending}
              onClick={handleDelete}
            >
              Excluir
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="sm" disabled={pending} onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Salvando…" : "Salvar"}
          </Button>
        </div>

        <p className="text-[11px] leading-snug text-muted-foreground">
          Horários são salvos em UTC; exibição usa o fuso da escola (America/São_Paulo).
        </p>
      </form>
    </dialog>
  );
}

function defaultValuesFromLesson(
  lesson: LessonWithStudent | null,
  defaultDateKey: string
): AdminLessonFormInput {
  if (!lesson) {
    return {
      student_id: "",
      scheduled_date: defaultDateKey,
      scheduled_time: "09:00",
      duration_min: 60,
      status: "scheduled",
      cancel_reason: "",
      notes: "",
      skills_noted: "",
    };
  }
  const { dateStr, timeStr } = utcIsoToSchoolDateAndTime(lesson.scheduled_at);
  return {
    student_id: lesson.student_id,
    scheduled_date: dateStr,
    scheduled_time: timeStr,
    duration_min: lesson.duration_min,
    status: lesson.status,
    cancel_reason: lesson.cancel_reason,
    notes: lesson.notes,
    skills_noted: lesson.skills_noted.join(", "),
  };
}
