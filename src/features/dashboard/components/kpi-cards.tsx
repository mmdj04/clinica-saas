import {
  DollarSign,
  CalendarCheck,
  Users,
  UserCheck,
  TrendingDown,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { DashboardData } from "../queries/dashboard";

interface KpiCardsProps {
  kpis: DashboardData["kpis"];
}

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Receita Hoje"
        value={formatCurrency(kpis.todayRevenue)}
        icon={<DollarSign className="h-4 w-4" />}
        accent="success"
      />
      <StatCard
        title="Receita Mensal"
        value={formatCurrency(kpis.monthlyRevenue)}
        icon={<CalendarCheck className="h-4 w-4" />}
        accent="primary"
      />
      <StatCard
        title="Pacientes Ativos"
        value={kpis.activePatients}
        icon={<Users className="h-4 w-4" />}
        accent="info"
      />
      <StatCard
        title="Consultas Hoje"
        value={kpis.todayAppointments}
        icon={<UserCheck className="h-4 w-4" />}
        accent="warning"
      />
      <StatCard
        title="No-Show (mês)"
        value={formatPercent(kpis.noShowRate / 100)}
        icon={<TrendingDown className="h-4 w-4" />}
        accent="danger"
      />
    </div>
  );
}
