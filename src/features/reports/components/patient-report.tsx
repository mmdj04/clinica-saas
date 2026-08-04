"use client";

import { Users, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientReport } from "../queries/reports";
import {
  ReportLineChart,
  ReportPieChart,
  ReportBarChart,
} from "./report-chart";
import { formatNumber } from "@/lib/utils";
import type { DateRange } from "../types";

interface PatientReportProps {
  dateRange: DateRange;
}

export function PatientReport({ dateRange }: PatientReportProps) {
  const { data, isLoading, isError } = usePatientReport(
    dateRange.from,
    dateRange.to,
  );

  if (isLoading) return <PatientReportSkeleton />;

  if (isError || !data) {
    return (
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="Erro ao carregar dados"
        description="Não foi possível carregar o relatório de pacientes."
      />
    );
  }

  if (data.totalPatients === 0) {
    return (
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="Nenhum paciente encontrado"
        description="Não há pacientes cadastrados para o período selecionado."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total de Pacientes"
          value={formatNumber(data.totalPatients)}
          icon={<Users className="h-4 w-4" />}
          accent="primary"
          trend={data.totalPatientsTrend}
          trendLabel="vs período anterior"
        />
        <StatCard
          title="Novos no Período"
          value={formatNumber(
            data.newPatientsMonthly.reduce((a, b) => a + b.count, 0),
          )}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="success"
        />
        <StatCard
          title="Ativos"
          value={formatNumber(
            data.statusBreakdown.find((s) => s.name === "active")?.value ?? 0,
          )}
          icon={<Users className="h-4 w-4" />}
          accent="info"
        />
      </div>

      <ReportLineChart
        title="Novos Pacientes por Mês"
        description="Evolução de novos cadastros"
        data={data.newPatientsMonthly}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportPieChart
          title="Distribuição por Gênero"
          data={data.genderDistribution}
        />
        <ReportBarChart
          title="Principais Origens"
          data={data.topSources.map((s) => ({
            name: s.name,
            count: s.count,
          }))}
          horizontal
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportPieChart
          title="Distribuição por Plano de Saúde"
          data={data.insuranceDistribution.map((i) => ({
            name: i.name,
            value: i.count,
          }))}
        />
        <ReportPieChart
          title="Situação dos Pacientes"
          data={data.statusBreakdown.map((s) => ({
            name: statusLabel(s.name),
            value: s.value,
          }))}
        />
      </div>
    </div>
  );
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "Ativo",
    inactive: "Inativo",
    blocked: "Bloqueado",
  };
  return labels[status] ?? status;
}

function PatientReportSkeleton() {
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
    </div>
  );
}
