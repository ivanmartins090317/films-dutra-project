import Link from "next/link";

import type { OnboardingTokenReason } from "@/lib/onboarding/actions";

import { Button } from "@/components/ui/button";

function messageFor(reason: OnboardingTokenReason): string {
  switch (reason) {
    case "expired":
      return "Este convite expirou. Solicite um novo link à escola.";
    case "used":
      return "Este link já foi utilizado. Se já concluiu o cadastro, acesse com seu e-mail e senha.";
    case "config":
      return "O servidor ainda não está configurado para cadastro por convite. Contate a escola.";
    default:
      return "Convite inválido ou não encontrado. Verifique o link ou peça um novo convite.";
  }
}

interface OnboardingInvalidProps {
  reason: OnboardingTokenReason;
}

export function OnboardingInvalid({ reason }: OnboardingInvalidProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F0E8DE] px-4 py-12">
      <div
        className="w-full max-w-md rounded-2xl border border-[#C8A882]/40 bg-white p-8 shadow-[8px_8px_24px_rgba(90,78,62,0.12),-6px_-6px_20px_rgba(255,255,255,0.85)]"
        role="alert"
      >
        <h1 className="font-[family-name:var(--font-geist-sans)] text-xl font-semibold text-foreground">
          Não foi possível abrir o cadastro
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{messageFor(reason)}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="default">
            <Link href="/login">Ir para login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Início</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
