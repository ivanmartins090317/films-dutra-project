import Link from "next/link";

import { AdminEvolutionClient } from "@/components/admin/admin-evolution-client";
import {
  fetchEvolutionEntriesForStudent,
  fetchLessonsForEvolutionSelect,
} from "@/lib/admin/evolution-queries";
import { fetchActiveStudentsForSelect } from "@/lib/admin/lessons-queries";
import { requireAdminSession } from "@/lib/admin/session";
import { utcInstantToSchoolDateKey } from "@/lib/school-timezone";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface EvolutionPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function AdminEvolutionPage({ searchParams }: EvolutionPageProps) {
  const { supabase } = await requireAdminSession();
  const students = await fetchActiveStudentsForSelect(supabase);
  const activeIds = new Set(students.map((s) => s.id));

  const studentRaw = searchParams.student;
  const studentParam = typeof studentRaw === "string" ? studentRaw : undefined;
  const studentId =
    studentParam && UUID_RE.test(studentParam) && activeIds.has(studentParam)
      ? studentParam
      : students[0]?.id ?? null;

  const defaultEntryDate = utcInstantToSchoolDateKey(new Date().toISOString());

  const [entries, lessonOptions] =
    studentId != null
      ? await Promise.all([
          fetchEvolutionEntriesForStudent(supabase, studentId),
          fetchLessonsForEvolutionSelect(supabase, studentId),
        ])
      : [[], []];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Painel
        </Link>
        <div className="mt-4 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Evolução</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Registro textual da evolução por aluno, com tags de habilidade e vínculo opcional a uma
            aula. Gráfico de barras quando houver tags nas entradas.
          </p>
        </div>
      </div>

      <AdminEvolutionClient
        initialStudentId={studentId}
        students={students}
        entries={entries}
        lessonOptions={lessonOptions}
        defaultEntryDate={defaultEntryDate}
      />
    </div>
  );
}
