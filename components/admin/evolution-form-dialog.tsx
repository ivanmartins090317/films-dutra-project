"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useTransition } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";

import { lessonStatusLabelPt } from "@/lib/admin/lesson-status-label";
import {
  createEvolutionEntryAdminAction,
  deleteEvolutionEntryAdminAction,
  updateEvolutionEntryAdminAction,
} from "@/lib/admin/evolution-admin-actions";
import type { EvolutionEntryRow, LessonOptionForEvolution } from "@/lib/admin/evolution-queries";
import { formatLessonDateTimeSchool } from "@/lib/school-timezone";
import { cn } from "@/lib/utils";
import {
  adminEvolutionFormSchema,
  type AdminEvolutionFormInput,
} from "@/lib/validations/evolution";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EvolutionFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  entry: EvolutionEntryRow | null;
  studentId: string;
  lessonOptions: LessonOptionForEvolution[];
  defaultEntryDate: string;
  onSaved: () => void;
}

function defaultValuesFromEntry(
  entry: EvolutionEntryRow | null,
  studentId: string,
  defaultEntryDate: string
): AdminEvolutionFormInput {
  if (!entry) {
    return {
      student_id: studentId,
      entry_date: defaultEntryDate,
      content: "",
      skills_input: "",
      lesson_id: undefined,
    };
  }
  return {
    student_id: entry.student_id,
    entry_date: entry.entry_date,
    content: entry.content,
    skills_input: entry.skills.join(", "),
    lesson_id: entry.lesson_id ?? undefined,
  };
}

export function EvolutionFormDialog({
  open,
  onClose,
  mode,
  entry,
  studentId,
  lessonOptions,
  defaultEntryDate,
  onSaved,
}: EvolutionFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();

  const { reset, ...methods } = useForm<AdminEvolutionFormInput>({
    resolver: zodResolver(adminEvolutionFormSchema) as Resolver<AdminEvolutionFormInput>,
    defaultValues: defaultValuesFromEntry(entry, studentId, defaultEntryDate),
  });

  useEffect(() => {
    if (!open) {
      dialogRef.current?.close();
      return;
    }
    reset(defaultValuesFromEntry(entry, studentId, defaultEntryDate));
    queueMicrotask(() => dialogRef.current?.showModal());
  }, [open, entry?.id, mode, studentId, defaultEntryDate, entry, reset]);

  function handleClose() {
    dialogRef.current?.close();
    onClose();
  }

  function onSubmit(values: AdminEvolutionFormInput) {
    startTransition(async () => {
      if (mode === "create") {
        const res = await createEvolutionEntryAdminAction(values);
        if (!res.ok) {
          methods.setError("root", { message: res.error });
          return;
        }
        onSaved();
        handleClose();
        return;
      }
      if (!entry) return;
      const res = await updateEvolutionEntryAdminAction(entry.id, values);
      if (!res.ok) {
        methods.setError("root", { message: res.error });
        return;
      }
      onSaved();
      handleClose();
    });
  }

  function handleDelete() {
    if (!entry || mode !== "edit") return;
    if (!confirm("Excluir este registro de evolução permanentemente?")) return;
    startTransition(async () => {
      const res = await deleteEvolutionEntryAdminAction(entry.id, entry.student_id);
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
            {mode === "create" ? "Nova entrada" : "Editar evolução"}
          </h2>
          <button
            type="button"
            className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={handleClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {methods.formState.errors.root ? (
          <p className="text-sm text-destructive" role="alert">
            {methods.formState.errors.root.message}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor="evo-date" className="text-sm font-medium text-foreground">
            Data da evolução
          </label>
          <Input id="evo-date" type="date" {...methods.register("entry_date")} />
          {methods.formState.errors.entry_date ? (
            <p className="text-xs text-destructive">{methods.formState.errors.entry_date.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="evo-content" className="text-sm font-medium text-foreground">
            Conteúdo
          </label>
          <Textarea
            id="evo-content"
            rows={5}
            className="resize-y"
            placeholder="Observações do professor sobre o progresso do aluno..."
            {...methods.register("content")}
          />
          {methods.formState.errors.content ? (
            <p className="text-xs text-destructive">{methods.formState.errors.content.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="evo-skills" className="text-sm font-medium text-foreground">
            Habilidades (tags)
          </label>
          <Textarea
            id="evo-skills"
            rows={2}
            className="resize-y"
            placeholder="Ex.: takeoff, leitura de onda, paddling (separar por vírgula ou linha)"
            {...methods.register("skills_input")}
          />
          <p className="text-xs text-muted-foreground">Opcional. Usadas no gráfico de frequência.</p>
          {methods.formState.errors.skills_input ? (
            <p className="text-xs text-destructive">{methods.formState.errors.skills_input.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="evo-lesson" className="text-sm font-medium text-foreground">
            Vincular aula (opcional)
          </label>
          <select
            id="evo-lesson"
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            {...methods.register("lesson_id")}
          >
            <option value="">— Nenhuma —</option>
            {lessonOptions.map((l) => (
              <option key={l.id} value={l.id}>
                {formatLessonDateTimeSchool(l.scheduled_at)} · {lessonStatusLabelPt(l.status)}
              </option>
            ))}
          </select>
          {methods.formState.errors.lesson_id ? (
            <p className="text-xs text-destructive">{methods.formState.errors.lesson_id.message}</p>
          ) : null}
        </div>

        <input type="hidden" {...methods.register("student_id")} />

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" disabled={pending} className="min-w-[7rem]">
            {pending ? "Salvando…" : mode === "create" ? "Registrar" : "Salvar"}
          </Button>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          {mode === "edit" ? (
            <Button
              type="button"
              variant="destructive"
              className="ml-auto"
              disabled={pending}
              onClick={handleDelete}
            >
              Excluir
            </Button>
          ) : null}
        </div>
      </form>
    </dialog>
  );
}
