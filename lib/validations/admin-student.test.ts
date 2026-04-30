import { describe, expect, it } from "vitest";

import { adminStudentProfileSchema } from "@/lib/validations/admin-student";

describe("adminStudentProfileSchema", () => {
  it("aceita payload mínimo válido", () => {
    const r = adminStudentProfileSchema.safeParse({
      full_name: "Maria Silva",
      phone: "",
      birth_date: "",
      birth_year: undefined,
      address: "",
      sexual_orientation: "",
      height_cm: "",
      weight_kg: "",
      avatar_url: "",
      is_active: true,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.full_name).toBe("Maria Silva");
      expect(r.data.avatar_url).toBeNull();
    }
  });

  it("rejeita URL de avatar inválida", () => {
    const r = adminStudentProfileSchema.safeParse({
      full_name: "x",
      phone: "",
      birth_date: "",
      birth_year: undefined,
      address: "",
      sexual_orientation: "",
      height_cm: "",
      weight_kg: "",
      avatar_url: "não-é-url",
      is_active: true,
    });
    expect(r.success).toBe(false);
  });
});
