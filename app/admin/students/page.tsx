import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { StudentListAvatar } from "@/components/admin/student-list-avatar";
import { StudentsPagination } from "@/components/admin/students-pagination";
import { lessonStatusLabelPt } from "@/lib/admin/lesson-status-label";
import { fetchAdminStudentsList } from "@/lib/admin/students-list-query";
import type { StudentPaymentRollup } from "@/lib/admin/student-financial-rollup";
import type { PublicEnums } from "@/types/database";
import {
  parseStudentsListSearchParams,
  STUDENTS_PER_PAGE_OPTIONS,
  type ParsedStudentsListParams,
} from "@/lib/admin/students-list-params";
import { requireAdminSession } from "@/lib/admin/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function paymentSummaryDisplay(summary: StudentPaymentRollup): { label: string; className: string } {
  switch (summary) {
    case "overdue":
      return { label: "Pag. vencido", className: "bg-destructive/15 text-destructive" };
    case "pending":
      return {
        label: "Pag. pendente",
        className: "bg-amber-500/15 text-amber-900 dark:text-amber-100",
      };
    case "clear":
      return { label: "Pagamentos em dia", className: "bg-primary/15 text-primary" };
    default:
      return { label: "Sem lançamentos", className: "bg-muted text-muted-foreground" };
  }
}

function formatLastLesson(
  iso: string | null,
  status: PublicEnums["lesson_status"] | null
): string {
  if (!iso || !status) return "Última aula: —";
  try {
    const d = format(new Date(iso), "dd/MM/yyyy", { locale: ptBR });
    return `Última aula: ${d} · ${lessonStatusLabelPt(status)}`;
  } catch {
    return "Última aula: —";
  }
}

interface StudentsPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function AdminStudentsPage({ searchParams }: StudentsPageProps) {
  const { supabase: client } = await requireAdminSession();
  const parsed = parseStudentsListSearchParams(searchParams);
  const result = await fetchAdminStudentsList(client, parsed);

  const listParams: ParsedStudentsListParams = { ...parsed, page: result.page };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <span aria-hidden className="select-none">
              ←{" "}
            </span>
            Painel
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Alunos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Busca por nome, filtro por status, ordenação e paginação.             À direita: última aula com horário já passado no calendário e resumo financeiro (vencido /
            pendente / em dia), quando há lançamentos.
          </p>
        </div>
      </div>

      <form
        method="get"
        action="/admin/students"
        className="flex flex-col gap-4 rounded-xl border border-border bg-card/50 p-4 shadow-sm"
      >
        <input type="hidden" name="page" value="1" />
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-0 flex-1 space-y-1.5">
            <label htmlFor="q" className="text-xs font-medium text-muted-foreground">
              Nome
            </label>
            <Input
              id="q"
              name="q"
              defaultValue={listParams.q}
              placeholder="Buscar por nome..."
              aria-label="Buscar aluno por nome"
            />
          </div>
          <div className="w-full space-y-1.5 sm:w-44">
            <label htmlFor="status" className="text-xs font-medium text-muted-foreground">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={listParams.status}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
          <div className="w-full space-y-1.5 sm:w-52">
            <label htmlFor="sort" className="text-xs font-medium text-muted-foreground">
              Ordenar por
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={listParams.sort}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="name_asc">Nome (A–Z)</option>
              <option value="name_desc">Nome (Z–A)</option>
              <option value="created_desc">Cadastro (mais recente)</option>
            </select>
          </div>
          <div className="w-full space-y-1.5 sm:w-36">
            <label htmlFor="per_page" className="text-xs font-medium text-muted-foreground">
              Por página
            </label>
            <select
              id="per_page"
              name="per_page"
              defaultValue={String(listParams.perPage)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {STUDENTS_PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={String(n)}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="secondary" className="w-full sm:w-auto">
            Aplicar
          </Button>
        </div>
      </form>

      {result.error ? (
        <p className="text-sm text-destructive" role="alert">
          Não foi possível carregar os alunos.
        </p>
      ) : result.students.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
          {listParams.q || listParams.status !== "all"
            ? "Nenhum aluno encontrado com estes filtros."
            : "Nenhum aluno cadastrado ainda."}
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {result.students.map((s) => {
              const paymentUi = paymentSummaryDisplay(s.paymentSummary);
              return (
              <li key={s.id}>
                <Link
                  href={`/admin/students/${s.id}`}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent/30 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <StudentListAvatar name={s.full_name} avatarUrl={s.avatar_url} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{s.full_name || "Sem nome"}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.phone || "Telefone não informado"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    <p className="max-w-full text-xs text-muted-foreground sm:text-right">
                      {formatLastLesson(s.lastLessonScheduledAt, s.lastLessonStatus)}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium",
                          paymentUi.className
                        )}
                      >
                        {paymentUi.label}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          s.is_active
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground line-through decoration-muted-foreground/60"
                        }`}
                      >
                        {s.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
            })}
          </ul>
          <StudentsPagination params={listParams} totalCount={result.totalCount} />
        </>
      )}
    </div>
  );
}
