"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useTransition } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";

import {
  createFinancialEntryAdminAction,
  deleteFinancialEntryAdminAction,
  updateFinancialEntryAdminAction,
} from "@/lib/admin/financial-admin-actions";
import type { FinancialEntryRow } from "@/lib/admin/financial-queries";
import { financialTypeLabelPt } from "@/lib/admin/financial-status";
import { cn } from "@/lib/utils";
import {
  adminFinancialFormSchema,
  type AdminFinancialFormInput,
} from "@/lib/validations/financial";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FinancialFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  entry: FinancialEntryRow | null;
  studentId: string;
  defaultDueDate: string;
  onSaved: () => void;
}

function defaultValuesFromEntry(
  entry: FinancialEntryRow | null,
  studentId: string,
  defaultDueDate: string
): AdminFinancialFormInput {
  if (!entry) {
    return {
      student_id: studentId,
      type: "monthly",
      amount: "" as unknown as AdminFinancialFormInput["amount"],
      due_date: defaultDueDate,
      notes: "",
      paid_at: null,
    };
  }
  return {
    student_id: entry.student_id,
    type: entry.type,
    amount: entry.amount,
    due_date: entry.due_date,
    notes: entry.notes,
    paid_at: entry.paid_at,
  };
}

export function FinancialFormDialog({
  open,
  onClose,
  mode,
  entry,
  studentId,
  defaultDueDate,
  onSaved,
}: FinancialFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();

  const { reset, ...methods } = useForm<AdminFinancialFormInput>({
    resolver: zodResolver(adminFinancialFormSchema) as Resolver<AdminFinancialFormInput>,
    defaultValues: defaultValuesFromEntry(entry, studentId, defaultDueDate),
  });

  useEffect(() => {
    if (!open) {
      dialogRef.current?.close();
      return;
    }
    reset(defaultValuesFromEntry(entry, studentId, defaultDueDate));
    queueMicrotask(() => dialogRef.current?.showModal());
  }, [open, entry?.id, mode, studentId, defaultDueDate, entry, reset]);

  function handleClose() {
    dialogRef.current?.close();
    onClose();
  }

  function onSubmit(values: AdminFinancialFormInput) {
    startTransition(async () => {
      if (mode === "create") {
        const res = await createFinancialEntryAdminAction(values);
        if (!res.ok) {
          methods.setError("root", { message: res.error });
          return;
        }
        onSaved();
        handleClose();
        return;
      }
      if (!entry) return;
      const res = await updateFinancialEntryAdminAction(entry.id, values);
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
    if (!confirm("Excluir este lançamento permanentemente?")) return;
    startTransition(async () => {
      const res = await deleteFinancialEntryAdminAction(entry.id, entry.student_id);
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
            {mode === "create" ? "Novo lançamento" : "Editar lançamento"}
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
          <label htmlFor="fin-type" className="text-sm font-medium text-foreground">
            Tipo
          </label>
          <select
            id="fin-type"
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            {...methods.register("type")}
          >
            {(["monthly", "package", "single"] as const).map((t) => (
              <option key={t} value={t}>
                {financialTypeLabelPt(t)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="fin-amount" className="text-sm font-medium text-foreground">
            Valor (R$)
          </label>
          <Input
            id="fin-amount"
            type="number"
            step="0.01"
            min="0.01"
            inputMode="decimal"
            {...methods.register("amount")}
          />
          {methods.formState.errors.amount ? (
            <p className="text-xs text-destructive">{methods.formState.errors.amount.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="fin-due" className="text-sm font-medium text-foreground">
            Vencimento
          </label>
          <Input id="fin-due" type="date" {...methods.register("due_date")} />
          {methods.formState.errors.due_date ? (
            <p className="text-xs text-destructive">{methods.formState.errors.due_date.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="fin-paid" className="text-sm font-medium text-foreground">
            Pago em (opcional)
          </label>
          <Input id="fin-paid" type="date" {...methods.register("paid_at")} />
          <p className="text-xs text-muted-foreground">
            Deixe vazio para lançamento em aberto. Preencha na data do pagamento para marcar como pago.
          </p>
          {methods.formState.errors.paid_at ? (
            <p className="text-xs text-destructive">{methods.formState.errors.paid_at.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="fin-notes" className="text-sm font-medium text-foreground">
            Observações
          </label>
          <Textarea
            id="fin-notes"
            rows={3}
            className="resize-y"
            placeholder="Referência, nota fiscal, acordo..."
            {...methods.register("notes")}
          />
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
