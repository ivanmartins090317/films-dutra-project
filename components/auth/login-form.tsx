"use client";

import { useFormState, useFormStatus } from "react-dom";

import type { AuthFormState } from "@/lib/auth/actions";
import { loginAction, requestPasswordResetAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthFormState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? "Entrando…" : label}
    </Button>
  );
}

function ResetSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} type="submit" variant="outline">
      {pending ? "Enviando…" : "Enviar link"}
    </Button>
  );
}

interface LoginFormProps {
  nextPath?: string;
}

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      {nextPath ? <input name="next" type="hidden" value={nextPath} /> : null}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="email">
          E-mail
        </label>
        <Input
          autoComplete="email"
          id="email"
          name="email"
          placeholder="voce@exemplo.com"
          required
          type="email"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="password">
          Senha
        </label>
        <Input
          autoComplete="current-password"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <SubmitButton label="Entrar" />
    </form>
  );
}

export function ForgotPasswordBlock() {
  const [state, formAction] = useFormState(requestPasswordResetAction, initialState);

  return (
    <div className="mt-8 w-full max-w-sm border-t border-border pt-6">
      <p className="text-sm text-muted-foreground">Esqueceu a senha?</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Informe o e-mail cadastrado e enviaremos um link para redefinir (magic link).
      </p>
      <form action={formAction} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <label className="sr-only" htmlFor="reset-email">
            E-mail para recuperação
          </label>
          <Input
            autoComplete="email"
            id="reset-email"
            name="email"
            placeholder="E-mail"
            type="email"
          />
        </div>
        <ResetSubmitButton />
      </form>
      {state.error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-2 text-sm text-muted-foreground" role="status">
          {state.success}
        </p>
      ) : null}
    </div>
  );
}
