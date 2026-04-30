import { z } from "zod";

import { surfLevelSchema, weeklyFrequencySchema } from "@/lib/validations/onboarding";

const weekdayEnum = z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);

function optionalTrimmed(max?: number) {
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : String(v).trim()),
    max ? z.string().max(max).optional() : z.string().optional()
  );
}

function optionalIsoDate() {
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a data no formato AAAA-MM-DD.").optional()
  );
}

export const adminStudentProfileSchema = z.object({
  full_name: z.string().trim().min(1, "Informe o nome."),
  phone: optionalTrimmed(40),
  birth_date: optionalIsoDate(),
  birth_year: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().min(1930).max(new Date().getFullYear()).optional()
  ),
  address: optionalTrimmed(500),
  sexual_orientation: optionalTrimmed(120),
  height_cm: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().positive().max(280).optional()
  ),
  weight_kg: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().positive().max(500).optional()
  ),
  avatar_url: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.union([z.string().url("URL inválida."), z.null()])
  ),
  is_active: z.boolean(),
});

export type AdminStudentProfileInput = z.infer<typeof adminStudentProfileSchema>;

export const adminStudentDetailsSchema = z.object({
  surfs_already: z.boolean(),
  surf_level: surfLevelSchema,
  surf_time_years: z.coerce.number().min(0).max(80),
  other_sports_raw: z.string().optional(),
  health_conditions: z.string(),
  surgeries: z.string(),
  menstrual_cycle: optionalTrimmed(200),
  equipment_has: z.boolean(),
  equipment_model: z.string(),
  surf_goal: z.string().trim().min(1, "Informe a meta no surf."),
  preferred_days: z.array(weekdayEnum).min(1, "Selecione pelo menos um dia."),
  weekly_frequency: weeklyFrequencySchema,
  suggestions: z.string(),
});

export type AdminStudentDetailsInput = z.infer<typeof adminStudentDetailsSchema>;
