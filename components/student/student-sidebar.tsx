"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartLineUp, House, Person, SuitcaseRolling, Waves } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/student", label: "Início", icon: House },
  { href: "/student/perfil", label: "Perfil", icon: Person },
  { href: "/student/aulas", label: "Aulas", icon: Waves },
  { href: "/student/evolucao", label: "Evolução", icon: ChartLineUp },
  { href: "/student/trips", label: "Surf trips", icon: SuitcaseRolling },
] as const;

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col gap-1 border-border bg-card/80 px-3 py-4 backdrop-blur-sm md:w-52 md:min-h-[calc(100vh-4rem)] md:shrink-0 md:border-r">
      <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Portal
      </p>
      <nav className="flex flex-col gap-0.5" aria-label="Área do aluno">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/student" && (pathname.startsWith(`${href}/`) || pathname.startsWith(`${href}?`)));
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
    </aside>
  );
}
