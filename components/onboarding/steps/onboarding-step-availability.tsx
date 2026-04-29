import { FREQUENCIES, WEEKDAYS } from "@/components/onboarding/onboarding-constants";
import { FieldError } from "@/components/onboarding/field-error";
import type { OnboardingStepFieldsProps } from "@/components/onboarding/onboarding-step-types";

import { cn } from "@/lib/utils";

type Props = Pick<OnboardingStepFieldsProps, "form" | "patch" | "fieldErrors">;

export function OnboardingStepAvailability({ form, patch, fieldErrors }: Props) {
  return (
    <section className="flex flex-col gap-4" aria-labelledby="step4-title">
      <h2 id="step4-title" className="sr-only">
        Disponibilidade
      </h2>
      <fieldset>
        <legend className="text-sm font-medium text-foreground">
          Melhores dias para aula *
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {WEEKDAYS.map((d) => {
            const days = (form.preferred_days as string[]) ?? [];
            const on = days.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-accent"
                )}
                onClick={() => {
                  const next = on ? days.filter((x) => x !== d.id) : [...days, d.id];
                  patch({ preferred_days: next });
                }}
              >
                {d.label}
              </button>
            );
          })}
        </div>
        <FieldError message={fieldErrors.preferred_days} />
      </fieldset>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="weekly_frequency">
          Frequência semanal desejada *
        </label>
        <select
          id="weekly_frequency"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={String(form.weekly_frequency ?? "1x")}
          onChange={(e) =>
            patch({
              weekly_frequency: e.target.value as "1x" | "2x" | "3x" | "weekend",
            })
          }
        >
          {FREQUENCIES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="suggestions">
          Sugestões e observações
        </label>
        <textarea
          id="suggestions"
          rows={3}
          className="flex min-h-[72px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={String(form.suggestions ?? "")}
          onChange={(e) => patch({ suggestions: e.target.value })}
        />
      </div>
    </section>
  );
}
