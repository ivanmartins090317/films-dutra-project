import Link from "next/link";

import { StudentListAvatar } from "@/components/admin/student-list-avatar";
import { StudentsPagination } from "@/components/admin/students-pagination";
import { fetchAdminStudentsList } from "@/lib/admin/students-list-query";
import {
  parseStudentsListSearchParams,
  STUDENTS_PER_PAGE_OPTIONS,
  type ParsedStudentsListParams,
} from "@/lib/admin/students-list-params";
import { requireAdminSession } from "@/lib/admin/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
            Busca por nome, filtro por status, ordenação e paginação. Avatar quando houver URL em{" "}
            <span className="font-medium">avatar_url</span>.
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
            {result.students.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/admin/students/${s.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent/30"
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
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      s.is_active
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground line-through decoration-muted-foreground/60"
                    }`}
                  >
                    {s.is_active ? "Ativo" : "Inativo"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <StudentsPagination params={listParams} totalCount={result.totalCount} />
        </>
      )}
    </div>
  );
}
