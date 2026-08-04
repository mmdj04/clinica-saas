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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { formatCurrency, formatNumber } from "@/lib/utils";

const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(210 40% 96.1%)",
  "hsl(var(--chart-6))",
];

interface ReportBarChartProps {
  title: string;
  description?: string;
  data: Record<string, string | number>[];
  dataKey?: string;
  nameKey?: string;
  horizontal?: boolean;
  valueFormatter?: (value: number) => string;
  config?: ChartConfig;
  className?: string;
}

export function ReportBarChart({
  title,
  description,
  data,
  dataKey = "count",
  nameKey = "name",
  horizontal = false,
  valueFormatter,
  config,
  className,
}: ReportBarChartProps) {
  const defaultConfig = {
    bar: {
      label: title,
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const chartConfig = config ?? defaultConfig;
  const formatter = valueFormatter ?? formatNumber;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sem dados para o período selecionado
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] sm:h-[300px] w-full">
            <BarChart
              data={data}
              layout={horizontal ? "vertical" : "horizontal"}
              barGap={4}
            >
              <CartesianGrid
                vertical={!horizontal}
                horizontal={horizontal}
                strokeDasharray="3 3"
              />
              {horizontal ? (
                <>
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(v: number) => formatter(v)}
                    className="text-xs"
                  />
                  <YAxis
                    type="category"
                    dataKey={nameKey}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={120}
                    className="text-xs"
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey={nameKey}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-xs"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(v: number) => formatter(v)}
                    className="text-xs"
                  />
                </>
              )}
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    valueFormatter={(v: number) => formatter(v)}
                  />
                }
              />
              <Bar
                dataKey={dataKey}
                fill="var(--color-bar)"
                radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

interface ReportPieChartProps {
  title: string;
  description?: string;
  data: { name: string; value: number | string }[];
  className?: string;
}

export function ReportPieChart({
  title,
  description,
  data,
  className,
}: ReportPieChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sem dados para o período selecionado
          </p>
        ) : (
          <div className="flex flex-col items-center gap-4 lg:flex-row">
            <ChartContainer
              config={{}}
              className="h-[250px] w-full flex-1"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      valueFormatter={(v: number) => formatNumber(v)}
                    />
                  }
                />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-col gap-2 text-sm">
              {data.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{
                      backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                    }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="ml-auto font-medium">{formatNumber(Number(item.value))}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ReportLineChartProps {
  title: string;
  description?: string;
  data: Record<string, string | number>[];
  dataKey?: string;
  config?: ChartConfig;
  className?: string;
}

export function ReportLineChart({
  title,
  description,
  data,
  dataKey = "count",
  config,
  className,
}: ReportLineChartProps) {
  const defaultConfig = {
    line: {
      label: title,
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const chartConfig = config ?? defaultConfig;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sem dados para o período selecionado
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] sm:h-[300px] w-full">
            <LineChart data={data}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    valueFormatter={(v: number) => formatNumber(v)}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="var(--color-line)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

interface ComposedBarLineChartProps {
  title: string;
  description?: string;
  data: { month: string; receita: number; despesa: number }[];
  className?: string;
}

export function ComposedBarLineChart({
  title,
  description,
  data,
  className,
}: ComposedBarLineChartProps) {
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sem dados para o período selecionado
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] sm:h-[300px] w-full">
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
        )}
      </CardContent>
    </Card>
  );
}
