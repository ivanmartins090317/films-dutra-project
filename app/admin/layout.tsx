import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/database";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = data as ProfileRow | null;

  if (!profile?.is_active) {
    await supabase.auth.signOut();
    redirect("/login?error=inactive");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <Link className="text-sm font-semibold tracking-tight" href="/admin">
          Films Dutra — Admin
        </Link>
        <LogoutButton />
      </header>
      <div className="p-6">{children}</div>
    </div>
  );
}
