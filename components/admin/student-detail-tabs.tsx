"use client";

import { useState } from "react";

import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type StudentDetailsRow = Database["public"]["Tables"]["student_details"]["Row"];

interface StudentDetailTabsProps {
  profile: ProfileRow;
  studentDetails: StudentDetailsRow | null;
}

const tabs = [
  { id: "personal" as const, label: "Dados pessoais" },
  { id: "surf" as const, label: "Surf e saúde" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
}

export function StudentDetailTabs({ profile, studentDetails }: StudentDetailTabsProps) {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("personal");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Seções do perfil"
        className="flex flex-wrap gap-2 border-b border-border pb-3"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              active === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4 text-sm" role="tabpanel">
        {active === "personal" ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            <Detail label="Nome" value={profile.full_name || "—"} />
            <Detail label="Telefone" value={profile.phone ?? "—"} />
            <Detail label="E-mail (login)" value="Ver em Auth / conta do usuário" />
            <Detail label="Data de nascimento" value={formatDate(profile.birth_date)} />
            <Detail label="Ano de nascimento" value={profile.birth_year?.toString() ?? "—"} />
            <Detail label="Endereço" value={profile.address ?? "—"} />
            <Detail label="Orientação sexual" value={profile.sexual_orientation ?? "—"} />
            <Detail label="Altura (cm)" value={profile.height_cm?.toString() ?? "—"} />
            <Detail label="Peso (kg)" value={profile.weight_kg?.toString() ?? "—"} />
            <Detail label="LGPD aceito em" value={formatDate(profile.lgpd_accepted_at)} />
            <Detail label="Cadastro" value={formatDate(profile.created_at)} />
          </dl>
        ) : null}

        {active === "surf" ? (
          studentDetails ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              <Detail label="Já surfou" value={studentDetails.surfs_already ? "Sim" : "Não"} />
              <Detail label="Nível" value={studentDetails.surf_level} />
              <Detail label="Tempo de surf (anos)" value={String(studentDetails.surf_time_years)} />
              <Detail label="Outros esportes" value={studentDetails.other_sports.join(", ") || "—"} />
              <Detail label="Condições de saúde" value={studentDetails.health_conditions || "—"} />
              <Detail label="Cirurgias" value={studentDetails.surgeries || "—"} />
              <Detail label="Ciclo menstrual" value={studentDetails.menstrual_cycle ?? "—"} />
              <Detail label="Tem equipamento" value={studentDetails.equipment_has ? "Sim" : "Não"} />
              <Detail label="Modelo do equipamento" value={studentDetails.equipment_model || "—"} />
              <Detail label="Meta no surf" value={studentDetails.surf_goal || "—"} />
              <Detail label="Dias preferidos" value={studentDetails.preferred_days.join(", ") || "—"} />
              <Detail label="Frequência semanal" value={studentDetails.weekly_frequency} />
              <Detail label="Sugestões" value={studentDetails.suggestions || "—"} />
            </dl>
          ) : profile.role === "student" ? (
            <p className="text-muted-foreground">
              Ainda não há registro em detalhes do aluno (cadastro incompleto ou criado antes do
              onboarding).
            </p>
          ) : (
            <p className="text-muted-foreground">
              Detalhes de surf/saúde aplicam-se a perfis com papel aluno.
            </p>
          )
        ) : null}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/60 px-3 py-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-foreground">{value}</dd>
    </div>
  );
}
