import type { ProfileRow } from "@/types/database";

function displayOrDash(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const s = String(value).trim();
  return s.length > 0 ? s : "—";
}

interface StudentProfileFieldsProps {
  profile: ProfileRow;
}

/** Exibe apenas dados de `profiles` (RLS: `student_details` é admin-only). */
export function StudentProfileFields({ profile }: StudentProfileFieldsProps) {
  const rows = [
    { label: "Nome completo", value: displayOrDash(profile.full_name) },
    { label: "Telefone", value: displayOrDash(profile.phone) },
    { label: "Endereço", value: displayOrDash(profile.address) },
    { label: "Data de nascimento", value: displayOrDash(profile.birth_date) },
    { label: "Orientação sexual", value: displayOrDash(profile.sexual_orientation) },
    {
      label: "Altura / peso",
      value:
        profile.height_cm != null || profile.weight_kg != null
          ? `${profile.height_cm != null ? `${profile.height_cm} cm` : "—"} · ${profile.weight_kg != null ? `${profile.weight_kg} kg` : "—"}`
          : "—",
    },
  ];

  return (
    <dl className="divide-y divide-border rounded-2xl border border-border bg-card">
      {rows.map((r) => (
        <div key={r.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{r.label}</dt>
          <dd className="text-sm text-foreground">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
