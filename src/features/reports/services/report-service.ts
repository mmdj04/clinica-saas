"use server";

import { prisma } from "@/lib/prisma";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  eachMonthOfInterval,
  getDay,
  getHours,
  startOfDay,
  endOfDay,
  differenceInDays,
} from "date-fns";
import { isDemo } from "@/lib/demo";
import type {
  PatientReportData,
  AppointmentReportData,
  FinanceReportData,
  CancellationReportData,
} from "../types";

function getDefaultRange(from?: Date, to?: Date) {
  const now = new Date();
  const f = from ?? subMonths(now, 5);
  const t = to ?? now;
  return { from: startOfDay(f), to: endOfDay(t) };
}

function getMonthsInRange(from: Date, to: Date) {
  return eachMonthOfInterval({ start: from, end: to });
}

// ────────────────────────────────────────────────────────────────
// PATIENT REPORT
// ────────────────────────────────────────────────────────────────
export async function fetchPatientReport(
  organizationId: string,
  from?: Date,
  to?: Date,
): Promise<PatientReportData> {
  if (isDemo) {
    return {
      totalPatients: 156,
      totalPatientsTrend: 12.5,
      newPatientsMonthly: [
        { month: "Fev/26", count: 12 },
        { month: "Mar/26", count: 15 },
        { month: "Abr/26", count: 18 },
        { month: "Mai/26", count: 22 },
        { month: "Jun/26", count: 19 },
        { month: "Jul/26", count: 25 },
      ],
      genderDistribution: [
        { name: "Feminino", value: 89 },
        { name: "Masculino", value: 62 },
        { name: "Outro", value: 5 },
      ],
      topSources: [
        { name: "Indicação", count: 45 },
        { name: "Google", count: 38 },
        { name: "Instagram", count: 32 },
        { name: "Outro", count: 41 },
      ],
      insuranceDistribution: [
        { name: "Particular", count: 78 },
        { name: "Amil", count: 25 },
        { name: "SulAmérica", count: 18 },
        { name: "Unimed", count: 22 },
        { name: "Outro", count: 13 },
      ],
      statusBreakdown: [
        { name: "Ativo", value: 142 },
        { name: "Inativo", value: 10 },
        { name: "Bloqueado", value: 4 },
      ],
    };
  }

  const range = getDefaultRange(from, to);
  const months = getMonthsInRange(range.from, range.to);

  const [
    totalPatients,
    genderGroups,
    sourceGroups,
    insuranceGroups,
    statusGroups,
    ...newPerMonthResults
  ] = await Promise.all([
    prisma.patient.count({
      where: { organizationId, createdAt: { lte: range.to } },
    }),
    prisma.patient.groupBy({
      by: ["gender"],
      where: { organizationId, createdAt: { lte: range.to } },
      _count: true,
    }),
    prisma.patient.groupBy({
      by: ["source"],
      where: { organizationId, createdAt: { lte: range.to } },
      _count: true,
      orderBy: { _count: { source: "desc" } },
      take: 5,
    }),
    prisma.patient.groupBy({
      by: ["insuranceProvider"],
      where: {
        organizationId,
        insuranceProvider: { not: null },
        createdAt: { lte: range.to },
      },
      _count: true,
      orderBy: { _count: { insuranceProvider: "desc" } },
      take: 6,
    }),
    prisma.patient.groupBy({
      by: ["status"],
      where: { organizationId, createdAt: { lte: range.to } },
      _count: true,
    }),
    ...months.map((m) =>
      prisma.patient.count({
        where: {
          organizationId,
          createdAt: { gte: startOfMonth(m), lte: endOfMonth(m) },
        },
      }),
    ),
  ]);

  const prevTotalPatients = totalPatients - newPerMonthResults.reduce((a, b) => a + b, 0);
  const totalPatientsTrend =
    prevTotalPatients > 0
      ? ((totalPatients - prevTotalPatients) / prevTotalPatients) * 100
      : 0;

  const genderMap: Record<string, string> = {
    MALE: "Masculino",
    FEMALE: "Feminino",
    OTHER: "Outro",
    NOT_INFORMED: "Não informado",
  };

  return {
    totalPatients,
    totalPatientsTrend,
    newPatientsMonthly: months.map((m, i) => ({
      month: format(m, "MMM/yy"),
      count: newPerMonthResults[i],
    })),
    genderDistribution: genderGroups.map((g) => ({
      name: genderMap[g.gender] ?? g.gender,
      value: g._count,
    })),
    topSources: sourceGroups.map((s) => ({
      name: s.source ?? "Não informado",
      count: s._count,
    })),
    insuranceDistribution: insuranceGroups.map((i) => ({
      name: i.insuranceProvider ?? "Não informado",
      count: i._count,
    })),
    statusBreakdown: statusGroups.map((s) => ({
      name: s.status,
      value: s._count,
    })),
  };
}

