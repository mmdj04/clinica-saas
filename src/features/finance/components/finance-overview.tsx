"use client";

import * as React from "react";
import { toast } from "sonner";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  useTransactionSummary,
  useMonthlyData,
  useCategoryBreakdown,
} from "@/features/finance/queries/finance";
import {
  RevenueExpenseChart,
  CategoryPieChart,
} from "@/features/finance/components/finance-chart";

interface FinanceOverviewProps {
  organizationId: string;
  range: { from: Date; to: Date };
}

export function FinanceOverview({ organizationId, range }: FinanceOverviewProps) {
  const { data: summary, isLoading: loadingSummary } = useTransactionSummary(
    organizationId,
    range,
  );

  const { data: monthlyData, isLoading: loadingMonthly } =
    useMonthlyData(organizationId);

  const { data: revenueCategories } = useCategoryBreakdown(
    organizationId,
    range,
    "REVENUE",
  );

  const { data: expenseCategories } = useCategoryBreakdown(
    organizationId,
    range,
    "EXPENSE",
  );

  const totalRevenueCategories = (revenueCategories ?? []).reduce(
    (acc, c) => acc + c.total,
    0,
  );
  const totalExpenseCategories = (expenseCategories ?? []).reduce(
    (acc, c) => acc + c.total,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Receitas"
          value={formatCurrency(summary?.totalRevenue ?? 0)}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="success"
          trend={summary?.revenueTrend}
          trendLabel="vs. período anterior"
          hint={`${summary?.revenueTrend !== undefined ? (summary.revenueTrend >= 0 ? "↑" : "↓") : "—"} comparado ao período anterior`}
        />
        <StatCard
          title="Despesas"
          value={formatCurrency(summary?.totalExpenses ?? 0)}
          icon={<TrendingDown className="h-4 w-4" />}
          accent="danger"
          trend={summary?.expenseTrend ? -summary.expenseTrend : undefined}
          trendLabel="vs. período anterior"
          hint="Total de despesas no período"
        />
        <StatCard
          title="Saldo"
          value={formatCurrency(summary?.balance ?? 0)}
          icon={<Wallet className="h-4 w-4" />}
          accent={
            (summary?.balance ?? 0) >= 0 ? "success" : "danger"
          }
          hint="Receitas - Despesas"
        />
        <StatCard
          title="Pendentes"
          value={formatCurrency(summary?.pendingAmount ?? 0)}
          icon={<DollarSign className="h-4 w-4" />}
          accent="warning"
          hint="Valores aguardando pagamento"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Receitas vs Despesas
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast.info("Exportação em breve.")}
            >
              <Download className="mr-1.5 h-4 w-4" />
              Exportar
            </Button>
          </CardHeader>
          <CardContent>
            {loadingMonthly ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <RevenueExpenseChart data={monthlyData ?? []} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Receitas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart
              data={(revenueCategories ?? []).map((c) => ({
                ...c,
                total: c.total,
              }))}
            />
          </CardContent>
        </Card>
      </div>

      {(expenseCategories ?? []).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart
              data={(expenseCategories ?? []).map((c) => ({
                ...c,
                total: c.total,
              }))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
