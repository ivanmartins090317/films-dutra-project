import { describe, expect, it } from "vitest";

import {
  daysUntilNextBirthdayUtc,
  filterBirthdaysWithinUtcDays,
  parseBirthMonthDay,
} from "@/lib/admin/student-birthday-window";

describe("parseBirthMonthDay", () => {
  it("extrai mês e dia", () => {
    expect(parseBirthMonthDay("1990-03-15")).toEqual({ month: 3, day: 15 });
  });

  it("rejeita inválido", () => {
    expect(parseBirthMonthDay("")).toBeNull();
    expect(parseBirthMonthDay("foo")).toBeNull();
  });
});

describe("daysUntilNextBirthdayUtc", () => {
  it("retorna 0 no dia do aniversário", () => {
    const now = new Date(Date.UTC(2026, 0, 15, 12, 0, 0));
    expect(daysUntilNextBirthdayUtc(1, 15, now)).toBe(0);
  });

  it("conta até o próximo aniversário no mesmo ano", () => {
    const now = new Date(Date.UTC(2026, 0, 10, 12, 0, 0));
    expect(daysUntilNextBirthdayUtc(1, 15, now)).toBe(5);
  });

  it("avança para o ano seguinte se já passou", () => {
    const now = new Date(Date.UTC(2026, 5, 1, 12, 0, 0));
    const d = daysUntilNextBirthdayUtc(1, 15, now);
    expect(d).not.toBeNull();
    expect(d!).toBeGreaterThan(30);
  });
});

describe("filterBirthdaysWithinUtcDays", () => {
  it("inclui apenas janela e ordena por diasUntil", () => {
    const base = new Date(Date.UTC(2026, 0, 15, 12, 0, 0));
    const rows = filterBirthdaysWithinUtcDays(
      [
        { id: "a", full_name: "Ana", birth_date: "1990-01-20" },
        { id: "b", full_name: "Beto", birth_date: "1990-03-01" },
        { id: "c", full_name: "Cadu", birth_date: "1990-01-14" },
      ],
      base,
      7
    );
    expect(rows.map((r) => r.id)).toEqual(["a"]);
    expect(rows[0]?.daysUntil).toBe(5);
  });
});
