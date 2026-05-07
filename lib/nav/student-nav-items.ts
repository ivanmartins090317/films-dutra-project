import { ChartLineUp, House, Person, SuitcaseRolling, Waves } from "@phosphor-icons/react";

export const STUDENT_NAV_ITEMS = [
  { href: "/student", label: "Início", icon: House },
  { href: "/student/perfil", label: "Perfil", icon: Person },
  { href: "/student/aulas", label: "Aulas", icon: Waves },
  { href: "/student/evolucao", label: "Evolução", icon: ChartLineUp },
  { href: "/student/trips", label: "Surf trips", icon: SuitcaseRolling },
] as const;
