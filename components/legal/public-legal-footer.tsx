import Link from "next/link";

/**
 * Links legais reutilizáveis em telas públicas (LGPD / Fase 12).
 */
export function PublicLegalFooter({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Informações legais"
      className={className ?? "flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground"}
    >
      <Link className="text-primary underline-offset-4 hover:underline" href="/privacidade">
        Política de privacidade
      </Link>
    </nav>
  );
}
