import { z } from "zod";

import { parseSkillsNoted } from "@/lib/validations/lesson";

const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use uma data válida (AAAA-MM-DD).");

export const adminEvolutionFormSchema = z.object({
  student_id: z.string().uuid("Selecione um aluno."),
  entry_date: dateStr,
  content: z
    .string()
    .trim()
    .min(1, "Descreva a evolução.")
    .max(20000, "Texto muito longo."),
  skills_input: z.string().max(4000),
  lesson_id: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      if (typeof val !== "string") return val;
      const t = val.trim();
      return t.length > 0 ? t : undefined;
    },
    z.string().uuid().optional()
  ),
});

export type AdminEvolutionFormInput = z.infer<typeof adminEvolutionFormSchema>;

export function parseEvolutionSkills(raw: string): string[] {
  return parseSkillsNoted(raw);
}
