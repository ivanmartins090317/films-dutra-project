import { describe, expect, it } from "vitest";

import { adminFinancialFormSchema } from "@/lib/validations/financial";

describe("adminFinancialFormSchema", () => {
  const base = {
    student_id: "00000000-0000-4000-8000-000000000001",
    type: "monthly" as const,
    due_date: "2026-05-15",
    notes: "",
    paid_at: null,
  };

  it("aceita payload válido com pagamento", () => {
    const r = adminFinancialFormSchema.safeParse({
      ...base,
      amount: 150.5,
      paid_at: "2026-05-10",
    });
    expect(r.success).toBe(true);
  });

  it("rejeita valor vazio", () => {
    const r = adminFinancialFormSchema.safeParse({
      ...base,
      amount: "",
    });
    expect(r.success).toBe(false);
  });

  it("aceita string numérica no amount", () => {
    const r = adminFinancialFormSchema.safeParse({
      ...base,
      amount: "99.9",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.amount).toBeCloseTo(99.9);
    }
  });

  it("transforma paid_at vazio em null", () => {
    const r = adminFinancialFormSchema.safeParse({
      ...base,
      amount: 10,
      paid_at: "",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.paid_at).toBeNull();
    }
  });
});
