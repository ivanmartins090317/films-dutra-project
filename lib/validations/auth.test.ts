import { describe, expect, it } from "vitest";

import { loginSchema } from "@/lib/validations/auth";

describe("loginSchema", () => {
  it("aceita e-mail e senha válidos", () => {
    const r = loginSchema.safeParse({ email: "  aluno@escola.com  ", password: "x" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("aluno@escola.com");
  });

  it("rejeita e-mail inválido", () => {
    const r = loginSchema.safeParse({ email: "sem-arroba", password: "secret" });
    expect(r.success).toBe(false);
  });

  it("rejeita senha vazia", () => {
    const r = loginSchema.safeParse({ email: "a@b.co", password: "" });
    expect(r.success).toBe(false);
  });
});
