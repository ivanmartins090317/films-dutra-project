import Link from "next/link";

interface AdminStudentFinanceSectionProps {
  studentId: string;
}

export function AdminStudentFinanceSection({ studentId }: AdminStudentFinanceSectionProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Financeiro</h2>
        <Link
          href={`/admin/financeiro?student=${encodeURIComponent(studentId)}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Abrir lançamentos deste aluno →
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">
        Mensalidades, pacotes e cobranças avulsas no módulo dedicado.
      </p>
    </section>
  );
}
