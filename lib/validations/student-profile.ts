import { z } from "zod";

import { adminStudentProfileSchema } from "@/lib/validations/admin-student";

/** Campos de `profiles` que o próprio aluno pode editar (sem `role` / `is_active`). */
export const studentSelfProfileSchema = adminStudentProfileSchema.omit({ is_active: true });

export type StudentSelfProfileInput = z.infer<typeof studentSelfProfileSchema>;
