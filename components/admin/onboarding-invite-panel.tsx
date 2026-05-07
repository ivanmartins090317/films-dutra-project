"use client";

import { LinkSimple } from "@phosphor-icons/react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOnboardingInviteAction } from "@/lib/admin/onboarding-invite-action";
import { cn } from "@/lib/utils";

/** Painel na home admin — superfície vidro (blur + translucidez) sobre o canvas creme. */

export function OnboardingInvitePanel() {
  const [notes, setNotes] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    setCopied(false);
    startTransition(async () => {
      const result = await createOnboardingInviteAction(notes);
      if (!result.ok) {
        setInviteUrl(null);
        setError(result.error);
        return;
      }
      setInviteUrl(result.inviteUrl);
    });
  }

  async function handleCopy() {
    if (!inviteUrl || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Não foi possível copiar. Selecione o link manualmente.");
    }
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-[hsl(35_37%_65%/0.45)] p-6 text-[#1A1A1A]",
        "bg-[#F0E8DE]/45 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_10px_40px_-12px_rgba(26,26,26,0.15)]",
        "backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-[#F0E8DE]/35",
        "dark:border-border/70 dark:bg-card/45 dark:text-card-foreground dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-10px_rgba(0,0,0,0.35)]",
        "dark:supports-[backdrop-filter]:bg-card/35"
      )}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Convite de onboarding</h2>
          <p className="mt-1 max-w-xl text-sm text-[#555555] dark:text-muted-foreground">
            Gera um link válido por 7 dias para um novo aluno concluir o cadastro em{" "}
            <span className="font-medium">/onboarding</span>.
          </p>
        </div>
        <LinkSimple
          className="hidden size-10 shrink-0 text-[#7A8C6E] sm:block"
          weight="duotone"
          aria-hidden
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-2">
          <label
            htmlFor="invite-notes"
            className="text-xs font-medium text-[#555555] dark:text-muted-foreground"
          >
            Notas internas (opcional)
          </label>
          <Input
            id="invite-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex.: João — turma manhã"
            disabled={pending}
            className="border-[hsl(35_37%_65%/0.5)] bg-white/55 backdrop-blur-sm dark:border-border dark:bg-background/60"
          />
        </div>
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={pending}
          className="shrink-0 bg-[#7A8C6E] text-white hover:bg-[#7A8C6E]/90"
        >
          {pending ? "Gerando…" : "Gerar link"}
        </Button>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-[#A0522D] dark:text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {inviteUrl ? (
        <div className="mt-4 rounded-xl border border-[hsl(35_37%_65%/0.4)] bg-white/40 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)] backdrop-blur-sm dark:border-border/60 dark:bg-muted/30 dark:shadow-none">
          <p className="text-xs font-medium text-[#555555] dark:text-muted-foreground">
            Link gerado
          </p>
          <p className="mt-1 break-all font-mono text-sm">{inviteUrl}</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={handleCopy}>
            {copied ? "Copiado!" : "Copiar link"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
