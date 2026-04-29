export const STEP_TITLES = [
  "Dados pessoais",
  "Surf e esporte",
  "Saúde",
  "Disponibilidade",
  "Confirmação e termos",
] as const;

export const WEEKDAYS = [
  { id: "mon" as const, label: "Seg" },
  { id: "tue" as const, label: "Ter" },
  { id: "wed" as const, label: "Qua" },
  { id: "thu" as const, label: "Qui" },
  { id: "fri" as const, label: "Sex" },
  { id: "sat" as const, label: "Sáb" },
  { id: "sun" as const, label: "Dom" },
];

export const SURF_LEVELS: { value: "beginner" | "intermediate" | "advanced"; label: string }[] = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
];

export const FREQUENCIES: { value: "1x" | "2x" | "3x" | "weekend"; label: string }[] = [
  { value: "1x", label: "1x por semana" },
  { value: "2x", label: "2x por semana" },
  { value: "3x", label: "3x por semana" },
  { value: "weekend", label: "Fins de semana" },
];
