"use client";

import Link from "next/link";
import { CalendarBlank, CurrencyCircleDollar, Student, SuitcaseRolling } from "@phosphor-icons/react";

import type { AdminDashboardCounts } from "@/lib/admin/dashboard-queries";

interface AdminDashboardCardsProps {
  counts: AdminDashboardCounts;
}

export function AdminDashboardCards({ counts }: AdminDashboardCardsProps) {
  const items = [
    {
      label: "Alunos ativos",
      value: counts.activeStudents,
      icon: Student,
      href: "/admin/students" as const,
      hint: "Ver lista",
    },
    {
      label: "Aulas hoje (Brasília)",
      value: counts.lessonsToday,
      icon: CalendarBlank,
      href: "/admin/agenda",
      hint: "Abrir agenda",
    },
    {
      label: "Pagamentos vencidos",
      value: counts.financialOverdue,
      icon: CurrencyCircleDollar,
      href: "/admin#pagamentos-atraso",
      hint: counts.financialOverdue > 0 ? "Ver lista abaixo" : "Sem itens na lista",
    },
    {
      label: "Trips com vagas",
      value: counts.tripsOpen,
      icon: SuitcaseRolling,
      href: "/admin/surf-trips",
      hint: "Gerenciar trips",
    },
  ] as const;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, icon: Icon, href, hint }) => {
        const inner = (
          <>
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <Icon className="size-6 shrink-0 text-primary/90" weight="regular" aria-hidden />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
            <span className="mt-auto pt-3 text-xs text-muted-foreground">{hint}</span>
          </>
        );
        const cardClass =
          "flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-colors";

        return (
          <li key={label}>
            {href ? (
              <Link href={href} className={`${cardClass} hover:bg-accent/40`}>
                {inner}
              </Link>
            ) : (
              <div className={cardClass}>{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
