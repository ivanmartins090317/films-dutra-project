import { AdminConfiguracoesClient } from "@/components/admin/admin-configuracoes-client";
import { fetchSchoolSettings } from "@/lib/school-settings";
import { requireAdminSession } from "@/lib/admin/session";

export default async function AdminConfiguracoesPage() {
  const { supabase } = await requireAdminSession();

  const row = await fetchSchoolSettings(supabase);

  if (!row) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-amber-500/35 bg-amber-500/5 p-6 text-sm text-amber-950 dark:text-amber-100">
        Não há registro em <strong>school_settings</strong>. Rode a migração do Supabase (“Fase 10”:{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          supabase/migrations/20260507100000_school_settings.sql
        </code>
        ) e gere os tipos de novo quando necessário.
      </div>
    );
  }

  return <AdminConfiguracoesClient initial={row} />;
}
