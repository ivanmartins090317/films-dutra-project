import Link from "next/link";

import { AdminDashboardCards } from "@/components/admin/admin-dashboard-cards";
import { OnboardingInvitePanel } from "@/components/admin/onboarding-invite-panel";
import { fetchAdminDashboardCounts } from "@/lib/admin/dashboard-queries";
import { requireAdminSession } from "@/lib/admin/session";

export default async function AdminHomePage() {
  const { supabase } = await requireAdminSession();
  const counts = await fetchAdminDashboardCounts(supabase);

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Painel administrativo</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Resumo rápido da escola e atalhos. Os números refletem os dados atuais no Supabase (aulas
          &quot;hoje&quot; em UTC).
        </p>
      </div>

      <AdminDashboardCards counts={counts} />

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Primeiro acesso</h2>
          <Link href="/admin/students" className="text-sm font-medium text-primary hover:underline">
            Ir para lista de alunos →
          </Link>
        </div>
        <OnboardingInvitePanel />
      </section>
    </div>
  );
}
