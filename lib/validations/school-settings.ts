import { z } from "zod";

export const schoolSettingsFormSchema = z.object({
  school_name: z.string().trim().min(1, "Informe o nome da escola.").max(200),
  contact_email: z.union([z.literal(""), z.string().trim().email("E-mail inválido.")]),
  contact_phone: z.string().trim().max(60),
  logo_url: z.union([z.literal(""), z.string().trim().url("URL do logo inválida.")]),
  student_portal_enabled: z.boolean(),
});

export type SchoolSettingsFormInput = z.infer<typeof schoolSettingsFormSchema>;
