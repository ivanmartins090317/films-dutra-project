import Link from "next/link";

import { AdminSurfTripsClient } from "@/components/admin/admin-surf-trips-client";
import { fetchActiveStudentsForSelect } from "@/lib/admin/lessons-queries";
import {
  fetchSurfTripsWithRegistrationsForYear,
  schoolCalendarYearNow,
} from "@/lib/admin/trip-queries";
import { requireAdminSession } from "@/lib/admin/session";

interface SurfTripsPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function parseYear(raw: string | undefined): number {
  const nowY = schoolCalendarYearNow();
  if (!raw) return nowY;
  const y = Number.parseInt(raw, 10);
  if (!Number.isFinite(y) || y < 2000 || y > 2100) return nowY;
  return y;
}

export default async function AdminSurfTripsPage({ searchParams }: SurfTripsPageProps) {
  const { supabase } = await requireAdminSession();

  const yr = typeof searchParams.year === "string" ? searchParams.year : undefined;
  const refYear = parseYear(yr);

  const [trips, students] = await Promise.all([
    fetchSurfTripsWithRegistrationsForYear(supabase, refYear),
    fetchActiveStudentsForSelect(supabase),
  ]);

  const defaultNewTripDate = `${refYear}-06-15`;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Painel
        </Link>
        <div className="mt-4 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Surf trips</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Cadastro de viagens, vagas e inscrições (interessado, confirmado ou cancelado). Vagas
            ocupadas seguem os confirmados; não é possível ultrapassar o total de vagas.
          </p>
        </div>
      </div>

      <AdminSurfTripsClient
        refYear={refYear}
        trips={trips}
        students={students}
        defaultNewTripDate={defaultNewTripDate}
      />
    </div>
  );
}
