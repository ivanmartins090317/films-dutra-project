import { describe, expect, it } from "vitest";

import {
  deriveFinancialStatus,
  financialStatusLabelPt,
  financialTypeLabelPt,
  schoolTodayDateKey,
} from "@/lib/admin/financial-status";

describe("deriveFinancialStatus", () => {
  it("retorna paid quando há paid_at", () => {
    expect(deriveFinancialStatus("2020-01-01", "2026-05-01", "2026-05-06")).toBe("paid");
  });

  it("retorna overdue sem pagamento após vencimento", () => {
    expect(deriveFinancialStatus("2026-04-01", null, "2026-05-06")).toBe("overdue");
  });

  it("retorna pending antes do vencimento", () => {
    expect(deriveFinancialStatus("2026-12-31", null, "2026-05-06")).toBe("pending");
  });

  it("considera igual ao vencimento como pending", () => {
    expect(deriveFinancialStatus("2026-05-06", null, "2026-05-06")).toBe("pending");
  });
});

describe("financialStatusLabelPt", () => {
  it("mapeia três status", () => {
    expect(financialStatusLabelPt("paid")).toBe("Pago");
    expect(financialStatusLabelPt("pending")).toBe("Pendente");
    expect(financialStatusLabelPt("overdue")).toBe("Vencido");
  });
});

describe("financialTypeLabelPt", () => {
  it("mapeia tipos", () => {
    expect(financialTypeLabelPt("monthly")).toBe("Mensalidade");
    expect(financialTypeLabelPt("package")).toBe("Pacote");
    expect(financialTypeLabelPt("single")).toBe("Avulso");
  });
});

describe("schoolTodayDateKey", () => {
  it("produz AAAA-MM-DD", () => {
    const key = schoolTodayDateKey(new Date(Date.UTC(2026, 4, 6, 12, 0, 0)));
    expect(/^\d{4}-\d{2}-\d{2}$/.test(key)).toBe(true);
  });
});
