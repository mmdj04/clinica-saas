import { prisma } from "@/lib/prisma";
import {
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  subMonths,
  format,
} from "date-fns";
import { isDemo, demoDashboardData } from "@/lib/demo";

export interface DashboardData {
  kpis: {
    todayRevenue: number;
    monthlyRevenue: number;
    activePatients: number;
    todayAppointments: number;
    noShowRate: number;
  };
  todayAppointments: {
    id: string;
    startAt: Date;
    endAt: Date;
    status: string;
    patientName: string;
    professionalName: string;
    professionalColor: string;
    price: number;
  }[];
  revenueChart: { month: string; receita: number; despesa: number }[];
  recentActivity: {
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    createdAt: Date;
    actorName: string | null;
  }[];
}

export async function fetchDashboardData(
  organizationId: string,
): Promise<DashboardData> {
  if (isDemo) {
    return {
      kpis: {
        todayRevenue: 750,
        monthlyRevenue: demoDashboardData.kpis.monthRevenue,
        activePatients: demoDashboardData.kpis.totalPatients,
        todayAppointments: demoDashboardData.kpis.appointmentsToday,
        noShowRate: 5.2,
      },
      todayAppointments: demoDashboardData.todayAppointments.map((a) => ({
        id: a.id,
        startAt: a.startAt,
        endAt: a.endAt,
        status: a.status,
        patientName: a.patientName,
        professionalName: a.professionalName,
        professionalColor: "#7c3aed",
        price: a.price,
      })),
      revenueChart: demoDashboardData.revenueChart.map((m) => ({
        month: m.month,
        receita: m.revenue,
        despesa: m.expenses,
      })),
      recentActivity: demoDashboardData.recentActivity.map((a, i) => ({
        id: `act-${i}`,
        action: a.action,
        entityType: "system",
        entityId: null,
        createdAt: new Date(),
        actorName: a.detail,
      })),
    };
  }
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    todayRevenue,
    monthlyRevenue,
    activePatients,
    todayAppointments,
    noShowCount,
    totalAppointmentsMonth,
    recentActivity,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        organizationId,
        type: "REVENUE",
        status: "PAID",
        date: { gte: todayStart, lte: todayEnd },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        organizationId,
        type: "REVENUE",
        status: "PAID",
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
    prisma.patient.count({
      where: { organizationId, status: "active" },
    }),
    prisma.appointment.findMany({
      where: {
        organizationId,
        startAt: { gte: todayStart, lte: todayEnd },
      },
      include: {
        patient: { select: { name: true } },
        professional: { select: { name: true, color: true } },
      },
      orderBy: { startAt: "asc" },
    }),
    prisma.appointment.count({
      where: {
        organizationId,
        status: "NO_SHOW",
        startAt: { gte: monthStart, lte: monthEnd },
      },
    }),
    prisma.appointment.count({
      where: {
        organizationId,
        startAt: { gte: monthStart, lte: monthEnd },
        NOT: { status: "CANCELLED" },
      },
    }),
    prisma.auditLog.findMany({
      where: { organizationId },
      include: { actor: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const last6Months: { month: string; receita: number; despesa: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const ref = subMonths(now, i);
    const mStart = startOfMonth(ref);
    const mEnd = endOfMonth(ref);

    const [rev, exp] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          organizationId,
          type: "REVENUE",
          status: "PAID",
          date: { gte: mStart, lte: mEnd },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          organizationId,
          type: "EXPENSE",
          status: { in: ["PAID", "PENDING"] },
          date: { gte: mStart, lte: mEnd },
        },
        _sum: { amount: true },
      }),
    ]);

    last6Months.push({
      month: format(ref, "MMM", { locale: undefined }),
      receita: Number(rev._sum.amount ?? 0),
      despesa: Number(exp._sum.amount ?? 0),
    });
  }

  const noShowRate =
    totalAppointmentsMonth > 0
      ? (noShowCount / totalAppointmentsMonth) * 100
      : 0;

  return {
    kpis: {
      todayRevenue: Number(todayRevenue._sum.amount ?? 0),
      monthlyRevenue: Number(monthlyRevenue._sum.amount ?? 0),
      activePatients,
      todayAppointments: todayAppointments.length,
      noShowRate,
    },
    todayAppointments: todayAppointments.map((a) => ({
      id: a.id,
      startAt: a.startAt,
      endAt: a.endAt,
      status: a.status,
      patientName: a.patient.name,
      professionalName: a.professional.name,
      professionalColor: a.professional.color,
      price: Number(a.price),
    })),
    revenueChart: last6Months,
    recentActivity: recentActivity.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      createdAt: log.createdAt,
      actorName: log.actor?.name ?? null,
    })),
  };
}
