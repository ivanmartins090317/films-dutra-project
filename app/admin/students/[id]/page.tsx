import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminStudentDetailsEditForm } from "@/components/admin/admin-student-details-edit-form";
import { AdminStudentProfileEditForm } from "@/components/admin/admin-student-profile-edit-form";
import { StudentDetailTabs } from "@/components/admin/student-detail-tabs";
import { requireAdminSession } from "@/lib/admin/session";
import type { Database, ProfileRow } from "@/types/database";

type StudentDetailsRow = Database["public"]["Tables"]["student_details"]["Row"];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface StudentDetailPageProps {
  params: { id: string };
}

export default async function AdminStudentDetailPage({ params }: StudentDetailPageProps) {
  const { supabase } = await requireAdminSession();

  if (!UUID_RE.test(params.id)) {
    notFound();
  }

  const { data: profileRow, error: profileErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (profileErr || !profileRow) {
    notFound();
  }

  const profile = profileRow as ProfileRow;

  let studentDetails: StudentDetailsRow | null = null;
  if (profile.role === "student") {
    const { data: details } = await supabase
      .from("student_details")
      .select("*")
      .eq("student_id", profile.id)
      .maybeSingle();
    studentDetails = details as StudentDetailsRow | null;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link
          href="/admin/students"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Voltar aos alunos
        </Link>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {profile.full_name || "Perfil"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Papel: {profile.role === "admin" ? "Administrador" : "Aluno"}
              {!profile.is_active ? " · Conta inativa" : ""}
            </p>
          </div>
        </div>
      </div>

      <StudentDetailTabs profile={profile} studentDetails={studentDetails} />

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
        <h2 className="text-lg font-semibold tracking-tight">Edição (administrador)</h2>
        <p className="text-sm text-muted-foreground">
          Alterações respeitam RLS: administradores podem atualizar perfil e, para alunos, detalhes de
          surf/saúde.
        </p>
        <div className="space-y-8 pt-2">
          <div>
            <h3 className="mb-3 text-sm font-medium text-foreground">Dados pessoais</h3>
            <AdminStudentProfileEditForm profile={profile} />
          </div>
          {profile.role === "student" ? (
            <div className="border-t border-border pt-8">
              <h3 className="mb-3 text-sm font-medium text-foreground">Surf e saúde</h3>
              <AdminStudentDetailsEditForm studentId={profile.id} studentDetails={studentDetails} />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
