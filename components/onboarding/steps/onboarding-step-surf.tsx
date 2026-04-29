import { SURF_LEVELS } from "@/components/onboarding/onboarding-constants";
import { FieldError } from "@/components/onboarding/field-error";
import type { OnboardingStepFieldsProps } from "@/components/onboarding/onboarding-step-types";

import { Input } from "@/components/ui/input";

type Props = Pick<OnboardingStepFieldsProps, "form" | "patch" | "fieldErrors">;

export function OnboardingStepSurf({ form, patch, fieldErrors }: Props) {
  return (
    <section className="flex flex-col gap-4" aria-labelledby="step2-title">
      <h2 id="step2-title" className="sr-only">
        Surf e esporte
      </h2>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 size-4 rounded border-input"
          checked={Boolean(form.surfs_already)}
          onChange={(e) => patch({ surfs_already: e.target.checked })}
        />
        <span className="text-sm leading-snug">Já pratica surf?</span>
      </label>
      {form.surfs_already ? (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="surf_level">
              Nível *
            </label>
            <select
              id="surf_level"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
            <label className="text-sm font-medium" htmlFor="surf_time_years">
              Há quantos anos surfa? *
            </label>
            <Input
              id="surf_time_years"
              inputMode="decimal"
              value={form.surf_time_years === undefined ? "" : String(form.surf_time_years)}
              onChange={(e) =>
                patch({
                  surf_time_years: e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
            />
            <FieldError message={fieldErrors.surf_time_years} />
          </div>
        </>
      ) : null}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="other_sports_raw">
          Pratica outro esporte? Quais?
        </label>
        <textarea
          id="other_sports_raw"
          rows={2}
          placeholder="Separe por vírgula (opcional)"
          className="flex min-h-[72px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={String(form.other_sports_raw ?? "")}
          onChange={(e) => patch({ other_sports_raw: e.target.value })}
        />
      </div>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 size-4 rounded border-input"
          checked={Boolean(form.equipment_has)}
          onChange={(e) => patch({ equipment_has: e.target.checked })}
        />
        <span className="text-sm leading-snug">Possui equipamento (prancha)?</span>
      </label>
      {form.equipment_has ? (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="equipment_model">
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
        <label className="text-sm font-medium" htmlFor="surf_goal">
          Objetivo no surf *
        </label>
        <textarea
          id="surf_goal"
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={String(form.surf_goal ?? "")}
          onChange={(e) => patch({ surf_goal: e.target.value })}
        />
        <FieldError message={fieldErrors.surf_goal} />
      </div>
    </section>
  );
}
