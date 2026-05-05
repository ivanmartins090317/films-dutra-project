import { z } from "zod";

const lessonStatusSchema = z.enum(["scheduled", "completed", "cancelled", "missed"]);

const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use uma data válida (AAAA-MM-DD).");

const timeStr = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Horário no formato HH:mm.");

export const adminLessonFormSchema = z
  .object({
    student_id: z.string().uuid("Selecione um aluno."),
    scheduled_date: dateStr,
    scheduled_time: timeStr,
    duration_min: z.coerce.number().int().min(15, "Mínimo 15 minutos.").max(480, "Máximo 480 minutos."),
    status: lessonStatusSchema,
    cancel_reason: z.string().max(2000),
    notes: z.string().max(8000),
    skills_noted: z.string().max(4000),
  })
  .superRefine((data, ctx) => {
    if (data.status === "cancelled" && !data.cancel_reason.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o motivo do cancelamento.",
        path: ["cancel_reason"],
      });
    }
  });

export type AdminLessonFormInput = z.infer<typeof adminLessonFormSchema>;

export function parseSkillsNoted(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 40);
}
