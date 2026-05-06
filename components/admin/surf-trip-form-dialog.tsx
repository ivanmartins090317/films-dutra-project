"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useTransition } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";

import {
  createSurfTripAdminAction,
  deleteSurfTripAdminAction,
  updateSurfTripAdminAction,
} from "@/lib/admin/trip-admin-actions";
import type { SurfTripRow } from "@/lib/admin/trip-queries";
import {
  adminSurfTripFormSchema,
  type AdminSurfTripFormInput,
} from "@/lib/validations/surf-trip";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SurfTripFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  trip: SurfTripRow | null;
  defaultTripDate: string;
  onSaved: () => void;
}

function defaultValuesFromTrip(
  trip: SurfTripRow | null,
  defaultTripDate: string
): AdminSurfTripFormInput {
  if (!trip) {
    return {
      title: "",
      destination: "",
      trip_date: defaultTripDate,
      description: "",
      spots_total: 8,
      cover_url: "",
    };
  }
  return {
    title: trip.title,
    destination: trip.destination,
    trip_date: trip.trip_date,
    description: trip.description,
    spots_total: trip.spots_total,
    cover_url: trip.cover_url ?? "",
  };
}

export function SurfTripFormDialog({
  open,
  onClose,
  mode,
  trip,
  defaultTripDate,
  onSaved,
}: SurfTripFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();

  const { reset, ...methods } = useForm<AdminSurfTripFormInput>({
    resolver: zodResolver(adminSurfTripFormSchema) as Resolver<AdminSurfTripFormInput>,
    defaultValues: defaultValuesFromTrip(trip, defaultTripDate),
  });

  useEffect(() => {
    if (!open) {
      dialogRef.current?.close();
      return;
    }
    reset(defaultValuesFromTrip(trip, defaultTripDate));
    queueMicrotask(() => dialogRef.current?.showModal());
  }, [open, trip?.id, mode, defaultTripDate, trip, reset]);

  function handleClose() {
    dialogRef.current?.close();
    onClose();
  }

  function onSubmit(values: AdminSurfTripFormInput) {
    startTransition(async () => {
      if (mode === "create") {
        const res = await createSurfTripAdminAction(values);
        if (!res.ok) {
          methods.setError("root", { message: res.error });
          return;
        }
        onSaved();
        handleClose();
        return;
      }
      if (!trip) return;
      const res = await updateSurfTripAdminAction(trip.id, values);
      if (!res.ok) {
        methods.setError("root", { message: res.error });
        return;
      }
      onSaved();
      handleClose();
    });
  }

  function handleDelete() {
    if (!trip || mode !== "edit") return;
    if (!confirm("Excluir esta surf trip e todas as inscrições?")) return;
    startTransition(async () => {
      const res = await deleteSurfTripAdminAction(trip.id);
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
      className="fixed left-1/2 top-1/2 z-50 w-[min(100%-2rem,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-lg backdrop:bg-black/40"
      onClose={onClose}
    >
      <form
        className="flex max-h-[85vh] flex-col gap-4 overflow-y-auto p-5"
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            {mode === "create" ? "Nova surf trip" : "Editar surf trip"}
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
          <label htmlFor="trip-title" className="text-sm font-medium text-foreground">
            Título
          </label>
          <Input id="trip-title" {...methods.register("title")} placeholder="Ex.: Trip Noronha" />
          {methods.formState.errors.title ? (
            <p className="text-xs text-destructive">{methods.formState.errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="trip-dest" className="text-sm font-medium text-foreground">
            Destino
          </label>
          <Input id="trip-dest" {...methods.register("destination")} />
          {methods.formState.errors.destination ? (
            <p className="text-xs text-destructive">
              {methods.formState.errors.destination.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="trip-date" className="text-sm font-medium text-foreground">
              Data
            </label>
            <Input id="trip-date" type="date" {...methods.register("trip_date")} />
            {methods.formState.errors.trip_date ? (
              <p className="text-xs text-destructive">{methods.formState.errors.trip_date.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="trip-spots" className="text-sm font-medium text-foreground">
              Vagas totais
            </label>
            <Input
              id="trip-spots"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              {...methods.register("spots_total")}
            />
            {methods.formState.errors.spots_total ? (
              <p className="text-xs text-destructive">
                {methods.formState.errors.spots_total.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="trip-desc" className="text-sm font-medium text-foreground">
            Descrição
          </label>
          <Textarea
            id="trip-desc"
            rows={4}
            className="resize-y"
            placeholder="Programação, observações…"
            {...methods.register("description")}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="trip-cover-url" className="text-sm font-medium text-foreground">
            URL da capa (opcional)
          </label>
          <Input
            id="trip-cover-url"
            type="url"
            placeholder="https://…"
            {...methods.register("cover_url")}
          />
          <p className="text-xs text-muted-foreground">
            Ou envie uma imagem pela área da trip na lista (após salvar).
          </p>
          {methods.formState.errors.cover_url ? (
            <p className="text-xs text-destructive">{methods.formState.errors.cover_url.message}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" disabled={pending} className="min-w-[7rem]">
            {pending ? "Salvando…" : mode === "create" ? "Criar" : "Salvar"}
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
              Excluir trip
            </Button>
          ) : null}
        </div>
      </form>
    </dialog>
  );
}
