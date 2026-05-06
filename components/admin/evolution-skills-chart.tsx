"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SkillCountDatum } from "@/lib/admin/evolution-skill-stats";

interface EvolutionSkillsChartProps {
  data: SkillCountDatum[];
}

export function EvolutionSkillsChart({ data }: EvolutionSkillsChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma tag de habilidade nas entradas deste aluno. Adicione habilidades separadas por vírgula
        para ver o gráfico.
      </p>
    );
  }

  const chartData = data.map((d) => ({ name: d.skill, ocorrências: d.count }));

  return (
    <div className="h-64 w-full min-w-0 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="name"
            angle={-35}
            textAnchor="end"
            height={56}
            interval={0}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value) => [value ?? "—", "Ocorrências"]}
          />
          <Bar dataKey="ocorrências" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
