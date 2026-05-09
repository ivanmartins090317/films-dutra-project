"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useRef, useState, useTransition } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { StudentListAvatar } from "@/components/admin/student-list-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  updateStudentProfileStudentAction,
  uploadStudentAvatarStudentAction,
} from "@/lib/student/student-profile-actions";
import {
  studentSelfProfileSchema,
  type StudentSelfProfileInput,
} from "@/lib/validations/student-profile";
import type { ProfileRow } from "@/types/database";

interface StudentProfileEditFormProps {
  profile: ProfileRow;
}

export function StudentProfileEditForm({ profile }: StudentProfileEditFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  /** Preview local (`blob:`) — ref para revogar no unmount sem stale closure. */
  const avatarBlobUrlRef = useRef<string | null>(null);
  /** Arquivo escolhido permanece aqui se o input for remontado (ex.: Strict Mode em dev). */
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [localAvatarPreviewUrl, setLocalAvatarPreviewUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploadPending, setUploadPending] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function revokeAvatarBlobPreview() {
    if (avatarBlobUrlRef.current) {
      URL.revokeObjectURL(avatarBlobUrlRef.current);
      avatarBlobUrlRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      if (avatarBlobUrlRef.current) {
        URL.revokeObjectURL(avatarBlobUrlRef.current);
        avatarBlobUrlRef.current = null;
      }
    };
  }, []);

  function handleAvatarFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    revokeAvatarBlobPreview();
    setAvatarFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      avatarBlobUrlRef.current = url;
      setLocalAvatarPreviewUrl(url);
    } else {
      setLocalAvatarPreviewUrl(null);
    }
  }

  const methods = useForm<StudentSelfProfileInput>({
    resolver: zodResolver(studentSelfProfileSchema) as Resolver<StudentSelfProfileInput>,
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
    },
  });

  const avatarUrlWatch = methods.watch("avatar_url");
  const nameWatch = methods.watch("full_name");

  const displayAvatarUrl =
    localAvatarPreviewUrl ?? (avatarUrlWatch?.trim() ? avatarUrlWatch.trim() : null);

  async function handleAvatarUpload() {
    const input = fileRef.current;
    const file = avatarFile ?? input?.files?.[0];
    if (!file) {
      setUploadError("Escolha uma imagem (JPEG, PNG ou WebP, até 2 MB).");
      return;
    }
    setUploadError(null);
    setUploadPending(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await uploadStudentAvatarStudentAction(fd);
      if (!res.ok) {
        setUploadError(res.error);
        return;
      }
      const next = methods.getValues();
      revokeAvatarBlobPreview();
      setLocalAvatarPreviewUrl(null);
      setAvatarFile(null);
      methods.reset({ ...next, avatar_url: res.publicUrl });
      if (input) input.value = "";
      router.refresh();
    } finally {
      setUploadPending(false);
    }
  }

  function onSubmit(values: StudentSelfProfileInput) {
    startTransition(async () => {
      const res = await updateStudentProfileStudentAction(values);
      if (!res.ok) {
        methods.setError("root", { message: res.error });
        return;
      }
      methods.reset(values);
      router.refresh();
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

        <div className="sm:col-span-2 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Foto do perfil
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <StudentListAvatar
              name={nameWatch?.trim() ? nameWatch.trim() : profile.full_name}
              avatarUrl={displayAvatarUrl}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="max-w-full text-sm text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground"
                disabled={pending || uploadPending}
                onChange={handleAvatarFileChange}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={pending || uploadPending}
                onClick={() => void handleAvatarUpload()}
              >
                {uploadPending ? "Enviando…" : "Enviar foto"}
              </Button>
            </div>
          </div>
          {uploadError ? (
            <p className="mt-2 text-xs text-destructive" role="alert">
              {uploadError}
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              JPEG, PNG ou WebP, até 2 MB. A foto aparece aqui e na lista de alunos na administração.
            </p>
          )}
        </div>

        <Field
          label="URL do avatar (opcional — link público)"
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
      </div>

      {methods.formState.errors.root?.message ? (
        <p className="text-sm text-destructive" role="alert">
          {methods.formState.errors.root.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Salvando…" : "Salvar alterações"}
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
