import { FieldError } from "@/components/onboarding/field-error";
import type { OnboardingStepFieldsProps } from "@/components/onboarding/onboarding-step-types";

type Props = Pick<OnboardingStepFieldsProps, "form" | "patch" | "fieldErrors">;

export function OnboardingStepHealth({ form, patch, fieldErrors }: Props) {
  return (
    <section className="flex flex-col gap-4" aria-labelledby="step3-title">
      <h2 id="step3-title" className="sr-only">
        Saúde
      </h2>
      <FieldError message={fieldErrors._step} />
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="health_conditions">
          Possui alguma doença ou condição de saúde?
        </label>
        <textarea
          id="health_conditions"
          rows={3}
          className="flex min-h-[72px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={String(form.health_conditions ?? "")}
          onChange={(e) => patch({ health_conditions: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="surgeries">
          Já realizou cirurgias? Qual e quando?
        </label>
        <textarea
          id="surgeries"
          rows={3}
          className="flex min-h-[72px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={String(form.surgeries ?? "")}
          onChange={(e) => patch({ surgeries: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="menstrual_cycle">
          Ciclo menstrual{" "}
          <span className="font-normal text-muted-foreground">
            (opcional — contexto para alunas)
          </span>
        </label>
        <textarea
          id="menstrual_cycle"
          rows={2}
          title="Opcional. Ajuda o instrutor a planejar sessões com segurança."
          placeholder="Opcional"
          className="flex min-h-[56px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={String(form.menstrual_cycle ?? "")}
          onChange={(e) => patch({ menstrual_cycle: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Opcional. Informação tratada com discrição, conforme LGPD.
        </p>
      </div>
    </section>
  );
}
