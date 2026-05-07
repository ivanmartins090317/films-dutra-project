"use client";

import { DashboardMobileDock } from "@/components/ui/dashboard-mobile-dock";
import { ADMIN_NAV_ITEMS } from "@/lib/nav/admin-nav-items";

export function AdminMobileDock() {
  return (
    <DashboardMobileDock
      items={ADMIN_NAV_ITEMS}
      rootHref="/admin"
      mode="admin"
      sheetTitle="Menu"
      ariaLabel="Navegação administrativa"
    />
  );
}
