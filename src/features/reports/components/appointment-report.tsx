"use client";

import { Calendar, TrendingUp, Clock } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppointmentReport } from "../queries/reports";
import {
  ReportBarChart,
  ReportLineChart,
} from "./report-chart";
import { formatNumber } from "@/lib/utils";
import type { DateRange } from "../types";

interface AppointmentReportProps {
  dateRange: DateRange;
}

export function AppointmentReport({ dateRange }: AppointmentReportProps) {
  const { data, isLoading, isError } = useAppointmentReport(
    dateRange.from,
    dateRange.to,
  );

  if (isLoading) return <AppointmentReportSkeleton />;

  if (isError || !data) {
    return (
      <EmptyState
        icon={<Calendar className="h-6 w-6" />}
        title="Erro ao carregar dados"
        description="Não foi possível carregar o relatório de consultas."
      />
    );
  }

  if (data.totalAppointments === 0) {
    return (
      <EmptyState
        icon={<Calendar className="h-6 w-6" />}
        title="Nenhuma consulta encontrada"
        description="Não há consultas agendadas para o período selecionado."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total de Consultas"
          value={formatNumber(data.totalAppointments)}
          icon={<Calendar className="h-4 w-4" />}
          accent="primary"
          trend={data.totalAppointmentsTrend}
          trendLabel="vs período anterior"
        />
        <StatCard
          title="Média Diária"
          value={data.averageDaily.toFixed(1)}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="success"
        />
        <StatCard
          title="Horários Mais Procurados"
          value={
            data.byHour.length > 0
              ? data.byHour.reduce((a, b) => (a.count > b.count ? a : b)).hour
              : "—"
          }
          icon={<Clock className="h-4 w-4" />}
          accent="info"
          hint="Horário com mais agendamentos"
        />
      </div>

      <ReportBarChart
        title="Consultas por Status"
        description="Distribuição do status das consultas"
        data={data.byStatus}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportBarChart
          title="Consultas por Profissional"
          description="Top profissionais no período"
          data={data.byProfessional}
          horizontal
        />
        <ReportBarChart
          title="Consultas por Dia da Semana"
          description="Distribuição semanal"
          data={data.byDayOfWeek}
        />
      </div>

      <ReportBarChart
        title="Consultas por Hora do Dia"
        description="Distribuição por horário"
        data={data.byHour}
      />

      <ReportLineChart
        title="Tendência Mensal"
        description="Evolução do número de consultas"
        data={data.monthlyTrend}
      />
    </div>
  );
}

function AppointmentReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[300px] rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[300px] rounded-xl" />
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
      <Skeleton className="h-[300px] rounded-xl" />
    </div>
  );
}
