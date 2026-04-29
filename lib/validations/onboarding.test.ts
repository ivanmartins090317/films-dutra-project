import { describe, expect, it } from "vitest";

import { parseOnboardingPayload } from "@/lib/validations/onboarding";

describe("parseOnboardingPayload", () => {
  it("aceita payload mínimo válido nas 5 etapas", () => {
    const raw = {
      full_name: "Maria Silva",
      birth_date: "2000-06-15",
      address: "Rua A, 100 — Florianópolis",
      phone: "48999990000",
      email: "maria@example.com",
      surfs_already: false,
      surf_goal: "Melhorar posicionamento na linha.",
      equipment_has: false,
      health_conditions: "",
      surgeries: "",
      preferred_days: ["sat", "sun"],
      weekly_frequency: "weekend",
      suggestions: "",
      lgpd_accepted: true,
      password: "senhaSegura8",
      password_confirm: "senhaSegura8",
    };
    const r = parseOnboardingPayload(raw);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("maria@example.com");
      expect(r.data.preferred_days).toEqual(["sat", "sun"]);
    }
  });

  it("rejeita sem aceite LGPD", () => {
    const raw = {
      full_name: "Maria Silva",
      birth_year: 2000,
      address: "Rua A",
      phone: "48999990000",
      email: "maria@example.com",
      surfs_already: false,
      surf_goal: "Objetivo",
      equipment_has: false,
      preferred_days: ["mon"],
      weekly_frequency: "1x",
      lgpd_accepted: false,
      password: "senhaSegura8",
      password_confirm: "senhaSegura8",
    };
    const r = parseOnboardingPayload(raw);
    expect(r.success).toBe(false);
  });
});
