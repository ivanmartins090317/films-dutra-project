import type { Metadata } from "next";

import { OnboardingInvalid } from "@/components/onboarding/onboarding-invalid";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { validateOnboardingTokenAction } from "@/lib/onboarding/actions";

export const metadata: Metadata = {
  title: "Cadastro de aluno — Films Dutra",
  description: "Formulário de onboarding enviado pela escola Films Dutra.",
};

export default async function OnboardingTokenPage({
  params,
}: Readonly<{
  params: { token: string };
}>) {
  const status = await validateOnboardingTokenAction(params.token);
  if (!status.ok) {
    return <OnboardingInvalid reason={status.reason} />;
  }
  return <OnboardingWizard token={params.token} />;
}
