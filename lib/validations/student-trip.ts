import { z } from "zod";

export const studentTripRegistrationUpsertSchema = z.object({
  tripId: z.string().uuid("Trip inválida."),
  status: z.enum(["interested", "confirmed", "cancelled"]),
});

export type StudentTripRegistrationUpsertInput = z.infer<typeof studentTripRegistrationUpsertSchema>;
