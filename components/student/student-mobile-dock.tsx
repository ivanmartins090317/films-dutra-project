"use client";

import { DashboardMobileDock } from "@/components/ui/dashboard-mobile-dock";
import { STUDENT_NAV_ITEMS } from "@/lib/nav/student-nav-items";

export function StudentMobileDock() {
  return (
    <DashboardMobileDock
      items={STUDENT_NAV_ITEMS}
      rootHref="/student"
      mode="student"
      sheetTitle="Portal"
      ariaLabel="Navegação da área do aluno"
    />
  );
}
