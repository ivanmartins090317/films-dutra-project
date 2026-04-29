import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 p-6 sm:gap-12">
      <div className="flex w-full max-w-2xl flex-col items-center px-2 text-center sm:px-4">
        <BrandLogo className="h-16 w-auto sm:h-20" priority />
        <p className="mt-6 font-mono text-sm uppercase tracking-[0.28px] text-[#C8A882]">
          Films Dutra · Gestão de alunos
        </p>
        <p className="mt-5 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground sm:mt-6">
          Plataforma em evolução conforme o plano de implementação. Faça login para acessar o painel
          ou a área do aluno.
        </p>
      </div>
      <Button
        asChild
        className="rounded-full px-6 py-3 text-sm font-medium shadow-[8px_8px_20px_rgba(90,78,62,0.18),-6px_-6px_18px_rgba(255,255,255,0.55)]"
      >
        <Link href="/login">Entrar</Link>
      </Button>
    </main>
  );
}
