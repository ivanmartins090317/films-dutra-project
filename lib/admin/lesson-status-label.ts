import type { PublicEnums } from "@/types/database";

const LESSON_STATUS_LABEL: Record<PublicEnums["lesson_status"], string> = {
  scheduled: "Agendada",
  completed: "Realizada",
  cancelled: "Cancelada",
  missed: "Falta",
};

export function lessonStatusLabelPt(status: PublicEnums["lesson_status"]): string {
  return LESSON_STATUS_LABEL[status];
}
