import { z } from "zod";

const dateKey = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use uma data válida (AAAA-MM-DD).");

export const adminSurfTripFormSchema = z.object({
  title: z.string().trim().min(1, "Informe o título.").max(300),
  destination: z.string().trim().min(1, "Informe o destino.").max(300),
  trip_date: dateKey,
  description: z.string().max(8000).optional().default(""),
  spots_total: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.coerce
      .number()
      .int("Vagas devem ser um número inteiro.")
      .min(0, "Vagas não podem ser negativas.")
      .max(32767, "Valor de vagas muito alto.")
  ),
  /** URL externa ou pública Supabase Storage; opcional. */
  cover_url: z.preprocess(
    (v) => (v == null || v === undefined ? "" : v),
    z.string().max(2000)
  ).transform((s) => s.trim()),
});

export type AdminSurfTripFormInput = z.infer<typeof adminSurfTripFormSchema>;

export const tripRegistrationAdminSchema = z.object({
  trip_id: z.string().uuid("Trip inválida."),
  student_id: z.string().uuid("Aluno inválido."),
  status: z.enum(["interested", "confirmed", "cancelled"]),
});

export type TripRegistrationAdminInput = z.infer<typeof tripRegistrationAdminSchema>;

export const tripRegistrationStatusUpdateSchema = z.object({
  status: z.enum(["interested", "confirmed", "cancelled"]),
});

export type TripRegistrationStatusUpdateInput = z.infer<typeof tripRegistrationStatusUpdateSchema>;
