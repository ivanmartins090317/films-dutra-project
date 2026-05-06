export interface SkillCountDatum {
  skill: string;
  count: number;
}

const MAX_BARS = 14;

export function aggregateSkillCounts(entries: { skills: string[] }[]): SkillCountDatum[] {
  const tally = new Map<string, number>();
  for (const e of entries) {
    for (const s of e.skills) {
      const key = s.trim();
      if (!key) continue;
      tally.set(key, (tally.get(key) ?? 0) + 1);
    }
  }
  return Array.from(tally.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count || a.skill.localeCompare(b.skill, "pt-BR"))
    .slice(0, MAX_BARS);
}
