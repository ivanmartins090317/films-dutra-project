"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useTransition } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";

import { updateStudentProfileAdminAction } from "@/lib/admin/student-admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  adminStudentProfileSchema,
  type AdminStudentProfileInput,
} from "@/lib/validations/admin-student";
import type { ProfileRow } from "@/types/database";

interface AdminStudentProfileEditFormProps {
  profile: ProfileRow;
}

export function AdminStudentProfileEditForm({ profile }: AdminStudentProfileEditFormProps) {
  const [pending, startTransition] = useTransition();

  const methods = useForm<AdminStudentProfileInput>({
    resolver: zodResolver(adminStudentProfileSchema) as Resolver<AdminStudentProfileInput>,
    defaultValues: {
      full_name: profile.full_name || "",
      phone: profile.phone ?? "",
      birth_date: profile.birth_date ? profile.birth_date.slice(0, 10) : "",
      birth_year: profile.birth_year ?? undefined,
      address: profile.address ?? "",
      sexual_orientation: profile.sexual_orientation ?? "",
      height_cm: profile.height_cm ?? undefined,
      weight_kg: profile.weight_kg ?? undefined,
      avatar_url: profile.avatar_url ?? "",
      is_active: profile.is_active,
    },
  });

  function onSubmit(values: AdminStudentProfileInput) {
    startTransition(async () => {
      const res = await updateStudentProfileAdminAction(profile.id, values);
      if (!res.ok) {
        methods.setError("root", { message: res.error });
        return;
      }
      methods.reset(values);
    });
  }

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nome completo" error={methods.formState.errors.full_name?.message}>
          <Input {...methods.register("full_name")} disabled={pending} autoComplete="name" />
        </Field>
        <Field label="Telefone" error={methods.formState.errors.phone?.message}>
          <Input {...methods.register("phone")} disabled={pending} autoComplete="tel" />
        </Field>
        <Field label="Data de nascimento" error={methods.formState.errors.birth_date?.message}>
          <Input type="date" {...methods.register("birth_date")} disabled={pending} />
        </Field>
        <Field label="Ano de nascimento" error={methods.formState.errors.birth_year?.message}>
          <Input
            type="number"
            min={1930}
            max={new Date().getFullYear()}
            {...methods.register("birth_year")}
            disabled={pending}
          />
        </Field>
        <Field label="Endereço" className="sm:col-span-2" error={methods.formState.errors.address?.message}>
          <Textarea rows={2} {...methods.register("address")} disabled={pending} />
        </Field>
        <Field label="Orientação sexual" error={methods.formState.errors.sexual_orientation?.message}>
          <Input {...methods.register("sexual_orientation")} disabled={pending} />
        </Field>
        <Field label="Altura (cm)" error={methods.formState.errors.height_cm?.message}>
          <Input type="number" min={1} step={1} {...methods.register("height_cm")} disabled={pending} />
        </Field>
        <Field label="Peso (kg)" error={methods.formState.errors.weight_kg?.message}>
          <Input
            type="number"
            min={1}
            step={0.1}
            {...methods.register("weight_kg")}
            disabled={pending}
          />
        </Field>
        <Field
          label="URL do avatar (Storage ou URL pública)"
          className="sm:col-span-2"
          error={methods.formState.errors.avatar_url?.message}
        >
          <Input
            type="url"
            placeholder="https://"
            {...methods.register("avatar_url")}
            disabled={pending}
          />
        </Field>
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" {...methods.register("is_active")} disabled={pending} className="size-4" />
            <span>Conta ativa (aluno pode acessar o app)</span>
          </label>
        </div>
      </div>

      {methods.formState.errors.root?.message ? (
        <p className="text-sm text-destructive" role="alert">
          {methods.formState.errors.root.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Salvando…" : "Salvar dados pessoais"}
      </Button>
    </form>
  );
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
