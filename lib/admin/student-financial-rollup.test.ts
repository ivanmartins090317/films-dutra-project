import { describe, expect, it } from "vitest";

import { rollupStudentFinancialStatuses } from "@/lib/admin/student-financial-rollup";

describe("rollupStudentFinancialStatuses", () => {
  it("none quando vazio", () => {
    expect(rollupStudentFinancialStatuses(undefined)).toBe("none");
    expect(rollupStudentFinancialStatuses([])).toBe("none");
  });

  it("prioriza vencido", () => {
    expect(rollupStudentFinancialStatuses(["paid", "pending", "overdue"])).toBe("overdue");
  });

  it("pendente sem vencido", () => {
    expect(rollupStudentFinancialStatuses(["paid", "pending"])).toBe("pending");
  });

  it("clear quando só pago", () => {
    expect(rollupStudentFinancialStatuses(["paid"])).toBe("clear");
  });
});
