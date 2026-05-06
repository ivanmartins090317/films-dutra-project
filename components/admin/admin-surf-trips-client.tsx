"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState, useTransition } from "react";

import type { ActiveStudentOption } from "@/lib/admin/lessons-queries";
import {
  createTripRegistrationAdminAction,
  deleteTripRegistrationAdminAction,
  updateTripRegistrationStatusAdminAction,
  uploadTripCoverAdminAction,
} from "@/lib/admin/trip-admin-actions";
import type {
  SurfTripRow,
  SurfTripWithRegistrations,
  TripRegistrationWithStudent,
} from "@/lib/admin/trip-queries";
import { cn } from "@/lib/utils";
import type { PublicEnums } from "@/types/database";

import { SurfTripFormDialog } from "@/components/admin/surf-trip-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function formatDatePt(dateKey: string): string {
  try {
    return format(new Date(`${dateKey}T12:00:00`), "EEEE, dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dateKey;
  }
}

function monthTitlePt(ym: string): string {
  try {
    const [y, m] = ym.split("-").map(Number);
    return format(new Date(y, (m ?? 1) - 1, 1), "MMMM yyyy", { locale: ptBR });
  } catch {
    return ym;
  }
}

function tripStatusLabel(status: PublicEnums["trip_registration_status"]): string {
  if (status === "confirmed") return "Confirmado";
  if (status === "cancelled") return "Cancelado";
  return "Interessado";
}

function tripStatusBadgeClass(status: PublicEnums["trip_registration_status"]): string {
  if (status === "confirmed") {
    return "bg-emerald-500/15 text-emerald-900 dark:text-emerald-100";
  }
  if (status === "cancelled") {
    return "bg-muted text-muted-foreground";
  }
  return "bg-amber-500/15 text-amber-900 dark:text-amber-100";
}

function spotsLabel(trip: SurfTripRow): string {
  const free = Math.max(0, trip.spots_total - trip.spots_taken);
  return `${trip.spots_taken} / ${trip.spots_total} vagas · ${free} livre(s)`;
}

interface AdminSurfTripsClientProps {
  refYear: number;
  trips: SurfTripWithRegistrations[];
  students: ActiveStudentOption[];
  defaultNewTripDate: string;
}

