import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProfileRow } from "@/types/database";

interface StudentsPageProps {
  searchParams: { q?: string };
}

export default async function AdminStudentsPage({ searchParams }: StudentsPageProps) {
  const { supabase: client } = await requireAdminSession();
  const q = searchParams.q?.trim() ?? "";

  let query = client
    .from("profiles")
    .select("id, full_name, phone, avatar_url, is_active, role, created_at")
    .eq("role", "student")
    .order("full_name", { ascending: true })
    .limit(100);

  if (q) {
    query = query.ilike("full_name", `%${q}%`);
  }

  const { data: rows, error } = await query;

  const students = (rows ?? []) as Pick<
    ProfileRow,
    "id" | "full_name" | "phone" | "avatar_url" | "is_active" | "role" | "created_at"
  >[];

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
            Lista limitada a 100 registros. Use a busca para filtrar por nome.
          </p>
        </div>
      </div>

      <form method="get" action="/admin/students" className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome..."
          className="flex-1"
          aria-label="Buscar aluno por nome"
        />
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          Não foi possível carregar os alunos.
        </p>
      ) : students.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
          {q ? "Nenhum aluno encontrado para esta busca." : "Nenhum aluno cadastrado ainda."}
        </p>
      ) : (
        <ul className="space-y-3">
          {students.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/students/${s.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent/30"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{s.full_name || "Sem nome"}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.phone || "Telefone não informado"}
                  </p>
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
      )}
    </div>
  );
}
