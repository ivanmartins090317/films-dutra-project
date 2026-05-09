import { describe, expect, it } from "vitest";

import { studentSelfProfileSchema } from "@/lib/validations/student-profile";

describe("studentSelfProfileSchema", () => {
  it("aceita payload mínimo válido (sem is_active)", () => {
    const r = studentSelfProfileSchema.safeParse({
      full_name: "Maria Silva",
      phone: "",
      birth_date: "",
      birth_year: undefined,
      address: "",
      sexual_orientation: "",
      height_cm: "",
      weight_kg: "",
      avatar_url: "",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.full_name).toBe("Maria Silva");
      expect(r.data.avatar_url).toBeNull();
    }
  });

  it("rejeita URL de avatar inválida", () => {
    const r = studentSelfProfileSchema.safeParse({
      full_name: "x",
      phone: "",
      birth_date: "",
      birth_year: undefined,
      address: "",
      sexual_orientation: "",
      height_cm: "",
      weight_kg: "",
      avatar_url: "não-é-url",
    });
    expect(r.success).toBe(false);
  });
});
