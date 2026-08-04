"use client";

import { Wallet, TrendingUp, DollarSign, Award } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinanceReport } from "../queries/reports";
import {
  ComposedBarLineChart,
  ReportPieChart,
  ReportBarChart,
} from "./report-chart";
import { formatCurrency } from "@/lib/utils";
import type { DateRange } from "../types";

interface FinanceReportProps {
  dateRange: DateRange;
}

export function FinanceReport({ dateRange }: FinanceReportProps) {
  const { data, isLoading, isError } = useFinanceReport(
    dateRange.from,
    dateRange.to,
  );

  if (isLoading) return <FinanceReportSkeleton />;

  if (isError || !data) {
    return (
      <EmptyState
        icon={<Wallet className="h-6 w-6" />}
        title="Erro ao carregar dados"
        description="Não foi possível carregar o relatório financeiro."
      />
    );
  }

  if (data.totalRevenue === 0 && data.totalExpenses === 0) {
    return (
      <EmptyState
        icon={<Wallet className="h-6 w-6" />}
        title="Sem dados financeiros"
        description="Não há transações registradas para o período selecionado."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Receita Total"
          value={formatCurrency(data.totalRevenue)}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="success"
        />
        <StatCard
          title="Despesas Totais"
          value={formatCurrency(data.totalExpenses)}
          icon={<Wallet className="h-4 w-4" />}
          accent="danger"
        />
        <StatCard
          title="Saldo"
          value={formatCurrency(data.balance)}
          icon={<DollarSign className="h-4 w-4" />}
          accent="primary"
          trend={data.balanceTrend}
          trendLabel="vs mês anterior"
        />
        <StatCard
          title="Ticket Médio"
          value={formatCurrency(data.averageTicket)}
          icon={<DollarSign className="h-4 w-4" />}
          accent="info"
        />
      </div>

      <ComposedBarLineChart
        title="Receita vs Despesa Mensal"
        description="Evolução financeira mensal"
        data={data.monthlyData}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportPieChart
          title="Receita por Forma de Pagamento"
          data={data.byPaymentMethod}
        />
        <ReportBarChart
          title="Despesas por Categoria"
          data={data.byCategory}
          horizontal
        />
      </div>

      {data.topProfessional && (
        <StatCard
          title="Maior Profissional (Receita)"
          value={formatCurrency(data.topProfessional.revenue)}
          icon={<Award className="h-4 w-4" />}
          accent="warning"
          hint={data.topProfessional.name}
        />
      )}
    </div>
  );
}

function FinanceReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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
