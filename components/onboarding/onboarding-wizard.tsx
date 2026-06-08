"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";

import { completeOnboardingAction } from "@/lib/onboarding/actions";
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  onboardingStep3Schema,
  onboardingStep4Schema,
  onboardingStep5Schema,
} from "@/lib/validations/onboarding";

import { BrandLogo } from "@/components/brand/brand-logo";
import { PublicLegalFooter } from "@/components/legal/public-legal-footer";
import { Button } from "@/components/ui/button";

import { STEP_TITLES } from "@/components/onboarding/onboarding-constants";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { OnboardingStepAvailability } from "@/components/onboarding/steps/onboarding-step-availability";
import { OnboardingStepConfirm } from "@/components/onboarding/steps/onboarding-step-confirm";
import { OnboardingStepHealth } from "@/components/onboarding/steps/onboarding-step-health";
import { OnboardingStepPersonal } from "@/components/onboarding/steps/onboarding-step-personal";
import { OnboardingStepSurf } from "@/components/onboarding/steps/onboarding-step-surf";

interface OnboardingWizardProps {
  token: string;
}

export function OnboardingWizard({ token }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [useBirthYearOnly, setUseBirthYearOnly] = useState(false);

  const [form, setForm] = useState<Record<string, unknown>>({
    surfs_already: false,
    equipment_has: false,
    preferred_days: [] as string[],
    weekly_frequency: "1x",
  });

  function patch(next: Record<string, unknown>) {
    setForm((prev) => ({ ...prev, ...next }));
  }

  function clearErrors() {
    setFieldErrors({});
    setSubmitError(null);
  }

  function validateStep1() {
    const r = onboardingStep1Schema.safeParse({
      full_name: form.full_name,
      birth_date: useBirthYearOnly ? undefined : form.birth_date,
      birth_year: useBirthYearOnly ? form.birth_year : undefined,
      address: form.address,
      phone: form.phone,
      email: form.email,
      height_cm: form.height_cm,
      weight_kg: form.weight_kg,
      sexual_orientation: form.sexual_orientation,
    });
    if (!r.success) {
      const e: Record<string, string> = {};
      for (const issue of r.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string" && !e[path]) e[path] = issue.message;
      }
      setFieldErrors(e);
      return false;
    }
    setFieldErrors({});
    return true;
  }

  function validateStep2() {
    const r = onboardingStep2Schema.safeParse({
      surfs_already: form.surfs_already,
      surf_level: form.surf_level,
      surf_time_years: form.surf_time_years,
      other_sports_raw: form.other_sports_raw,
      equipment_has: form.equipment_has,
      equipment_model: form.equipment_model,
      surf_goal: form.surf_goal,
    });
    if (!r.success) {
      const e: Record<string, string> = {};
      for (const issue of r.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string" && !e[path]) e[path] = issue.message;
      }
      setFieldErrors(e);
      return false;
    }
    setFieldErrors({});
    return true;
  }

  function validateStep3() {
    const r = onboardingStep3Schema.safeParse({
      health_conditions: form.health_conditions,
      surgeries: form.surgeries,
      menstrual_cycle: form.menstrual_cycle,
    });
    if (!r.success) {
      setFieldErrors({ _step: r.error.issues[0]?.message ?? "Revise os dados." });
      return false;
    }
    setFieldErrors({});
    return true;
  }

  function validateStep4() {
    const r = onboardingStep4Schema.safeParse({
      preferred_days: form.preferred_days,
      weekly_frequency: form.weekly_frequency,
      suggestions: form.suggestions,
    });
    if (!r.success) {
      const e: Record<string, string> = {};
      for (const issue of r.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string" && !e[path]) e[path] = issue.message;
      }
      setFieldErrors(e);
      return false;
    }
    setFieldErrors({});
    return true;
  }

  function validateStep5() {
    const r = onboardingStep5Schema.safeParse({
      lgpd_accepted: form.lgpd_accepted,
      password: form.password,
      password_confirm: form.password_confirm,
    });
    if (!r.success) {
      const e: Record<string, string> = {};
      for (const issue of r.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string" && !e[path]) e[path] = issue.message;
      }
      setFieldErrors(e);
      return false;
    }
    setFieldErrors({});
    return true;
  }

  function goNext() {
    clearErrors();
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step === 4 && !validateStep4()) return;
    setStep((s) => Math.min(5, s + 1));
  }

  function goBack() {
    clearErrors();
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateStep5()) return;
    setPending(true);
    setSubmitError(null);
    const payload = {
      ...form,
      birth_date: useBirthYearOnly ? undefined : form.birth_date,
      birth_year: useBirthYearOnly ? form.birth_year : undefined,
    };
    const result = await completeOnboardingAction(token, payload);
    setPending(false);
    if (result.ok) {
      setDone(true);
    } else {
      setSubmitError(result.error);
    }
  }

  const summaryLines = useMemo(() => {
    if (step < 5) return [];
    const email = String(form.email ?? "");
    const name = String(form.full_name ?? "");
    return [
      `${name} · ${email}`,
      String(form.address ?? ""),
      `Surf: ${form.surfs_already ? "sim" : "não"} · Frequência: ${String(form.weekly_frequency ?? "")}`,
    ];
  }, [step, form]);

  if (done) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#F0E8DE] px-4 py-12">
        <BrandLogo className="h-14 w-auto" />
        <div
          className="w-full max-w-md rounded-2xl border border-[#C8A882]/40 bg-white p-8 text-center shadow-[8px_8px_24px_rgba(90,78,62,0.12),-6px_-6px_20px_rgba(255,255,255,0.85)]"
          role="status"
        >
          <h1 className="text-xl font-semibold text-foreground">Cadastro concluído</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Você já pode entrar com seu e-mail e a senha definida neste formulário.
          </p>
          <Button asChild className="mt-8 w-full">
            <Link href="/login">Ir para login</Link>
          </Button>
        </div>
      </main>
    );
  }

  const stepProps = {
    form,
    patch,
    fieldErrors,
  };

  return (
    <main className="min-h-screen bg-[#F0E8DE] px-4 py-10">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <BrandLogo className="h-12 w-auto" priority />
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Films Dutra · Cadastro de aluno
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {STEP_TITLES[step - 1]}
            </h1>
          </div>
        </div>

        <div className="rounded-2xl border border-[#C8A882]/40 bg-white p-6 shadow-[8px_8px_24px_rgba(90,78,62,0.1),-6px_-6px_18px_rgba(255,255,255,0.88)] sm:p-8">
          <OnboardingProgress currentStep={step} />

          <form
            className="mt-8 flex flex-col gap-6"
            onSubmit={step === 5 ? handleSubmit : (e) => e.preventDefault()}
          >
            {step === 1 ? (
              <OnboardingStepPersonal
                form={form}
                patch={patch}
                fieldErrors={fieldErrors}
                useBirthYearOnly={useBirthYearOnly}
                setUseBirthYearOnly={setUseBirthYearOnly}
              />
            ) : null}
            {step === 2 ? <OnboardingStepSurf {...stepProps} /> : null}
            {step === 3 ? <OnboardingStepHealth {...stepProps} /> : null}
            {step === 4 ? <OnboardingStepAvailability {...stepProps} /> : null}
            {step === 5 ? (
              <OnboardingStepConfirm
                {...stepProps}
                summaryLines={summaryLines}
                submitError={submitError}
              />
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={goBack}>
                  Voltar
                </Button>
              ) : (
                <span />
              )}
              {step < 5 ? (
                <Button type="button" onClick={goNext}>
                  Continuar
                </Button>
              ) : (
                <Button type="submit" disabled={pending}>
                  {pending ? "Enviando…" : "Concluir cadastro"}
                </Button>
              )}
            </div>
          </form>
        </div>

        <div className="flex flex-col items-center gap-3">
          <PublicLegalFooter className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground" />
          <p className="text-center text-xs text-muted-foreground">
            Dúvidas? Entre em contato com a escola Films Dutra.
          </p>
        </div>
      </div>
    </main>
  );
}
