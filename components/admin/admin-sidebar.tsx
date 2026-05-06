"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarBlank,
  ChartLineUp,
  CurrencyCircleDollar,
  House,
  Student,
} from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Início", icon: House },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarBlank },
  { href: "/admin/evolution", label: "Evolução", icon: ChartLineUp },
  { href: "/admin/financeiro", label: "Financeiro", icon: CurrencyCircleDollar },
  { href: "/admin/students", label: "Alunos", icon: Student },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col gap-1 border-r border-border bg-card/80 px-3 py-4 backdrop-blur-sm md:w-56 md:min-h-[calc(100vh-4rem)] md:shrink-0">
      <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Menu
      </p>
      <nav className="flex flex-col gap-0.5" aria-label="Administração">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="size-5 shrink-0" weight={active ? "fill" : "regular"} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <p className="mt-auto hidden px-2 pt-6 text-[11px] leading-snug text-muted-foreground md:block">
        Surf trips e configurações — próximas fases do plano.
      </p>
    </aside>
  );
}
