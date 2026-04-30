"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useTransition } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";

import { FREQUENCIES, SURF_LEVELS, WEEKDAYS } from "@/components/onboarding/onboarding-constants";
import { upsertStudentDetailsAdminAction } from "@/lib/admin/student-admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  adminStudentDetailsSchema,
  type AdminStudentDetailsInput,
} from "@/lib/validations/admin-student";
import type { Database } from "@/types/database";

type StudentDetailsRow = Database["public"]["Tables"]["student_details"]["Row"];

interface AdminStudentDetailsEditFormProps {
  studentId: string;
  studentDetails: StudentDetailsRow | null;
}

export function AdminStudentDetailsEditForm({
  studentId,
  studentDetails,
}: AdminStudentDetailsEditFormProps) {
  const [pending, startTransition] = useTransition();

  const methods = useForm<AdminStudentDetailsInput>({
    resolver: zodResolver(adminStudentDetailsSchema) as Resolver<AdminStudentDetailsInput>,
    defaultValues: mapRowToForm(studentDetails),
  });

  const preferredDays = methods.watch("preferred_days");

  function toggleDay(dayId: AdminStudentDetailsInput["preferred_days"][number]) {
    const cur = methods.getValues("preferred_days");
    const next = cur.includes(dayId)
      ? cur.filter((x) => x !== dayId)
      : [...cur, dayId];
    methods.setValue("preferred_days", next as AdminStudentDetailsInput["preferred_days"], {
      shouldValidate: true,
    });
  }

  function onSubmit(values: AdminStudentDetailsInput) {
    startTransition(async () => {
      const res = await upsertStudentDetailsAdminAction(studentId, values);
      if (!res.ok) {
        methods.setError("root", { message: res.error });
        return;
      }
      methods.reset(values);
    });
  }

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
      {!studentDetails ? (
        <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Não havia registro de surf/saúde. Ao salvar, será criado um registro com os valores abaixo.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" {...methods.register("surfs_already")} disabled={pending} className="size-4" />
            <span>Já surfou antes</span>
          </label>
        </div>

        <Field label="Nível" error={methods.formState.errors.surf_level?.message}>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            {...methods.register("surf_level")}
            disabled={pending}
          >
            {SURF_LEVELS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Anos surfando" error={methods.formState.errors.surf_time_years?.message}>
          <Input type="number" min={0} max={80} step={1} {...methods.register("surf_time_years")} disabled={pending} />
        </Field>

        <Field label="Outros esportes (separe por vírgula)" className="sm:col-span-2">
          <Input {...methods.register("other_sports_raw")} disabled={pending} placeholder="Corrida, yoga…" />
        </Field>

        <Field label="Condições de saúde" className="sm:col-span-2" error={methods.formState.errors.health_conditions?.message}>
          <Textarea rows={2} {...methods.register("health_conditions")} disabled={pending} />
        </Field>
        <Field label="Cirurgias" className="sm:col-span-2" error={methods.formState.errors.surgeries?.message}>
          <Textarea rows={2} {...methods.register("surgeries")} disabled={pending} />
        </Field>
        <Field label="Ciclo menstrual" error={methods.formState.errors.menstrual_cycle?.message}>
          <Input {...methods.register("menstrual_cycle")} disabled={pending} />
        </Field>

        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" {...methods.register("equipment_has")} disabled={pending} className="size-4" />
            <span>Tem equipamento próprio</span>
          </label>
        </div>

        <Field label="Modelo do equipamento" className="sm:col-span-2">
          <Input {...methods.register("equipment_model")} disabled={pending} />
        </Field>

        <Field label="Meta no surf" className="sm:col-span-2" error={methods.formState.errors.surf_goal?.message}>
          <Textarea rows={2} {...methods.register("surf_goal")} disabled={pending} />
        </Field>

        <Field label="Frequência semanal" error={methods.formState.errors.weekly_frequency?.message}>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            {...methods.register("weekly_frequency")}
            disabled={pending}
          >
            {FREQUENCIES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Sugestões" className="sm:col-span-2">
          <Textarea rows={2} {...methods.register("suggestions")} disabled={pending} />
        </Field>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Dias preferidos para aulas</p>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((d) => {
            const on = preferredDays.includes(d.id);
            return (
              <label
                key={d.id}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                  on ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/40 text-muted-foreground"
                }`}
              >
                <input
                  type="checkbox"
                  className="size-3.5"
                  checked={on}
                  disabled={pending}
                  onChange={() => toggleDay(d.id)}
                />
                {d.label}
              </label>
            );
          })}
        </div>
        {methods.formState.errors.preferred_days?.message ? (
          <p className="mt-1 text-xs text-destructive">{methods.formState.errors.preferred_days.message}</p>
        ) : null}
      </div>

      {methods.formState.errors.root?.message ? (
        <p className="text-sm text-destructive" role="alert">
          {methods.formState.errors.root.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Salvando…" : "Salvar surf e saúde"}
      </Button>
    </form>
  );
}

function mapRowToForm(row: StudentDetailsRow | null): AdminStudentDetailsInput {
  if (!row) {
    return {
      surfs_already: false,
      surf_level: "beginner",
      surf_time_years: 0,
      other_sports_raw: "",
      health_conditions: "",
      surgeries: "",
      menstrual_cycle: "",
      equipment_has: false,
      equipment_model: "",
      surf_goal: "A definir",
      preferred_days: ["sat"],
      weekly_frequency: "1x",
      suggestions: "",
    };
  }

  return {
    surfs_already: row.surfs_already,
    surf_level: row.surf_level,
    surf_time_years: Number(row.surf_time_years),
    other_sports_raw: row.other_sports.join(", "),
    health_conditions: row.health_conditions,
    surgeries: row.surgeries,
    menstrual_cycle: row.menstrual_cycle ?? "",
    equipment_has: row.equipment_has,
    equipment_model: row.equipment_model,
    surf_goal: row.surf_goal,
    preferred_days: row.preferred_days as AdminStudentDetailsInput["preferred_days"],
    weekly_frequency: row.weekly_frequency,
    suggestions: row.suggestions,
  };
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
