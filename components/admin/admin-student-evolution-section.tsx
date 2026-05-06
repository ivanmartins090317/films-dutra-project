import Link from "next/link";

interface AdminStudentEvolutionSectionProps {
  studentId: string;
}

export function AdminStudentEvolutionSection({ studentId }: AdminStudentEvolutionSectionProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Evolução</h2>
        <Link
          href={`/admin/evolution?student=${encodeURIComponent(studentId)}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Abrir evolução deste aluno →
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">
        Timeline de evolução, tags de habilidade e gráfico no módulo dedicado.
      </p>
    </section>
  );
}
