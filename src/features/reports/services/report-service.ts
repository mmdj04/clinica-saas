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
