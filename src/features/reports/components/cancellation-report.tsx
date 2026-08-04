"use client";

import { AlertTriangle, TrendingDown } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCancellationReport } from "../queries/reports";
import {
  ReportBarChart,
  ReportPieChart,
  ReportLineChart,
} from "./report-chart";
import { formatNumber, formatPercent } from "@/lib/utils";
import type { DateRange } from "../types";

interface CancellationReportProps {
  dateRange: DateRange;
}

export function CancellationReport({ dateRange }: CancellationReportProps) {
  const { data, isLoading, isError } = useCancellationReport(
    dateRange.from,
    dateRange.to,
  );

  if (isLoading) return <CancellationReportSkeleton />;

  if (isError || !data) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-6 w-6" />}
        title="Erro ao carregar dados"
        description="Não foi possível carregar o relatório de cancelamentos."
      />
    );
  }

  if (data.totalCancellations === 0 && data.totalNoShows === 0) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-6 w-6" />}
        title="Sem cancelamentos"
        description="Não houve cancelamentos ou faltas no período selecionado."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Cancelamentos"
          value={formatNumber(data.totalCancellations)}
          icon={<AlertTriangle className="h-4 w-4" />}
          accent="danger"
        />
        <StatCard
          title="Total de No-Shows"
          value={formatNumber(data.totalNoShows)}
          icon={<TrendingDown className="h-4 w-4" />}
          accent="warning"
        />
        <StatCard
          title="Taxa de Cancelamento"
          value={formatPercent(data.cancelRate / 100)}
          icon={<AlertTriangle className="h-4 w-4" />}
          accent="danger"
          trend={data.cancelRateTrend}
          trendLabel="vs período anterior"
        />
        <StatCard
          title="Taxa de No-Show"
          value={formatPercent(data.noShowRate / 100)}
          icon={<TrendingDown className="h-4 w-4" />}
          accent="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportPieChart
          title="Motivos de Cancelamento"
          data={data.byReason.map((r) => ({
            name: r.name,
            value: r.count,
          }))}
        />
        <ReportBarChart
          title="Cancelamentos por Profissional"
          data={data.byProfessional.map((p) => ({
            name: p.name,
            cancelled: p.cancelled,
            noShow: p.noShow,
          }))}
          horizontal
          config={{
            cancelled: {
              label: "Cancelamentos",
              color: "hsl(var(--chart-1))",
            },
            noShow: {
              label: "No-Shows",
              color: "hsl(var(--chart-2))",
            },
          }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportLineChart
          title="Tendência Mensal de Cancelamentos"
          data={data.monthlyTrend.map((m) => ({
            name: m.month,
            count: m.cancelled,
          }))}
          dataKey="count"
          config={{
            line: {
              label: "Cancelamentos",
              color: "hsl(var(--chart-1))",
            },
          }}
        />
        <ReportLineChart
          title="Tendência Mensal de No-Shows"
          data={data.monthlyTrend.map((m) => ({
            name: m.month,
            count: m.noShow,
          }))}
          dataKey="count"
          config={{
            line: {
              label: "No-Shows",
              color: "hsl(var(--chart-2))",
            },
          }}
        />
      </div>
    </div>
  );
}

function CancellationReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[300px] rounded-xl" />
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    </div>
  );
}