// ────────────────────────────────────────────────────────────────
// APPOINTMENT REPORT
// ────────────────────────────────────────────────────────────────
export async function fetchAppointmentReport(
  organizationId: string,
  from?: Date,
  to?: Date,
): Promise<AppointmentReportData> {
  if (isDemo) {
    return {
      totalAppointments: 342,
      totalAppointmentsTrend: 8.3,
      averageDaily: 16,
      byStatus: [
        { name: "Concluída", count: 280 },
        { name: "Cancelada", count: 35 },
        { name: "Não compareceu", count: 27 },
      ],
      byProfessional: [
        { name: "Dra. Maria Silva", count: 120 },
        { name: "Dr. João Santos", count: 95 },
        { name: "Dra. Ana Costa", count: 78 },
        { name: "Dr. Pedro Lima", count: 49 },
      ],
      monthlyTrend: [
        { month: "Fev/26", count: 45 },
        { month: "Mar/26", count: 52 },
        { month: "Abr/26", count: 48 },
        { month: "Mai/26", count: 58 },
        { month: "Jun/26", count: 62 },
        { month: "Jul/26", count: 77 },
      ],
      byHour: Array.from({ length: 12 }, (_, i) => ({
        hour: `${i + 8}:00`,
        count: Math.floor(Math.random() * 30) + 10,
      })),
      byDayOfWeek: [
        { name: "Segunda", count: 72 },
        { name: "Terça", count: 68 },
        { name: "Quarta", count: 65 },
        { name: "Quinta", count: 70 },
        { name: "Sexta", count: 67 },
      ],
    };
  }

  const range = getDefaultRange(from, to);
  const months = getMonthsInRange(range.from, range.to);

  const [
    totalAppointments,
    statusGroups,
    professionalGroups,
    ...monthlyResults
  ] = await Promise.all([
    prisma.appointment.count({
      where: { organizationId, startAt: { gte: range.from, lte: range.to } },
    }),
    prisma.appointment.groupBy({
      by: ["status"],
      where: { organizationId, startAt: { gte: range.from, lte: range.to } },
      _count: true,
    }),
    prisma.appointment.groupBy({
      by: ["professionalId"],
      where: { organizationId, startAt: { gte: range.from, lte: range.to } },
      _count: true,
      orderBy: { _count: { professionalId: "desc" } },
      take: 10,
    }),
    ...months.map((m) =>
      prisma.appointment.count({
        where: {
          organizationId,
          startAt: { gte: startOfMonth(m), lte: endOfMonth(m) },
        },
      }),
    ),
  ]);

  const prevMonthTotal = monthlyResults.length >= 2 ? monthlyResults[monthlyResults.length - 2] : 0;
  const currentMonthTotal = monthlyResults.length >= 1 ? monthlyResults[monthlyResults.length - 1] : 0;
  const totalAppointmentsTrend =
    prevMonthTotal > 0
      ? ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100
      : 0;

  const daysInRange = Math.max(differenceInDays(range.to, range.from), 1);
  const averageDaily = totalAppointments / daysInRange;

  const professionalIds = professionalGroups.map((p) => p.professionalId);
  const professionals = await prisma.professional.findMany({
    where: { id: { in: professionalIds } },
    select: { id: true, name: true },
  });
  const profMap = new Map(professionals.map((p) => [p.id, p.name]));

  const professionalNameMap: Record<string, number> = {};
  for (const pg of professionalGroups) {
    const name = profMap.get(pg.professionalId) ?? "Desconhecido";
    professionalNameMap[name] = (professionalNameMap[name] ?? 0) + pg._count;
  }

  const appointmentsInRange = await prisma.appointment.findMany({
    where: { organizationId, startAt: { gte: range.from, lte: range.to } },
    select: { startAt: true },
  });

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const dayCounts = new Array(7).fill(0);
  const hourCounts = new Array(24).fill(0);

  for (const a of appointmentsInRange) {
    dayCounts[getDay(a.startAt)]++;
    hourCounts[getHours(a.startAt)]++;
  }

  return {
    totalAppointments,
    totalAppointmentsTrend,
    averageDaily: Math.round(averageDaily * 10) / 10,
    byStatus: statusGroups.map((s) => ({
      name: statusLabel(s.status),
      count: s._count,
    })),
    byProfessional: Object.entries(professionalNameMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    byDayOfWeek: dayNames.map((name, i) => ({ name, count: dayCounts[i] })),
    byHour: hourCounts
      .map((count, i) => ({
        hour: `${String(i).padStart(2, "0")}h`,
        count,
      }))
      .filter((h) => h.count > 0),
    monthlyTrend: months.map((m, i) => ({
      month: format(m, "MMM/yy"),
      count: monthlyResults[i],
    })),
  };
}

// ────────────────────────────────────────────────────────────────
// FINANCE REPORT
// ────────────────────────────────────────────────────────────────
export async function fetchFinanceReport(
  organizationId: string,
  from?: Date,
  to?: Date,
): Promise<FinanceReportData> {
  if (isDemo) {
    return {
      totalRevenue: 18500,
      totalExpenses: 6419,
      balance: 12081,
      averageTicket: 285,
      balanceTrend: 15.2,
      monthlyData: [
        { month: "Fev/26", receita: 14200, despesa: 5800 },
        { month: "Mar/26", receita: 16800, despesa: 6100 },
        { month: "Abr/26", receita: 15400, despesa: 5900 },
        { month: "Mai/26", receita: 17200, despesa: 6200 },
        { month: "Jun/26", receita: 19100, despesa: 6500 },
        { month: "Jul/26", receita: 18500, despesa: 6419 },
      ],
      byPaymentMethod: [
        { name: "PIX", value: 8500 },
        { name: "Cartão", value: 6200 },
        { name: "Dinheiro", value: 2100 },
        { name: "Transferência", value: 1700 },
      ],
      byCategory: [
        { name: "Consultas", value: 12000 },
        { name: "Procedimentos", value: 6500 },
      ],
      topProfessional: { name: "Dra. Maria Silva", revenue: 8200 },
    };
  }

  const range = getDefaultRange(from, to);
  const months = getMonthsInRange(range.from, range.to);

  const [
    totalRevenueAgg,
    totalExpensesAgg,
    paymentMethodGroups,
    categoryGroups,
    ...monthlyRevenueResults
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        organizationId,
        type: "REVENUE",
        status: "PAID",
        date: { gte: range.from, lte: range.to },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.transaction.aggregate({
      where: {
        organizationId,
        type: "EXPENSE",
        status: { in: ["PAID", "PENDING"] },
        date: { gte: range.from, lte: range.to },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["paymentMethod"],
      where: {
        organizationId,
        type: "REVENUE",
        status: "PAID",
        date: { gte: range.from, lte: range.to },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        organizationId,
        type: "EXPENSE",
        status: { in: ["PAID", "PENDING"] },
        date: { gte: range.from, lte: range.to },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 8,
    }),
    ...months.map((m) =>
      prisma.transaction.aggregate({
        where: {
          organizationId,
          type: "REVENUE",
          status: "PAID",
          date: { gte: startOfMonth(m), lte: endOfMonth(m) },
        },
        _sum: { amount: true },
      }),
    ),
  ]);

  const monthlyExpenseResults = await Promise.all(
    months.map((m) =>
      prisma.transaction.aggregate({
        where: {
          organizationId,
          type: "EXPENSE",
          status: { in: ["PAID", "PENDING"] },
          date: { gte: startOfMonth(m), lte: endOfMonth(m) },
        },
        _sum: { amount: true },
      }),
    ),
  );

  const totalRevenue = Number(totalRevenueAgg._sum.amount ?? 0);
  const totalExpenses = Number(totalExpensesAgg._sum.amount ?? 0);
  const balance = totalRevenue - totalExpenses;
  const averageTicket =
    totalRevenueAgg._count > 0 ? totalRevenue / totalRevenueAgg._count : 0;

  const prevMonthRevenue =
    monthlyRevenueResults.length >= 2
      ? Number(monthlyRevenueResults[monthlyRevenueResults.length - 2]._sum.amount ?? 0)
      : 0;
  const currentMonthRevenue =
    monthlyRevenueResults.length >= 1
      ? Number(monthlyRevenueResults[monthlyRevenueResults.length - 1]._sum.amount ?? 0)
      : 0;
  const balanceTrend =
    prevMonthRevenue > 0
      ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
      : 0;

  const categoryIdGroups = categoryGroups.map((c) => c.categoryId).filter(Boolean) as string[];
  const categories = await prisma.financeCategory.findMany({
    where: { id: { in: categoryIdGroups } },
    select: { id: true, name: true },
  });
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const topProResult = await prisma.transaction.groupBy({
    by: ["professionalId"],
    where: {
      organizationId,
      type: "REVENUE",
      status: "PAID",
      date: { gte: range.from, lte: range.to },
      professionalId: { not: null },
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 1,
  });

  let topProfessional: { name: string; revenue: number } | null = null;
  if (topProResult.length > 0 && topProResult[0].professionalId) {
    const pro = await prisma.professional.findUnique({
      where: { id: topProResult[0].professionalId },
      select: { name: true },
    });
    if (pro) {
      topProfessional = {
        name: pro.name,
        revenue: Number(topProResult[0]._sum.amount ?? 0),
      };
    }
  }

  const paymentMethodLabels: Record<string, string> = {
    PIX: "PIX",
    CARD: "Cartão",
    CASH: "Dinheiro",
    TRANSFER: "Transferência",
    OTHER: "Outro",
    HEALTH_PLAN: "Plano de Saúde",
  };

  return {
    totalRevenue,
    totalExpenses,
    balance,
    averageTicket: Math.round(averageTicket * 100) / 100,
    balanceTrend,
    monthlyData: months.map((m, i) => ({
      month: format(m, "MMM/yy"),
      receita: Number(monthlyRevenueResults[i]._sum.amount ?? 0),
      despesa: Number(monthlyExpenseResults[i]._sum.amount ?? 0),
    })),
    byPaymentMethod: paymentMethodGroups.map((p) => ({
      name: paymentMethodLabels[p.paymentMethod] ?? p.paymentMethod,
      value: Number(p._sum.amount ?? 0),
    })),
    byCategory: categoryGroups.map((c) => ({
      name: catMap.get(c.categoryId ?? "") ?? "Sem categoria",
      value: Number(c._sum.amount ?? 0),
    })),
    topProfessional,
  };
}

// ────────────────────────────────────────────────────────────────
// CANCELLATION REPORT
// ────────────────────────────────────────────────────────────────
export async function fetchCancellationReport(
  organizationId: string,
  from?: Date,
  to?: Date,
): Promise<CancellationReportData> {
  if (isDemo) {
    return {
      totalCancellations: 35,
      totalNoShows: 27,
      cancelRate: 10.2,
      noShowRate: 7.9,
      cancelRateTrend: -2.1,
      byReason: [
        { name: "Reagendamento", count: 15 },
        { name: "Desistência", count: 10 },
        { name: "Problema pessoal", count: 6 },
        { name: "Motivo não informado", count: 4 },
      ],
      byProfessional: [
        { name: "Dr. João Santos", cancelled: 12, noShow: 8 },
        { name: "Dra. Maria Silva", cancelled: 10, noShow: 7 },
        { name: "Dra. Ana Costa", cancelled: 8, noShow: 6 },
        { name: "Dr. Pedro Lima", cancelled: 5, noShow: 6 },
      ],
      monthlyTrend: [
        { month: "Fev/26", cancelled: 4, noShow: 3 },
        { month: "Mar/26", cancelled: 5, noShow: 4 },
        { month: "Abr/26", cancelled: 6, noShow: 5 },
        { month: "Mai/26", cancelled: 7, noShow: 5 },
        { month: "Jun/26", cancelled: 6, noShow: 5 },
        { month: "Jul/26", cancelled: 7, noShow: 5 },
      ],
    };
  }

  const range = getDefaultRange(from, to);
  const months = getMonthsInRange(range.from, range.to);

  const [
    totalAppointments,
    cancelledCount,
    noShowCount,
    cancelReasonGroups,
    professionalGroups,
    ...monthlyResults
  ] = await Promise.all([
    prisma.appointment.count({
      where: { organizationId, startAt: { gte: range.from, lte: range.to } },
    }),
    prisma.appointment.count({
      where: {
        organizationId,
        status: "CANCELLED",
        startAt: { gte: range.from, lte: range.to },
      },
    }),
    prisma.appointment.count({
      where: {
        organizationId,
        status: "NO_SHOW",
        startAt: { gte: range.from, lte: range.to },
      },
    }),
    prisma.appointment.groupBy({
      by: ["cancelReason"],
      where: {
        organizationId,
        status: "CANCELLED",
        cancelReason: { not: null },
        startAt: { gte: range.from, lte: range.to },
      },
      _count: true,
      orderBy: { _count: { cancelReason: "desc" } },
    }),
    prisma.appointment.groupBy({
      by: ["professionalId"],
      where: { organizationId, startAt: { gte: range.from, lte: range.to } },
      _count: true,
    }),
    ...months.map((m) =>
      Promise.all([
        prisma.appointment.count({
          where: {
            organizationId,
            status: "CANCELLED",
            startAt: { gte: startOfMonth(m), lte: endOfMonth(m) },
          },
        }),
        prisma.appointment.count({
          where: {
            organizationId,
            status: "NO_SHOW",
            startAt: { gte: startOfMonth(m), lte: endOfMonth(m) },
          },
        }),
        prisma.appointment.count({
          where: {
            organizationId,
            startAt: { gte: startOfMonth(m), lte: endOfMonth(m) },
            NOT: { status: "CANCELLED" },
          },
        }),
      ]),
    ),
  ]);

  const cancelRate = totalAppointments > 0 ? (cancelledCount / totalAppointments) * 100 : 0;
  const noShowRate = totalAppointments > 0 ? (noShowCount / totalAppointments) * 100 : 0;

  const prevMonthCancelTotal =
    monthlyResults.length >= 2
      ? monthlyResults[monthlyResults.length - 2][2] + monthlyResults[monthlyResults.length - 2][0] +
        monthlyResults[monthlyResults.length - 2][1]
      : 0;
  const currentMonthTotal =
    monthlyResults.length >= 1
      ? monthlyResults[monthlyResults.length - 1][2] + monthlyResults[monthlyResults.length - 1][0] +
        monthlyResults[monthlyResults.length - 1][1]
      : 0;

  const professionalIds = professionalGroups.map((p) => p.professionalId);
  const professionals = await prisma.professional.findMany({
    where: { id: { in: professionalIds } },
    select: { id: true, name: true },
  });
  const profMap = new Map(professionals.map((p) => [p.id, p.name]));

  const professionalCancelData: Record<string, { cancelled: number; noShow: number }> = {};
  for (const pg of professionalGroups) {
    const name = profMap.get(pg.professionalId) ?? "Desconhecido";
    if (!professionalCancelData[name]) {
      professionalCancelData[name] = { cancelled: 0, noShow: 0 };
    }
  }

  const cancelledByProfessional = await prisma.appointment.groupBy({
    by: ["professionalId"],
    where: {
      organizationId,
      status: "CANCELLED",
      startAt: { gte: range.from, lte: range.to },
    },
    _count: true,
  });

  const noShowByProfessional = await prisma.appointment.groupBy({
    by: ["professionalId"],
    where: {
      organizationId,
      status: "NO_SHOW",
      startAt: { gte: range.from, lte: range.to },
    },
    _count: true,
  });

  for (const cbp of cancelledByProfessional) {
    const name = profMap.get(cbp.professionalId) ?? "Desconhecido";
    if (!professionalCancelData[name]) {
      professionalCancelData[name] = { cancelled: 0, noShow: 0 };
    }
    professionalCancelData[name].cancelled = cbp._count;
  }

  for (const nbp of noShowByProfessional) {
    const name = profMap.get(nbp.professionalId) ?? "Desconhecido";
    if (!professionalCancelData[name]) {
      professionalCancelData[name] = { cancelled: 0, noShow: 0 };
    }
    professionalCancelData[name].noShow = nbp._count;
  }

  return {
    totalCancellations: cancelledCount,
    totalNoShows: noShowCount,
    cancelRate: Math.round(cancelRate * 10) / 10,
    noShowRate: Math.round(noShowRate * 10) / 10,
    cancelRateTrend:
      prevMonthCancelTotal > 0
        ? ((currentMonthTotal - prevMonthCancelTotal) / prevMonthCancelTotal) * 100
        : 0,
    byReason: cancelReasonGroups.map((r) => ({
      name: r.cancelReason ?? "Não informado",
      count: r._count,
    })),
    byProfessional: Object.entries(professionalCancelData).map(
      ([name, data]) => ({
        name,
        ...data,
      }),
    ),
    monthlyTrend: months.map((m, i) => ({
      month: format(m, "MMM/yy"),
      cancelled: monthlyResults[i][0],
      noShow: monthlyResults[i][1],
    })),
  };
}

// ────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────
const statusLabels: Record<string, string> = {
  SCHEDULED: "Agendada",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
  NO_SHOW: "Não compareceu",
};

function statusLabel(status: string): string {
  return statusLabels[status] ?? status;
}
