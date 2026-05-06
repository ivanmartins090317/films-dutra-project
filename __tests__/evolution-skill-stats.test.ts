import { describe, expect, it } from "vitest";

import { aggregateSkillCounts } from "@/lib/admin/evolution-skill-stats";

describe("aggregateSkillCounts", () => {
  it("retorna vazio sem entradas", () => {
    expect(aggregateSkillCounts([])).toEqual([]);
  });

  it("conta ocorrências e limita barras", () => {
    const entries = Array.from({ length: 20 }, (_, i) => ({
      skills: [`skill-${i}`, "comum"],
    }));
    const out = aggregateSkillCounts(entries);
    expect(out.length).toBeLessThanOrEqual(14);
    const comum = out.find((d) => d.skill === "comum");
    expect(comum?.count).toBe(20);
  });
});