export function AdminSurfTripsClient({
  refYear,
  trips,
  students,
  defaultNewTripDate,
}: AdminSurfTripsClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingTrip, setEditingTrip] = useState<SurfTripRow | null>(null);
  const [pendingReg, startRegTransition] = useTransition();
  const [pendingUpload, startUploadTransition] = useTransition();
  const [addForTripId, setAddForTripId] = useState<string | null>(null);
  const [addStudentId, setAddStudentId] = useState("");
  const [addStatus, setAddStatus] =
    useState<PublicEnums["trip_registration_status"]>("interested");

  const byMonth = useMemo(() => {
    const map = new Map<string, SurfTripWithRegistrations[]>();
    for (const t of trips) {
      const ym = t.trip_date.slice(0, 7);
      const list = map.get(ym) ?? [];
      list.push(t);
      map.set(ym, list);
    }
    const keys = Array.from(map.keys()).sort();
    return keys.map((k) => ({ monthKey: k, trips: map.get(k) ?? [] }));
  }, [trips]);

  function yearHref(y: number): string {
    return `/admin/surf-trips?year=${y}`;
  }

  function openCreate() {
    setDialogMode("create");
    setEditingTrip(null);
    setDialogOpen(true);
  }

  function openEdit(trip: SurfTripRow) {
    setDialogMode("edit");
    setEditingTrip(trip);
    setDialogOpen(true);
  }

  function refresh() {
    router.refresh();
  }

  function availableStudentsFor(tripId: string): ActiveStudentOption[] {
    const trip = trips.find((x) => x.id === tripId);
    const taken = new Set(trip?.registrations.map((r) => r.student_id) ?? []);
    return students.filter((s) => !taken.has(s.id));
  }

  function onAddRegistration(tripId: string) {
    if (!addStudentId) return;
    startRegTransition(async () => {
      const res = await createTripRegistrationAdminAction({
        trip_id: tripId,
        student_id: addStudentId,
        status: addStatus,
      });
      if (!res.ok) {
        alert(res.error);
        return;
      }
      setAddForTripId(null);
      setAddStudentId("");
      setAddStatus("interested");
      refresh();
    });
  }

  function onStatusChange(reg: TripRegistrationWithStudent, status: PublicEnums["trip_registration_status"]) {
    startRegTransition(async () => {
      const res = await updateTripRegistrationStatusAdminAction(reg.id, { status });
      if (!res.ok) {
        alert(res.error);
        return;
      }
      refresh();
    });
  }

  function onDeleteRegistration(reg: TripRegistrationWithStudent) {
    if (!confirm(`Remover inscrição de ${reg.student_name ?? "aluno"}?`)) return;
    startRegTransition(async () => {
      const res = await deleteTripRegistrationAdminAction(reg.id);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      refresh();
    });
  }

  function onUploadCover(e: FormEvent<HTMLFormElement>, tripId: string) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startUploadTransition(async () => {
      const res = await uploadTripCoverAdminAction(tripId, fd);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      e.currentTarget.reset();
      refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={yearHref(refYear - 1)} aria-label={`Ano ${refYear - 1}`}>
              ← {refYear - 1}
            </Link>
          </Button>
          <span className="min-w-[5rem] text-center text-sm font-semibold tabular-nums">
            {refYear}
          </span>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={yearHref(refYear + 1)} aria-label={`Ano ${refYear + 1}`}>
              {refYear + 1} →
            </Link>
          </Button>
        </div>
        <Button type="button" onClick={openCreate}>
          Nova trip
        </Button>
      </div>

      {trips.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">
          Nenhuma surf trip neste ano. Crie uma ou mude o ano no calendário acima.
        </p>
      ) : null}

      <div className="space-y-10">
        {byMonth.map(({ monthKey, trips: monthTrips }) => (
          <section key={monthKey} aria-labelledby={`month-${monthKey}`} className="space-y-4">
            <h2 id={`month-${monthKey}`} className="text-lg font-semibold capitalize text-foreground">
              {monthTitlePt(monthKey)}
            </h2>
            <ul className="space-y-6">
              {monthTrips.map((trip) => (
                <li
                  key={trip.id}
                  className={cn(
                    "overflow-hidden rounded-2xl border border-border bg-card shadow-[4px_4px_12px_rgb(215_207_194/0.45),_-3px_-3px_10px_rgb(250_246_239/0.95)] dark:shadow-sm"
                  )}
                >
                  <div className="flex flex-col gap-4 border-b border-border/80 bg-[#F0E8DE]/40 p-4 dark:bg-card sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold tracking-tight text-foreground">
                          {trip.title || "Sem título"}
                        </h3>
                        <span
                          className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary"
                          title="Vagas (confirmadas / total)"
                        >
                          {spotsLabel(trip)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{trip.destination}</span>
                        {" · "}
                        {formatDatePt(trip.trip_date)}
                      </p>
                      {trip.description ? (
                        <p className="line-clamp-2 text-sm text-muted-foreground">{trip.description}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                      <Button type="button" variant="secondary" size="sm" onClick={() => openEdit(trip)}>
                        Editar dados
                      </Button>
                      {trip.cover_url ? (
                        // Capas podem vir de Storage/URLs externas; evita remotePatterns dinâmicos no build.
                        // eslint-disable-next-line @next/next/no-img-element -- preview admin, origem variável
                        <img
                          src={trip.cover_url}
                          alt=""
                          className="mt-2 h-20 max-w-[12rem] rounded-lg border border-border object-cover"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <form
                        className="flex flex-wrap items-end gap-2"
                        onSubmit={(ev) => onUploadCover(ev, trip.id)}
                      >
                        <div className="space-y-1">
                          <label
                            htmlFor={`cover-${trip.id}`}
                            className="text-xs font-medium text-muted-foreground"
                          >
                            Capa (JPEG/PNG/WebP, até 2 MB)
                          </label>
                          <Input
                            id={`cover-${trip.id}`}
                            name="file"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={pendingUpload}
                            className="max-w-[14rem] cursor-pointer text-sm"
                          />
                        </div>
                        <Button type="submit" size="sm" variant="outline" disabled={pendingUpload}>
                          {pendingUpload ? "Enviando…" : "Enviar"}
                        </Button>
                      </form>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAddForTripId((id) => (id === trip.id ? null : trip.id));
                          const next = availableStudentsFor(trip.id)[0]?.id ?? "";
                          setAddStudentId(next);
                        }}
                      >
                        {addForTripId === trip.id ? "Fechar inclusão" : "Inscrever aluno"}
                      </Button>
                    </div>

                    {addForTripId === trip.id ? (
                      <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3 sm:flex-row sm:flex-wrap sm:items-center">
                        <select
                          className="h-10 min-w-[12rem] rounded-md border border-input bg-background px-3 text-sm"
                          value={addStudentId}
                          onChange={(e) => setAddStudentId(e.target.value)}
                          aria-label="Aluno"
                        >
                          <option value="">Selecione o aluno</option>
                          {availableStudentsFor(trip.id).map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.full_name?.trim() || s.id.slice(0, 8)}
                            </option>
                          ))}
                        </select>
                        <select
                          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                          value={addStatus}
                          onChange={(e) =>
                            setAddStatus(e.target.value as PublicEnums["trip_registration_status"])
                          }
                          aria-label="Situação"
                        >
                          <option value="interested">{tripStatusLabel("interested")}</option>
                          <option value="confirmed">{tripStatusLabel("confirmed")}</option>
                          <option value="cancelled">{tripStatusLabel("cancelled")}</option>
                        </select>
                        <Button
                          type="button"
                          size="sm"
                          disabled={!addStudentId || pendingReg}
                          onClick={() => onAddRegistration(trip.id)}
                        >
                          Registrar
                        </Button>
                      </div>
                    ) : null}

                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-foreground">Inscrições</h4>
                      {trip.registrations.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma inscrição ainda.</p>
                      ) : (
                        <div className="overflow-x-auto rounded-lg border border-border">
                          <table className="w-full min-w-[28rem] text-left text-sm">
                            <thead className="bg-muted/40 text-muted-foreground">
                              <tr>
                                <th className="px-3 py-2 font-medium">Aluno</th>
                                <th className="px-3 py-2 font-medium">Situação</th>
                                <th className="w-[4rem] px-3 py-2 font-medium" />
                              </tr>
                            </thead>
                            <tbody>
                              {trip.registrations.map((reg) => (
                                <tr key={reg.id} className="border-t border-border">
                                  <td className="px-3 py-2">
                                    <span className="font-medium text-foreground">
                                      {reg.student_name?.trim() || reg.student_id.slice(0, 8)}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span
                                        className={cn(
                                          "rounded-full px-2 py-0.5 text-xs font-medium",
                                          tripStatusBadgeClass(reg.status)
                                        )}
                                      >
                                        {tripStatusLabel(reg.status)}
                                      </span>
                                      <select
                                        className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                                        value={reg.status}
                                        disabled={pendingReg}
                                        aria-label={`Alterar situação de ${reg.student_name ?? "aluno"}`}
                                        onChange={(e) =>
                                          onStatusChange(
                                            reg,
                                            e.target.value as PublicEnums["trip_registration_status"]
                                          )
                                        }
                                      >
                                        <option value="interested">
                                          {tripStatusLabel("interested")}
                                        </option>
                                        <option value="confirmed">
                                          {tripStatusLabel("confirmed")}
                                        </option>
                                        <option value="cancelled">
                                          {tripStatusLabel("cancelled")}
                                        </option>
                                      </select>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                      disabled={pendingReg}
                                      onClick={() => onDeleteRegistration(reg)}
                                    >
                                      Remover
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        Confirmados consomem vaga; o painel mantém ocupação alinhada às vagas da trip.
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <SurfTripFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingTrip(null);
        }}
        mode={dialogMode}
        trip={editingTrip}
        defaultTripDate={defaultNewTripDate}
        onSaved={refresh}
      />
    </div>
  );
}
