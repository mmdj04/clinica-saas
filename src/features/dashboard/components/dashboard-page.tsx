"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/skeletons";
import { KpiCards } from "./kpi-cards";
import { AppointmentsToday } from "./appointments-today";
import { RevenueChart } from "./revenue-chart";
import { RecentActivity } from "./recent-activity";
import type { DashboardData } from "../queries/dashboard";

interface DashboardPageProps {
  initialData: DashboardData;
}

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Falha ao carregar dashboard");
  return res.json();
}

export function DashboardPage({ initialData }: DashboardPageProps) {
  const queryClient = useQueryClient();

  const { data, isFetching } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    initialData,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });

  if (!data) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral da clínica"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["dashboard"] })}
          disabled={isFetching}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </PageHeader>

      <KpiCards kpis={data.kpis} />

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RevenueChart data={data.revenueChart} />
        </div>
        <div className="lg:col-span-3">
          <RecentActivity activities={data.recentActivity} />
        </div>
      </div>

      <AppointmentsToday appointments={data.todayAppointments} />
    </div>
  );
}
