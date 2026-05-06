"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { MonthlyReceivedDatum } from "@/lib/admin/financial-dashboard-stats";
import type { FinancialDashboardSummary } from "@/lib/admin/financial-dashboard-stats";
import type { ActiveStudentOption } from "@/lib/admin/lessons-queries";
import {
  deriveFinancialStatus,
  financialStatusLabelPt,
  financialTypeLabelPt,
} from "@/lib/admin/financial-status";
import type { FinancialEntryRow } from "@/lib/admin/financial-queries";
import { cn } from "@/lib/utils";
import type { PublicEnums } from "@/types/database";

import { FinancialFormDialog } from "@/components/admin/financial-form-dialog";
import { FinancialMonthlyChart } from "@/components/admin/financial-monthly-chart";
import { Button } from "@/components/ui/button";

function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDatePt(isoDate: string): string {
  try {
    return format(new Date(`${isoDate}T12:00:00`), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return isoDate;
  }
}

function effectiveDisplayStatus(row: FinancialEntryRow, todayKey: string): PublicEnums["financial_status"] {
  if (row.paid_at && row.paid_at.trim() !== "") {
    return "paid";
  }
  return deriveFinancialStatus(row.due_date, null, todayKey);
}

function statusBadgeClass(status: PublicEnums["financial_status"]): string {
  if (status === "paid") {
    return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200";
  }
  if (status === "overdue") {
    return "bg-destructive/15 text-destructive";
  }
  return "bg-amber-500/15 text-amber-900 dark:text-amber-100";
}

function monthQueryLink(
  year: number,
  month: number,
  studentId: string | null,
  delta: number
): string {
  let y = year;
  let m = month + delta;
  if (m < 1) {
    m = 12;
    y -= 1;
  } else if (m > 12) {
    m = 1;
    y += 1;
  }
  const q = new URLSearchParams();
  q.set("year", String(y));
  q.set("month", String(m));
  if (studentId) {
    q.set("student", studentId);
  }
  return `/admin/financeiro?${q.toString()}`;
}

interface AdminFinanceiroClientProps {
  refYear: number;
  refMonth: number;
  todayKey: string;
  defaultDueDate: string;
  initialStudentId: string | null;
  students: ActiveStudentOption[];
  entries: FinancialEntryRow[];
  summary: FinancialDashboardSummary;
  chartData: MonthlyReceivedDatum[];
}

export function AdminFinanceiroClient({
  refYear,
  refMonth,
  todayKey,
  defaultDueDate,
  initialStudentId,
  students,
  entries,
  summary,
  chartData,
}: AdminFinanceiroClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<FinancialEntryRow | null>(null);

  const selectedId = initialStudentId;
  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedId) ?? null,
    [students, selectedId]
  );

  const monthLabel = useMemo(() => {
    try {
      return format(new Date(refYear, refMonth - 1, 1), "MMMM yyyy", { locale: ptBR });
    } catch {
      return `${refMonth}/${refYear}`;
    }
  }, [refYear, refMonth]);

  function onStudentChange(nextId: string) {
    const q = new URLSearchParams();
    q.set("year", String(refYear));
    q.set("month", String(refMonth));
    if (nextId) {
      q.set("student", nextId);
    }
    router.push(`/admin/financeiro?${q.toString()}`);
  }

  function openCreate() {
    setDialogMode("create");
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(row: FinancialEntryRow) {
    setDialogMode("edit");
    setEditing(row);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={monthQueryLink(refYear, refMonth, selectedId, -1)} aria-label="Mês anterior">
              ←
            </Link>
          </Button>
          <span className="min-w-[10rem] text-center text-sm font-medium capitalize text-foreground">
            {monthLabel}
          </span>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={monthQueryLink(refYear, refMonth, selectedId, 1)} aria-label="Próximo mês">
              →
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2 sm:max-w-md">
            <label htmlFor="fin-student" className="text-sm font-medium text-foreground">
              Aluno
            </label>
            <select
              id="fin-student"
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
              value={selectedId ?? ""}
              onChange={(e) => onStudentChange(e.target.value)}
            >
              <option value="">Selecione…</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name?.trim() || s.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" disabled={!selectedId} onClick={openCreate}>
            Novo lançamento
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article
          className={cn(
            "rounded-2xl border border-border bg-card p-4 shadow-[6px_6px_14px_rgb(220,210,200),-4px_-4px_12px_rgb(255,252,248)] md:p-5",
            "dark:shadow-none"
          )}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Receita no mês
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
            {formatBRL(summary.monthRevenue)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Pagamentos com data registrada neste mês (Brasília).
          </p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Inadimplência
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-destructive">
            {formatBRL(summary.overdueAmount)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {summary.overdueCount} lançamento{summary.overdueCount === 1 ? "" : "s"} em atraso
            (calculados por vencimento).
          </p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            A receber (em aberto)
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
            {formatBRL(summary.pendingAmount)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Vencimento ainda não ultrapassado.</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total recebido (histórico)
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
            {formatBRL(summary.totalReceivedAllTime)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Soma de todos os lançamentos pagos.</p>
        </article>
      </div>

      <section
        className={cn(
          "space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6",
          "bg-[#F0E8DE]/40 dark:bg-card"
        )}
      >
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Recebimentos por mês</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Últimos 12 meses até {monthLabel} — barras em Recharts.
          </p>
        </div>
        <FinancialMonthlyChart data={chartData} />
      </section>

      {!selectedId ? (
        <p className="text-sm text-muted-foreground">
          Escolha um aluno para listar e editar lançamentos em seu nome.
        </p>
      ) : null}

      {selectedId ? (
        <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold tracking-tight">
            Lançamentos — {selectedStudent?.full_name?.trim() || "Aluno"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Ordenados por vencimento (mais recentes primeiro). Status considera hoje em fuso da
            escola.
          </p>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum lançamento para este aluno.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2 font-medium">Vencimento</th>
                    <th className="px-4 py-2 font-medium">Tipo</th>
                    <th className="px-4 py-2 font-medium text-right">Valor</th>
                    <th className="px-4 py-2 font-medium">Situação</th>
                    <th className="px-4 py-2 font-medium">Pago em</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((row) => {
                    const st = effectiveDisplayStatus(row, todayKey);
                    return (
                      <tr key={row.id} className="border-b border-border last:border-b-0">
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className="text-left font-medium text-primary underline-offset-4 hover:underline"
                            onClick={() => openEdit(row)}
                          >
                            {formatDatePt(row.due_date)}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {financialTypeLabelPt(row.type)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium">
                          {formatBRL(row.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                              statusBadgeClass(st)
                            )}
                          >
                            {financialStatusLabelPt(st)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.paid_at ? formatDatePt(row.paid_at) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      <FinancialFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        mode={dialogMode}
        entry={editing}
        studentId={selectedId ?? ""}
        defaultDueDate={defaultDueDate}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
