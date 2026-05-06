"use client";

import { useMemo, useState } from "react";

interface StudentRequestUpdateFormProps {
  schoolName: string;
  recipientEmail: string | null;
  studentNameHint: string;
}

export function StudentRequestUpdateForm({
  schoolName,
  recipientEmail,
  studentNameHint,
}: StudentRequestUpdateFormProps) {
  const [message, setMessage] = useState(
    `Olá! Sou ${studentNameHint}.\nQuero atualizar dados do meu cadastro no portal (${schoolName}).\nMotivo ou campos envolvidos: \n`
  );

  const mailToHref = useMemo(() => {
    const to = recipientEmail?.trim();
    const subject = encodeURIComponent(`Atualização de cadastro — ${schoolName}`);
    const body = encodeURIComponent(message);
    if (!to) return null;
    return `mailto:${to}?subject=${subject}&body=${body}`;
  }, [recipientEmail, schoolName, message]);

  const to = recipientEmail?.trim();

  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-4">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Solicitar atualização
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Dados médicos ou de equipamento ficam apenas com o time na administração (LGPD). Use o formulário abaixo
        para gerar um e‑mail pré-preenchido para a escola atualizar suas informações.
      </p>
      {!to ? (
        <p className="mt-3 text-sm font-medium text-destructive">
          Ainda não há e‑mail de contato cadastrado. Avise sua instrutura ou coordenação.
        </p>
      ) : (
        <>
          <label htmlFor="update-note" className="mt-4 block text-sm font-medium text-foreground">
            Mensagem para a equipe
          </label>
          <textarea
            id="update-note"
            name="update-note"
            rows={6}
            className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-ring focus-visible:ring-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              href={mailToHref ?? "#"}
              {...(!mailToHref ? { "aria-disabled": true } : {})}
            >
              Abrir no app de e‑mail
            </a>
          </div>
        </>
      )}
    </div>
  );
}
