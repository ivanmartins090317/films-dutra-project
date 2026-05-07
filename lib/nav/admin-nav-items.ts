import {
  CalendarBlank,
  ChartLineUp,
  CurrencyCircleDollar,
  GearSix,
  House,
  Student,
  SuitcaseRolling,
} from "@phosphor-icons/react";

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Início", icon: House },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarBlank },
  { href: "/admin/evolution", label: "Evolução", icon: ChartLineUp },
  { href: "/admin/financeiro", label: "Financeiro", icon: CurrencyCircleDollar },
  { href: "/admin/surf-trips", label: "Surf trips", icon: SuitcaseRolling },
  { href: "/admin/students", label: "Alunos", icon: Student },
  { href: "/admin/configuracoes", label: "Configurações", icon: GearSix },
] as const;
