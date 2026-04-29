import { z } from "zod";

import type { Database, PublicEnums } from "@/types/database";

const weekdayEnum = z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);

export const surfLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);

export const weeklyFrequencySchema = z.enum(["1x", "2x", "3x", "weekend"]);

function optionalPositiveInt(max: number) {
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().positive().max(max).optional()
  );
}

function optionalPositiveWeight() {
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().positive().max(500).optional()
  );
}

export const onboardingStep1Schema = z
  .object({
    full_name: z.string().trim().min(2, "Informe o nome completo."),
    birth_date: z.string().optional(),
    birth_year: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.number().int().optional()
    ),
    address: z.string().trim().min(3, "Informe endereço / bairro / cidade."),
    phone: z.string().trim().min(8, "Informe telefone ou WhatsApp."),
    email: z.string().trim().email("E-mail inválido."),
    height_cm: optionalPositiveInt(280),
    weight_kg: optionalPositiveWeight(),
    sexual_orientation: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    const hasDate = Boolean(data.birth_date && data.birth_date.length > 0);
    const hasYear =
      data.birth_year !== undefined && !Number.isNaN(data.birth_year) && data.birth_year > 0;
    if (!hasDate && !hasYear) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe a data de nascimento ou o ano.",
        path: ["birth_date"],
      });
    }
    if (hasYear && data.birth_year !== undefined) {
      const y = new Date().getFullYear();
      if (data.birth_year < 1930 || data.birth_year > y) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ano de nascimento inválido.",
          path: ["birth_year"],
        });
      }
    }
  });

export const onboardingStep2Schema = z
  .object({
    surfs_already: z.boolean(),
    surf_level: surfLevelSchema.optional(),
    surf_time_years: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.number().min(0).max(80).optional()
    ),
    other_sports_raw: z.string().trim().optional(),
    equipment_has: z.boolean(),
    equipment_model: z.string().trim().optional(),
    surf_goal: z.string().trim().min(1, "Descreva seu objetivo no surf."),
  })
  .superRefine((data, ctx) => {
    if (data.surfs_already) {
      if (!data.surf_level) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selecione o nível.",
          path: ["surf_level"],
        });
      }
      if (data.surf_time_years === undefined || Number.isNaN(data.surf_time_years)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe há quantos anos surfa.",
          path: ["surf_time_years"],
        });
      }
    }
    if (data.equipment_has && !(data.equipment_model && data.equipment_model.length > 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o modelo da prancha.",
        path: ["equipment_model"],
      });
    }
  });

export const onboardingStep3Schema = z.object({
  health_conditions: z.string().trim().optional(),
  surgeries: z.string().trim().optional(),
  menstrual_cycle: z.string().trim().optional(),
});

export const onboardingStep4Schema = z.object({
  preferred_days: z.array(weekdayEnum).min(1, "Selecione pelo menos um dia."),
  weekly_frequency: weeklyFrequencySchema,
  suggestions: z.string().trim().optional(),
});

export const onboardingStep5Schema = z
  .object({
    lgpd_accepted: z.boolean().refine((v) => v === true, {
      message: "É necessário aceitar a política de privacidade e LGPD.",
    }),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    password_confirm: z.string().min(1, "Confirme a senha."),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.password_confirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As senhas não coincidem.",
        path: ["password_confirm"],
      });
    }
  });

export type OnboardingStep1 = z.infer<typeof onboardingStep1Schema>;
export type OnboardingStep2 = z.infer<typeof onboardingStep2Schema>;
export type OnboardingStep3 = z.infer<typeof onboardingStep3Schema>;
export type OnboardingStep4 = z.infer<typeof onboardingStep4Schema>;
export type OnboardingStep5 = z.infer<typeof onboardingStep5Schema>;

export type OnboardingCompleteData = OnboardingStep1 &
  OnboardingStep2 &
  OnboardingStep3 &
  OnboardingStep4 &
  OnboardingStep5;

function firstZodMessage(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Dados inválidos.";
}

