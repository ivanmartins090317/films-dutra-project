interface StudentCommsStripProps {
  schoolName: string;
  contactEmail: string | null;
  contactPhone: string | null;
}

/** Comunicados / canais institucionais (MVP: contato estático a partir das configurações). */
export function StudentCommsStrip({ schoolName, contactEmail, contactPhone }: StudentCommsStripProps) {
  const mail = contactEmail?.trim();
  const phone = contactPhone?.trim();
  const hasAny = Boolean(mail || phone);

  return (
    <aside
      className="rounded-2xl border border-border bg-secondary/25 px-5 py-4 dark:bg-secondary/20"
      aria-label="Comunicados da escola"
    >
      <p className="text-sm font-medium text-foreground">Comunicados</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Novidades sobre aulas e trips aparecem aqui. Em breve você também receberá lembretes por e‑mail —
        até lá, combine horários pelo contato oficial da escola.
      </p>
      {!hasAny ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Canal de suporte pelo time da <span className="font-medium">{schoolName}</span> será
          atualizado quando o admin cadastrar e‑mail ou telefone em Configurações.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-2 text-sm md:flex-row md:flex-wrap md:items-center md:gap-4">
          {mail ? (
            <a className="text-primary underline underline-offset-4 hover:text-primary/80" href={`mailto:${mail}`}>
              {mail}
            </a>
          ) : null}
          {phone ? (
            <a className="text-primary underline underline-offset-4 hover:text-primary/80" href={`tel:${phone.replace(/\D/g, "")}`}>
              {phone}
            </a>
          ) : null}
        </div>
      )}
    </aside>
  );
}
