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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Link className="text-sm font-semibold tracking-tight md:hidden" href="/student">
          {schoolLabel}
        </Link>
        <Link className="hidden text-sm font-semibold tracking-tight md:inline" href="/student">
          {schoolLabel} — Área do aluno
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          <span className="hidden max-w-[10rem] truncate text-xs text-muted-foreground sm:inline md:max-w-xs">
            {profile.full_name?.trim() || profile.id.slice(0, 8)}
          </span>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>
      <div className="flex flex-col md:flex-row md:items-stretch">
        <div className="max-[768px]:hidden w-full md:w-52 md:shrink-0">
          <StudentSidebar />
        </div>
        <main className="min-w-0 flex-1 p-4 max-[768px]:pb-24 md:p-6">{children}</main>
      </div>
      <StudentMobileDock />
    </div>
  );
}
