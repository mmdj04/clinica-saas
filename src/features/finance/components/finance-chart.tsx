"use client";

import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyData, CategoryBreakdown } from "@/features/finance/types";

interface RevenueExpenseChartProps {
  data: MonthlyData[];
}

const barConfig = {
  receita: { label: "Receita", color: "#10b981" },
  despesa: { label: "Despesa", color: "#f43f5e" },
};

export function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        Sem dados para exibir.
      </div>
    );
  }

  return (
    <ChartContainer config={barConfig} className="h-[300px] w-full">
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) =>
            new Intl.NumberFormat("pt-BR", {
              notation: "compact",
              currency: "BRL",
              style: "currency",
            }).format(v)
          }
        />
        <Tooltip
          content={
            <ChartTooltipContent
              valueFormatter={(v) => formatCurrency(v)}
            />
          }
        />
        <Legend />
        <Bar
          dataKey="receita"
          fill="var(--color-receita)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="despesa"
          fill="var(--color-despesa)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}

interface CategoryPieChartProps {
  data: CategoryBreakdown[];
}

const PIE_COLORS = [
  "#7c3aed",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#f43f5e",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#8b5cf6",
];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        Sem dados para exibir.
      </div>
    );
  }

  const total = data.reduce((acc, d) => acc + d.total, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-[280px] w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={50}
              paddingAngle={2}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full space-y-1.5 sm:w-48">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    entry.color || PIE_COLORS[index % PIE_COLORS.length],
                }}
              />
              <span className="truncate text-muted-foreground">{entry.name}</span>
            </div>
            <span className="tabular-nums">
              {total > 0
                ? `${((entry.total / total) * 100).toFixed(0)}%`
                : "0%"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
