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

import type { MonthlyReceivedDatum } from "@/lib/admin/financial-dashboard-stats";

interface FinancialMonthlyChartProps {
  data: MonthlyReceivedDatum[];
}

export function FinancialMonthlyChart({ data }: FinancialMonthlyChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Sem dados para o período.</p>
    );
  }

  const hasAny = data.some((d) => d.total > 0);
  if (!hasAny) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum recebimento registrado nos últimos 12 meses desta referência.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    name: d.label,
    recebido: Math.round(d.total * 100) / 100,
  }));

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
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickFormatter={(v) =>
              typeof v === "number"
                ? v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                : String(v)
            }
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value) => {
              const n = typeof value === "number" ? value : Number(value);
              return [
                n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                "Recebido",
              ];
            }}
          />
          <Bar
            dataKey="recebido"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
