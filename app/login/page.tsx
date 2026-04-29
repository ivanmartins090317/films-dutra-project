import Link from "next/link";

import { ForgotPasswordBlock, LoginForm } from "@/components/auth/login-form";
import { BrandLogo } from "@/components/brand/brand-logo";

const errorMessages: Record<string, string> = {
  inactive:
    "Esta conta está inativa. Entre em contato com a escola para reativar o acesso.",
  profile: "Não encontramos seu perfil. Entre em contato com a escola.",
  auth: "Falha na autenticação. Tente novamente ou peça um novo link por e-mail.",
};

interface LoginPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const nextRaw = searchParams.next;
  const nextPath =
    typeof nextRaw === "string" && nextRaw.startsWith("/") && !nextRaw.startsWith("//")
      ? nextRaw
      : undefined;
  const errorRaw = searchParams.error;
  const errorKey = typeof errorRaw === "string" ? errorRaw : undefined;
  const bannerMessage = errorKey ? errorMessages[errorKey] ?? null : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-[0_2px_8px_rgba(26,26,26,0.08)]">
        <div className="flex flex-col items-center text-center">
          <BrandLogo className="h-12 w-auto" priority />
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.28px] text-[#C8A882]">
            Acesso seguro
          </p>
          <h1 className="mt-2 text-2xl font-normal tracking-tight text-card-foreground">Entrar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use o e-mail e a senha fornecidos pela escola.
          </p>
        </div>
        {bannerMessage ? (
          <p
            className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {bannerMessage}
          </p>
        ) : null}
        <div className="mt-8 flex justify-center">
          <LoginForm nextPath={nextPath} />
        </div>
        <div className="mx-auto flex max-w-sm justify-center">
          <ForgotPasswordBlock />
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          <Link className="text-primary underline-offset-4 hover:underline" href="/">
            Voltar ao início
          </Link>
        </p>
      </div>
    </main>
  );
}
