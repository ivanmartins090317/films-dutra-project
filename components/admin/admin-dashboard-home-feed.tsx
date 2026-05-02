import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { AdminDashboardFeed } from "@/lib/admin/dashboard-feed-queries";

function formatLessonWhen(iso: string): string {
  try {
    return format(new Date(iso), "EEE d MMM · HH:mm", { locale: ptBR });
  } catch {
    return iso;
  }
}

function formatDueShort(iso: string): string {
  try {
    return format(new Date(iso), "d MMM yyyy", { locale: ptBR });
  } catch {
    return iso;
  }
}

function formatCurrencyBrl(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

interface AdminDashboardHomeFeedProps {
  feed: AdminDashboardFeed;
}

export function AdminDashboardHomeFeed({ feed }: AdminDashboardHomeFeedProps) {
  const { upcomingLessons, overdueFinancials, birthdaysSoon } = feed;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <section aria-labelledby="proximas-aulas-heading" className="space-y-3 lg:col-span-2">
        <h2 id="proximas-aulas-heading" className="text-lg font-semibold tracking-tight">
          Próximas aulas
        </h2>
        <p className="text-xs text-muted-foreground">
          Agendamentos futuros (exceto canceladas). Horários em UTC até haver fuso da escola na Fase 6.
        </p>
        {upcomingLessons.length === 0 ? (
          <p className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
            Nenhuma aula futura cadastrada. Quando a agenda estiver em uso, os próximos horários aparecem
            aqui.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-card shadow-sm">
            {upcomingLessons.map((row) => (
              <li key={row.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium leading-snug">
                    <Link
                      href={`/admin/students/${row.student_id}`}
                      className="text-primary hover:underline"
                    >
                      {row.student_name?.trim() || "Aluno"}
                    </Link>
                  </p>
                  <p className="mt-0.5 text-xs capitalize text-muted-foreground">{row.status}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <time dateTime={row.scheduled_at}>{formatLessonWhen(row.scheduled_at)}</time>
                  <p className="text-xs">{row.duration_min} min</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="space-y-8">
        <section aria-labelledby="pagamentos-atraso-heading" className="space-y-3" id="pagamentos-atraso">
          <h2 id="pagamentos-atraso-heading" className="text-lg font-semibold tracking-tight">
            Pagamentos em atraso
          </h2>
          {overdueFinancials.length === 0 ? (
            <p className="rounded-xl border border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
              Nenhum lançamento com status vencido.
            </p>
          ) : (
            <ul className="space-y-2 rounded-xl border border-destructive/25 bg-destructive/5 p-3 shadow-sm">
              {overdueFinancials.map((row) => (
                <li key={row.id} className="text-sm">
                  <Link
                    href={`/admin/students/${row.student_id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {row.student_name?.trim() || "Aluno"}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrencyBrl(row.amount)} · venceu em {formatDueShort(row.due_date)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="aniversariantes-heading" className="space-y-3">
          <h2 id="aniversariantes-heading" className="text-lg font-semibold tracking-tight">
            Aniversariantes (próximos 7 dias)
          </h2>
          <p className="text-xs text-muted-foreground">
            Alunos ativos com data de nascimento, aniversário nos próximos 7 dias (UTC).
          </p>
          {birthdaysSoon.length === 0 ? (
            <p className="rounded-xl border border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
              Nenhum aniversário nesta janela ou datas de nascimento ainda não preenchidas.
            </p>
          ) : (
            <ul className="space-y-2 rounded-xl border border-border bg-card p-3 shadow-sm">
              {birthdaysSoon.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-2 text-sm">
                  <Link
                    href={`/admin/students/${row.id}`}
                    className="min-w-0 truncate font-medium text-primary hover:underline"
                  >
                    {row.full_name?.trim() || "Aluno"}
                  </Link>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {row.daysUntil === 0 ? "Hoje" : `em ${row.daysUntil}d`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export function AdminDashboardShortcuts() {
  const items = [
    { href: "/admin/students", label: "Alunos", description: "Lista, busca e edição" },
    { href: "/login", label: "Login", description: "Página pública de acesso" },
  ] as const;

  return (
    <section aria-labelledby="atalhos-heading" className="space-y-3">
      <h2 id="atalhos-heading" className="text-lg font-semibold tracking-tight">
        Atalhos
      </h2>
      <ul className="flex flex-wrap gap-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex min-w-[10rem] flex-col rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm transition-colors hover:bg-accent/40"
            >
              <span className="font-medium text-foreground">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.description}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Agenda, evolução, financeiro e trips entram nas próximas fases do plano.
      </p>
    </section>
  );
}
