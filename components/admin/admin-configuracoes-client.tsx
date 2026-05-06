"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { updateSchoolSettingsAdminAction } from "@/lib/admin/school-settings-admin-actions";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";
import {
  schoolSettingsFormSchema,
  type SchoolSettingsFormInput,
} from "@/lib/validations/school-settings";

import { Button } from "@/components/ui/button";

type SchoolSettingsRow = Database["public"]["Tables"]["school_settings"]["Row"];

interface AdminConfiguracoesClientProps {
  initial: SchoolSettingsRow;
}

export function AdminConfiguracoesClient({ initial }: AdminConfiguracoesClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const methods = useForm<SchoolSettingsFormInput>({
    resolver: zodResolver(schoolSettingsFormSchema),
    defaultValues: {
      school_name: initial.school_name,
      contact_email: initial.contact_email ?? "",
      contact_phone: initial.contact_phone ?? "",
      logo_url: initial.logo_url ?? "",
      student_portal_enabled: initial.student_portal_enabled,
    },
  });

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = methods;

  function onSubmit(raw: SchoolSettingsFormInput) {
    setBanner(null);
    startTransition(() => {
      void (async () => {
        const res = await updateSchoolSettingsAdminAction(raw);
        if (res.ok) {
          setBanner({ type: "ok", text: "Configurações salvas." });
          router.refresh();
          return;
        }
        setBanner({ type: "err", text: res.error });
      })();
    });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          Configurações da escola
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Dados de contato e identidade exibidos no login quando aplicável. O tema claro/escuro continua
          global pela barra superior do admin em todas as telas.
        </p>
      </header>

      {banner?.type === "ok" ? (
        <p
          className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-primary"
          role="status"
        >
          {banner.text}
        </p>
      ) : null}
      {banner?.type === "err" ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {banner.text}
        </p>
      ) : null}

      <FormProvider {...methods}>
        <form
          className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(26,26,26,0.08)]"
          noValidate
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        >
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="school_name">
                Nome da escola
              </label>
              <input
                autoComplete="organization"
                className="mt-1.5 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={pending}
                id="school_name"
                type="text"
                {...register("school_name")}
              />
              {errors.school_name ? (
                <p className="mt-1 text-xs text-destructive">{errors.school_name.message}</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="contact_email">
                  E-mail de contato
                </label>
                <input
                  autoComplete="email"
                  className="mt-1.5 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={pending}
                  id="contact_email"
                  type="email"
                  {...register("contact_email")}
                />
                {errors.contact_email ? (
                  <p className="mt-1 text-xs text-destructive">{errors.contact_email.message}</p>
                ) : null}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="contact_phone">
                  Telefone
                </label>
                <input
                  autoComplete="tel"
                  className="mt-1.5 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={pending}
                  id="contact_phone"
                  type="text"
                  {...register("contact_phone")}
                />
                {errors.contact_phone ? (
                  <p className="mt-1 text-xs text-destructive">{errors.contact_phone.message}</p>
                ) : null}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="logo_url">
                URL do logo (opcional)
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                Se preenchido, substitui a marca Dutra na tela de login. Use HTTPS quando possível.
              </p>
              <input
                className="mt-2 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={pending}
                id="logo_url"
                placeholder="https://…"
                type="url"
                {...register("logo_url")}
              />
              {errors.logo_url ? (
                <p className="mt-1 text-xs text-destructive">{errors.logo_url.message}</p>
              ) : null}
            </div>

            <fieldset className="rounded-xl border border-border bg-muted/20 p-4">
              <legend className="sr-only">Acesso dos alunos</legend>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Portal dos alunos</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Quando desligado, nenhum aluno acessa a área <code>/student</code>.
                  </p>
                  <Link
                    className="mt-3 inline-flex text-xs font-medium text-primary underline-offset-4 hover:underline"
                    href="/admin/students"
                  >
                    Conta inativa por aluno → módulo Alunos
                  </Link>
                </div>
                <Controller
                  control={control}
                  name="student_portal_enabled"
                  render={({ field }) => (
                    <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{field.value ? "Ativo" : "Desligado"}</span>
                      <button
                        aria-checked={field.value}
                        className={cn(
                          "relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          field.value ? "bg-primary" : "bg-muted"
                        )}
                        disabled={pending}
                        role="switch"
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "absolute top-0.5 inline-block size-6 rounded-full bg-background shadow transition-transform",
                            field.value ? "left-6" : "left-0.5"
                          )}
                        />
                      </button>
                    </label>
                  )}
                />
              </div>
            </fieldset>
          </div>

          <div className="mt-8 flex justify-end">
            <Button disabled={pending} type="submit">
              {pending ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
