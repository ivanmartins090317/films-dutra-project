import type { ReactNode } from "react";
import Link from "next/link";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireAdminSession } from "@/lib/admin/session";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { profile } = await requireAdminSession();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Link className="text-sm font-semibold tracking-tight text-foreground md:hidden" href="/admin">
          Films Dutra
        </Link>
        <Link
          className="hidden text-sm font-semibold tracking-tight text-foreground md:inline"
          href="/admin"
        >
          Films Dutra — Admin
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          <span className="hidden max-w-[12rem] truncate text-xs text-muted-foreground sm:inline md:max-w-xs">
            {profile.full_name || profile.id.slice(0, 8)}
          </span>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>
      <div className="flex flex-col md:flex-row md:items-stretch">
        <AdminSidebar />
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
