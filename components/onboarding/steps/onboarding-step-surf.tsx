"use client";

import { useState } from "react";

import { SURF_LEVELS } from "@/components/onboarding/onboarding-constants";
import { FieldError } from "@/components/onboarding/field-error";
import type { OnboardingStepFieldsProps } from "@/components/onboarding/onboarding-step-types";

import { Input } from "@/components/ui/input";

type Props = Pick<OnboardingStepFieldsProps, "form" | "patch" | "fieldErrors">;

export function OnboardingStepSurf({ form, patch, fieldErrors }: Props) {
  const initialYears =
    form.surf_time_years != null && !Number.isNaN(form.surf_time_years as number)
      ? String(form.surf_time_years)
      : "";

  const [rawYears, setRawYears] = useState<string>(initialYears);

  const yearsInvalid = rawYears !== "" && Number.isNaN(Number(rawYears));

  function handleYearsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setRawYears(raw);
    const n = Number(raw);
    patch({
      surf_time_years: raw === "" ? undefined : Number.isNaN(n) ? undefined : n,
    });
  }

  return (
    <section className="flex flex-col gap-4" aria-labelledby="step2-title">
      <h2 id="step2-title" className="sr-only">
        Surf e esporte
      </h2>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 size-4 accent-primary"
          checked={Boolean(form.surfs_already)}
          onChange={(e) => patch({ surfs_already: e.target.checked })}
        />
        <span className="text-sm leading-snug text-foreground">Já pratica surf?</span>
      </label>
      {form.surfs_already ? (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="surf_level">
              Nível *
            </label>
            <select
              id="surf_level"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={String(form.surf_level ?? "")}
              onChange={(e) =>
                patch({
                  surf_level: e.target.value as "beginner" | "intermediate" | "advanced",
                })
              }
            >
              <option value="">Selecione</option>
              {SURF_LEVELS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.surf_level} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="surf_time_years">
              Há quantos anos surfa? *
            </label>
            <Input
              id="surf_time_years"
              inputMode="numeric"
              placeholder="Ex: 3"
              value={rawYears}
              onChange={handleYearsChange}
              aria-invalid={yearsInvalid}
              aria-describedby={yearsInvalid ? "surf_time_years_error" : undefined}
            />
            {yearsInvalid ? (
              <p id="surf_time_years_error" className="text-xs text-destructive" role="alert">
                Digite apenas números (ex: 3 ou 10)
              </p>
            ) : (
              <FieldError message={fieldErrors.surf_time_years} />
            )}
          </div>
        </>
      ) : null}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="other_sports_raw">
          Pratica outro esporte? Quais?
        </label>
        <textarea
          id="other_sports_raw"
          rows={2}
          placeholder="Separe por vírgula (opcional)"
          className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={String(form.other_sports_raw ?? "")}
          onChange={(e) => patch({ other_sports_raw: e.target.value })}
        />
      </div>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 size-4 accent-primary"
          checked={Boolean(form.equipment_has)}
          onChange={(e) => patch({ equipment_has: e.target.checked })}
        />
        <span className="text-sm leading-snug text-foreground">Possui equipamento (prancha)?</span>
      </label>
      {form.equipment_has ? (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="equipment_model">
            Modelo da prancha *
          </label>
          <Input
            id="equipment_model"
            value={String(form.equipment_model ?? "")}
            onChange={(e) => patch({ equipment_model: e.target.value })}
          />
          <FieldError message={fieldErrors.equipment_model} />
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="surf_goal">
          Objetivo no surf *
        </label>
        <textarea
          id="surf_goal"
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={String(form.surf_goal ?? "")}
          onChange={(e) => patch({ surf_goal: e.target.value })}
        />
        <FieldError message={fieldErrors.surf_goal} />
      </div>
    </section>
  );
}
