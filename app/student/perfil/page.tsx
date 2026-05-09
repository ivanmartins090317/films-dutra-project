import { StudentProfileEditForm } from "@/components/student/student-profile-edit-form";
import { StudentRequestUpdateForm } from "@/components/student/student-request-update-form";
import { fallbackSchoolDisplayName, fetchSchoolSettings } from "@/lib/school-settings";
import { requireStudentSession } from "@/lib/student/session";

export default async function StudentProfilePage() {
  const { profile, supabase } = await requireStudentSession();
  const schoolRow = await fetchSchoolSettings(supabase);
  const schoolName = fallbackSchoolDisplayName(schoolRow);
  const contactEmailRaw = schoolRow?.contact_email?.trim() ?? "";

  const nameHint =
    profile.full_name?.trim() ||
    profile.phone?.trim() ||
    profile.id.slice(0, 8);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Meu perfil</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Edite seus dados abaixo quando precisar; as alterações aparecem para a equipe na administração. Informações
          médicas e de equipamento continuam restritas ao time Dutra — use o bloco ao final para solicitar revisão
          nesses casos.
        </p>
      </div>

      <StudentProfileEditForm profile={profile} />

      <StudentRequestUpdateForm
        schoolName={schoolName}
        recipientEmail={contactEmailRaw.length > 0 ? contactEmailRaw : null}
        studentNameHint={nameHint}
      />
    </div>
  );
}
