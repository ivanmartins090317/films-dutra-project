import { Input } from "@/components/ui/input";

import type { OnboardingStepFieldsProps } from "@/components/onboarding/onboarding-step-types";

import { FieldError } from "@/components/onboarding/field-error";

export function OnboardingStepPersonal({
  form,
  patch,
  fieldErrors,
  useBirthYearOnly,
  setUseBirthYearOnly,
}: OnboardingStepFieldsProps) {
  return (
    <section className="flex flex-col gap-4" aria-labelledby="step1-title">
      <h2 id="step1-title" className="sr-only">
        Dados pessoais
      </h2>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="full_name">
          Nome completo *
        </label>
        <Input
          id="full_name"
          autoComplete="name"
          value={String(form.full_name ?? "")}
          onChange={(e) => patch({ full_name: e.target.value })}
        />
        <FieldError message={fieldErrors.full_name} />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="birth_mode"
          type="checkbox"
          checked={useBirthYearOnly}
          className="size-4 rounded border-input"
          onChange={(e) => {
            setUseBirthYearOnly(e.target.checked);
            patch({ birth_date: "", birth_year: undefined });
          }}
        />
        <label htmlFor="birth_mode" className="text-sm text-muted-foreground">
          Informar só o ano de nascimento
        </label>
      </div>
      {useBirthYearOnly ? (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="birth_year">
            Ano de nascimento *
          </label>
          <Input
            id="birth_year"
            inputMode="numeric"
            placeholder="Ex.: 1998"
            value={form.birth_year === undefined ? "" : String(form.birth_year)}
            onChange={(e) =>
              patch({
                birth_year: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
          />
          <FieldError message={fieldErrors.birth_year ?? fieldErrors.birth_date} />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="birth_date">
            Data de nascimento *
          </label>
          <Input
            id="birth_date"
            type="date"
            value={String(form.birth_date ?? "")}
            onChange={(e) => patch({ birth_date: e.target.value })}
          />
          <FieldError message={fieldErrors.birth_date} />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="address">
          Endereço / bairro / cidade *
        </label>
        <Input
          id="address"
          value={String(form.address ?? "")}
          onChange={(e) => patch({ address: e.target.value })}
        />
        <FieldError message={fieldErrors.address} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="phone">
          Telefone / WhatsApp *
        </label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          value={String(form.phone ?? "")}
          onChange={(e) => patch({ phone: e.target.value })}
        />
        <FieldError message={fieldErrors.phone} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="email">
          E-mail *
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={String(form.email ?? "")}
          onChange={(e) => patch({ email: e.target.value })}
        />
        <FieldError message={fieldErrors.email} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="height_cm">
            Altura (cm)
          </label>
          <Input
            id="height_cm"
            inputMode="numeric"
            placeholder="Opcional"
            value={form.height_cm === undefined ? "" : String(form.height_cm)}
            onChange={(e) =>
              patch({
                height_cm: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
          />
          <FieldError message={fieldErrors.height_cm} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="weight_kg">
            Peso (kg)
          </label>
          <Input
            id="weight_kg"
            inputMode="decimal"
            placeholder="Opcional"
            value={form.weight_kg === undefined ? "" : String(form.weight_kg)}
            onChange={(e) =>
              patch({
                weight_kg: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
          />
          <FieldError message={fieldErrors.weight_kg} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="sexual_orientation">
          Orientação sexual{" "}
          <span className="font-normal text-muted-foreground">(opcional)</span>
        </label>
        <Input
          id="sexual_orientation"
          title="Campo opcional. Usamos apenas para pluralizar comunicações quando aplicável."
          value={String(form.sexual_orientation ?? "")}
          onChange={(e) => patch({ sexual_orientation: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Opcional. Ajuda a adaptar comunicações quando relevante.
        </p>
      </div>
    </section>
  );
}
