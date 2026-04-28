import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="max-w-lg text-center">
        <p className="text-sm font-medium text-muted-foreground">Films Dutra Audiovisual Co.</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Dashboard de gestão de alunos
        </h1>
        <p className="mt-3 text-balance text-muted-foreground">
          Fase 0 concluída: base Next.js, Tailwind, shadcn e dependências alinhadas ao plano. O
          design system e o shell vêm na fase 1.
        </p>
      </div>
      <Button type="button" disabled variant="secondary">
        Em breve: login
      </Button>
    </main>
  );
}
