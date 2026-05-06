import { z } from "zod";

const dateKey = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use uma data válida (AAAA-MM-DD).");

export const adminFinancialFormSchema = z.object({
  student_id: z.string().uuid("Aluno inválido."),
  type: z.enum(["monthly", "package", "single"]),
  amount: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.coerce.number().positive("O valor deve ser maior que zero.")
  ),
  due_date: dateKey,
  notes: z.string().max(4000).optional().default(""),
  /** Vazio ou omitido = não pago. */
  paid_at: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.union([dateKey, z.null()]).nullable()
  ),
});

export type AdminFinancialFormInput = z.infer<typeof adminFinancialFormSchema>;
