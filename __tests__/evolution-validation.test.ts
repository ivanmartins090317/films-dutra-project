import { describe, expect, it } from "vitest";

import { adminEvolutionFormSchema, parseEvolutionSkills } from "@/lib/validations/evolution";

describe("adminEvolutionFormSchema", () => {
  const base = {
    student_id: "550e8400-e29b-41d4-a716-446655440000",
    entry_date: "2026-05-06",
    content: "Bom progresso no takeoff.",
    skills_input: "takeoff, leitura de onda",
    lesson_id: "",
  };

  it("aceita entrada válida sem aula", () => {
    const r = adminEvolutionFormSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.lesson_id).toBeUndefined();
  });

  it("normaliza lesson_id vazio para undefined", () => {
    const r = adminEvolutionFormSchema.safeParse({
      ...base,
      lesson_id: "   ",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.lesson_id).toBeUndefined();
  });

  it("aceita UUID de aula", () => {
    const r = adminEvolutionFormSchema.safeParse({
      ...base,
      lesson_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    });
    expect(r.success).toBe(true);
  });

  it("rejeita conteúdo vazio", () => {
    const r = adminEvolutionFormSchema.safeParse({ ...base, content: "  " });
    expect(r.success).toBe(false);
  });

  it("rejeita lesson_id inválido", () => {
    const r = adminEvolutionFormSchema.safeParse({ ...base, lesson_id: "não-uuid" });
    expect(r.success).toBe(false);
  });
});

describe("parseEvolutionSkills", () => {
  it("reaproveita o parser de skills (lista)", () => {
    expect(parseEvolutionSkills("a, b;c\n")).toEqual(["a", "b", "c"]);
  });
});
