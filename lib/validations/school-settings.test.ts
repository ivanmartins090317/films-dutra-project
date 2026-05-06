import { describe, expect, it } from "vitest";

import { schoolSettingsFormSchema } from "@/lib/validations/school-settings";

describe("schoolSettingsFormSchema", () => {
  it("aceita payload válido com e-mail vazio e portal ativo", () => {
    const r = schoolSettingsFormSchema.safeParse({
      school_name: "Escola Teste",
      contact_email: "",
      contact_phone: "11 99999-0000",
      logo_url: "",
      student_portal_enabled: true,
    });
    expect(r.success).toBe(true);
  });

  it("rejeita nome vazio", () => {
    const r = schoolSettingsFormSchema.safeParse({
      school_name: "   ",
      contact_email: "",
      contact_phone: "",
      logo_url: "",
      student_portal_enabled: true,
    });
    expect(r.success).toBe(false);
  });

  it("rejeita e-mail preenchido mas inválido", () => {
    const r = schoolSettingsFormSchema.safeParse({
      school_name: "X",
      contact_email: "invalid",
      contact_phone: "",
      logo_url: "",
      student_portal_enabled: false,
    });
    expect(r.success).toBe(false);
  });
});
