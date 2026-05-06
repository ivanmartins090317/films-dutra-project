"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { upsertStudentTripRegistrationAction } from "@/lib/student/trip-student-actions";
import type { PublicEnums } from "@/types/database";
import type { StudentTripWithMine } from "@/lib/student/student-portal-queries";
import { cn } from "@/lib/utils";

function tripStatusLabel(status: PublicEnums["trip_registration_status"]): string {
  if (status === "confirmed") return "Confirmado";
  if (status === "cancelled") return "Desistência registrada";
  return "Interesse registrado";
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

function spotsLabel(trip: StudentTripWithMine["trip"]): string {
  const free = Math.max(0, trip.spots_total - trip.spots_taken);
  return `${trip.spots_taken} / ${trip.spots_total} vagas · ${free} livre(s)`;
}

function formatTripDate(d: string): string {
  return format(parseISO(`${d}T12:00:00`), "d 'de' MMMM yyyy", { locale: ptBR });
}

interface StudentTripsPanelProps {
  rows: StudentTripWithMine[];
}

export function StudentTripsPanel({ rows }: StudentTripsPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(tripId: string, status: PublicEnums["trip_registration_status"]) {
    startTransition(() => {
      void (async () => {
        const res = await upsertStudentTripRegistrationAction({ tripId, status });
        if (!res.ok) {
          window.alert(res.error);
          return;
        }
        router.refresh();
      })();
    });
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Não há surf trips programadas a partir de hoje. Quando novas vagas abrirem, elas aparecem aqui.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-6">
      {rows.map(({ trip, myStatus }) => {
        const cover = trip.cover_url?.trim();
        const remote = Boolean(
          cover && (cover.startsWith("http://") || cover.startsWith("https://"))
        );
        const freeSlots = Math.max(0, trip.spots_total - trip.spots_taken);

        return (
          <li
            key={trip.id}
            className={cn(
              "overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            )}
          >
            <div className="flex flex-col sm:flex-row">
              <div className="relative aspect-[21/9] w-full shrink-0 bg-muted sm:aspect-auto sm:h-auto sm:w-44 md:w-52">
                {remote ? (
                  /* eslint-disable-next-line @next/next/no-img-element -- URLs públicas variadas (storage / externas). */
                  <img
                    alt=""
                    src={cover!}
                    className="size-full object-cover"
                    decoding="async"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">{trip.title.trim()}</h2>
                  <p className="text-sm text-muted-foreground">{trip.destination}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{formatTripDate(trip.trip_date)}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{spotsLabel(trip)}</p>
                </div>
                {trip.description?.trim() ? (
                  <p className="line-clamp-4 text-sm text-muted-foreground">{trip.description.trim()}</p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  {myStatus ? (
                    <span
                      className={cn("rounded-full px-3 py-1 text-xs font-medium", tripStatusBadgeClass(myStatus))}
                    >
                      {tripStatusLabel(myStatus)}
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      Você ainda não se manifestou
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {!myStatus || myStatus === "cancelled" ? (
                    <button
                      type="button"
                      disabled={pending}
                      className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                      onClick={() => run(trip.id, "interested")}
                    >
                      Tenho interesse
                    </button>
                  ) : null}
                  {myStatus === "interested" ? (
                    <>
                      <button
                        type="button"
                        disabled={pending}
                        className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-accent disabled:opacity-60"
                        onClick={() => {
                          if (freeSlots <= 0) {
                            window.alert("Não há vagas disponíveis para nova confirmação.");
                            return;
                          }
                          run(trip.id, "confirmed");
                        }}
                      >
                        Confirmar vaga
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted"
                        onClick={() => run(trip.id, "cancelled")}
                      >
                        Cancelar interesse
                      </button>
                    </>
                  ) : null}
                  {myStatus === "confirmed" ? (
                    <>
                      <button
                        type="button"
                        disabled={pending}
                        className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-accent"
                        onClick={() => run(trip.id, "interested")}
                      >
                        Voltar para interesse (libera vaga confirmada)
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted"
                        onClick={() => run(trip.id, "cancelled")}
                      >
                        Registrar desistência
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