/** Valida o payload completo enviado ao servidor (flat JSON). */
export function parseOnboardingPayload(raw: unknown):
  | { success: true; data: OnboardingCompleteData }
  | { success: false; error: string } {
  if (!raw || typeof raw !== "object") {
    return { success: false, error: "Payload inválido." };
  }
  const o = raw as Record<string, unknown>;

  const pack1 = {
    full_name: o.full_name,
    birth_date: o.birth_date,
    birth_year: o.birth_year,
    address: o.address,
    phone: o.phone,
    email: o.email,
    height_cm: o.height_cm,
    weight_kg: o.weight_kg,
    sexual_orientation: o.sexual_orientation,
  };
  const r1 = onboardingStep1Schema.safeParse(pack1);
  if (!r1.success) return { success: false, error: firstZodMessage(r1.error) };

  const pack2 = {
    surfs_already: o.surfs_already,
    surf_level: o.surf_level,
    surf_time_years: o.surf_time_years,
    other_sports_raw: o.other_sports_raw,
    equipment_has: o.equipment_has,
    equipment_model: o.equipment_model,
    surf_goal: o.surf_goal,
  };
  const r2 = onboardingStep2Schema.safeParse(pack2);
  if (!r2.success) return { success: false, error: firstZodMessage(r2.error) };

  const pack3 = {
    health_conditions: o.health_conditions,
    surgeries: o.surgeries,
    menstrual_cycle: o.menstrual_cycle,
  };
  const r3 = onboardingStep3Schema.safeParse(pack3);
  if (!r3.success) return { success: false, error: firstZodMessage(r3.error) };

  const pack4 = {
    preferred_days: o.preferred_days,
    weekly_frequency: o.weekly_frequency,
    suggestions: o.suggestions,
  };
  const r4 = onboardingStep4Schema.safeParse(pack4);
  if (!r4.success) return { success: false, error: firstZodMessage(r4.error) };

  const pack5 = {
    lgpd_accepted: o.lgpd_accepted,
    password: o.password,
    password_confirm: o.password_confirm,
  };
  const r5 = onboardingStep5Schema.safeParse(pack5);
  if (!r5.success) return { success: false, error: firstZodMessage(r5.error) };

  return {
    success: true,
    data: {
      ...r1.data,
      ...r2.data,
      ...r3.data,
      ...r4.data,
      ...r5.data,
    },
  };
}

export function parseOtherSports(raw: string | undefined): string[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function mapProfileBirthFields(data: OnboardingStep1): {
  birth_date: string | null;
  birth_year: number | null;
} {
  const hasDate = Boolean(data.birth_date && data.birth_date.length > 0);
  if (hasDate && data.birth_date) {
    return { birth_date: data.birth_date, birth_year: null };
  }
  if (data.birth_year !== undefined && !Number.isNaN(data.birth_year) && data.birth_year > 0) {
    return {
      birth_date: `${data.birth_year}-01-01`,
      birth_year: data.birth_year,
    };
  }
  return { birth_date: null, birth_year: null };
}

export function mapStudentDetailsInsert(
  studentId: string,
  step2: OnboardingStep2,
  step3: OnboardingStep3,
  step4: OnboardingStep4,
  otherSports: string[]
): Database["public"]["Tables"]["student_details"]["Insert"] {
  return {
    student_id: studentId,
    surfs_already: step2.surfs_already,
    surf_level: (step2.surf_level ?? "beginner") as PublicEnums["surf_level"],
    surf_time_years: step2.surfs_already ? (step2.surf_time_years ?? 0) : 0,
    other_sports: otherSports,
    health_conditions: step3.health_conditions ?? "",
    surgeries: step3.surgeries ?? "",
    menstrual_cycle: step3.menstrual_cycle?.length ? step3.menstrual_cycle : null,
    equipment_has: step2.equipment_has,
    equipment_model: step2.equipment_model ?? "",
    surf_goal: step2.surf_goal,
    preferred_days: step4.preferred_days,
    weekly_frequency: step4.weekly_frequency,
    suggestions: step4.suggestions ?? "",
  };
}
