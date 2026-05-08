import type { ReactNode } from "react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { StudentMobileDock } from "@/components/student/student-mobile-dock";
import { StudentSidebar } from "@/components/student/student-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { fallbackSchoolDisplayName, fetchSchoolSettings } from "@/lib/school-settings";
import { requireStudentSession } from "@/lib/student/session";

export default async function StudentLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { profile, supabase } = await requireStudentSession();
  const schoolRow = await fetchSchoolSettings(supabase);
  const schoolLabel = fallbackSchoolDisplayName(schoolRow);

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-background">
      <header className="sticky top-0 z-10 shrink-0 flex items-center justify-between gap-3 border-b border-border bg-background/95 py-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:gap-4 md:px-6">
        <div className="min-w-0 flex-1">
          <Link
            className="block truncate text-sm font-semibold tracking-tight md:hidden"
            href="/student"
            title={schoolLabel}
          >
            {schoolLabel}
          </Link>
          <Link
            className="hidden truncate text-sm font-semibold tracking-tight md:inline-block md:max-w-none"
            href="/student"
            title={`${schoolLabel} — Área do aluno`}
          >
            {schoolLabel} — Área do aluno
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <span className="hidden max-w-[10rem] truncate text-xs text-muted-foreground sm:inline md:max-w-xs">
            {profile.full_name?.trim() || profile.id.slice(0, 8)}
          </span>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>
      {/* Grid no desktop: as duas colunas compartilham a mesma altura de linha (sidebar cheio até o fim da página). */}
      <div className="flex grow flex-col md:grid md:min-h-0 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-0">
        <div className="max-[768px]:hidden md:flex md:h-full md:min-h-0 md:flex-col">
          <StudentSidebar />
        </div>
        <main className="min-w-0 flex-1 py-4 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] max-[768px]:pb-24 md:px-6 md:py-6">
          {children}
        </main>
      </div>
      <StudentMobileDock />
    </div>
  );
}
