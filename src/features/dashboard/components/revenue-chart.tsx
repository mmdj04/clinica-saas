"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { DashboardData } from "../queries/dashboard";

interface RevenueChartProps {
  data: DashboardData["revenueChart"];
}

const chartConfig = {
  receita: {
    label: "Receita",
    color: "hsl(var(--chart-1, 142 76% 36%))",
  },
  despesa: {
    label: "Despesa",
    color: "hsl(var(--chart-2, 0 84% 60%))",
  },
} satisfies ChartConfig;

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Receita vs Despesa</CardTitle>
        <CardDescription>Últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data} barGap={4}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v: number) =>
                new Intl.NumberFormat("pt-BR", {
                  notation: "compact",
                  compactDisplay: "short",
                  maximumFractionDigits: 0,
                }).format(v)
              }
              className="text-xs"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  valueFormatter={(v: number) => formatCurrency(v)}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="receita" fill="var(--color-receita)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesa" fill="var(--color-despesa)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
