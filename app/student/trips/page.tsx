import Link from "next/link";

import { StudentTripsPanel } from "@/components/student/student-trips-panel";
import { fetchStudentTripsOpen } from "@/lib/student/student-portal-queries";
import { requireStudentSession } from "@/lib/student/session";

export default async function StudentTripsPage() {
  const { profile, supabase } = await requireStudentSession();
  const trips = await fetchStudentTripsOpen(supabase, profile.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/student"
          className="text-xs font-semibold uppercase tracking-wide text-primary underline-offset-4 hover:underline"
        >
          ← Início
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Surf trips</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Trips a partir da data de hoje no fuso da escola (<strong>São Paulo</strong>). Demonstre interesse ou confirme
          sua vaga — o limite atualizado aparece nos cartões abaixo.
        </p>
      </div>

      <StudentTripsPanel rows={trips} />
    </div>
  );
}
