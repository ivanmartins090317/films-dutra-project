import Link from "next/link";

import { FieldError } from "@/components/onboarding/field-error";
import type { OnboardingStepFieldsProps } from "@/components/onboarding/onboarding-step-types";

import { Input } from "@/components/ui/input";

type Props = Pick<OnboardingStepFieldsProps, "form" | "patch" | "fieldErrors"> & {
  summaryLines: string[];
  submitError: string | null;
};

export function OnboardingStepConfirm({
  form,
  patch,
  fieldErrors,
  summaryLines,
  submitError,
}: Props) {
  return (
    <section className="flex flex-col gap-4" aria-labelledby="step5-title">
      <h2 id="step5-title" className="sr-only">
        Confirmação
      </h2>
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Resumo</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          {summaryLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="password">
          Crie sua senha para acessar o app *
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={String(form.password ?? "")}
          onChange={(e) => patch({ password: e.target.value })}
        />
        <FieldError message={fieldErrors.password} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="password_confirm">
          Confirmar senha *
        </label>
        <Input
          id="password_confirm"
          type="password"
          autoComplete="new-password"
          value={String(form.password_confirm ?? "")}
          onChange={(e) => patch({ password_confirm: e.target.value })}
        />
        <FieldError message={fieldErrors.password_confirm} />
      </div>
      <div className="flex items-start gap-3">
        <input
          id="lgpd_accepted"
          type="checkbox"
          className="mt-1 size-4 shrink-0 rounded border-input"
          checked={Boolean(form.lgpd_accepted)}
          onChange={(e) => patch({ lgpd_accepted: e.target.checked })}
          aria-invalid={fieldErrors.lgpd_accepted ? true : undefined}
          aria-describedby={fieldErrors.lgpd_accepted ? "lgpd_accepted-error" : undefined}
        />
        <label htmlFor="lgpd_accepted" className="cursor-pointer text-sm leading-snug">
          Li e aceito a{" "}
          <Link
            className="text-primary underline-offset-4 hover:underline"
            href="/privacidade"
            rel="noopener noreferrer"
            target="_blank"
          >
            política de privacidade
          </Link>{" "}
          e o tratamento dos meus dados (LGPD). *
        </label>
      </div>
      <FieldError id="lgpd_accepted-error" message={fieldErrors.lgpd_accepted} />
      {submitError ? (
        <p className="text-sm text-destructive" role="alert">
          {submitError}
        </p>
      ) : null}
    </section>
  );
}
