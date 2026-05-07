import type { ReactNode } from "react";
import Link from "next/link";

import { AdminMobileDock } from "@/components/admin/admin-mobile-dock";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireAdminSession } from "@/lib/admin/session";
import { fallbackSchoolDisplayName, fetchSchoolSettings } from "@/lib/school-settings";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { profile, supabase } = await requireAdminSession();
  const schoolRow = await fetchSchoolSettings(supabase);
  const schoolLabel = fallbackSchoolDisplayName(schoolRow);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 py-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:gap-4 md:px-6">
        <div className="min-w-0 flex-1">
          <Link
            className="block truncate text-sm font-semibold tracking-tight text-foreground md:hidden"
            href="/admin"
            title={schoolLabel}
          >
            {schoolLabel}
          </Link>
          <Link
            className="hidden truncate text-sm font-semibold tracking-tight text-foreground md:inline-block md:max-w-none"
            href="/admin"
            title={`${schoolLabel} — Admin`}
          >
            {schoolLabel} — Admin
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <span className="hidden max-w-[12rem] truncate text-xs text-muted-foreground sm:inline md:max-w-xs">
            {profile.full_name || profile.id.slice(0, 8)}
          </span>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>
      <div className="flex flex-col md:flex-row md:items-stretch">
        <div className="max-[768px]:hidden md:flex md:min-h-0 md:w-56 md:shrink-0 md:flex-col">
          <AdminSidebar />
        </div>
        <main className="min-w-0 flex-1 py-4 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] max-[768px]:pb-24 md:px-6 md:py-6">
          {children}
        </main>
      </div>
      <AdminMobileDock />
    </div>
  );
}
