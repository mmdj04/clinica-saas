"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { TransactionWithRelations, CommissionWithProfessional, CategoryBreakdown, MonthlyData, TransactionSummary } from "@/features/finance/types";

interface DateRange {
  from: Date;
  to: Date;
}

function tenantWhere(organizationId: string): Prisma.TransactionWhereInput {
  return { organizationId };
}

export async function listTransactions(
  organizationId: string,
  range: DateRange,
  filters?: {
    type?: "REVENUE" | "EXPENSE";
    status?: string;
    categoryId?: string;
    professionalId?: string;
  },
  pagination?: { page: number; limit: number },
): Promise<{ items: TransactionWithRelations[]; total: number }> {
  const page = pagination?.page ?? 1;
  const limit = Math.min(pagination?.limit ?? 50, 200);

  const where: Prisma.TransactionWhereInput = {
    ...tenantWhere(organizationId),
    date: { gte: range.from, lte: range.to },
    ...(filters?.type ? { type: filters.type } : {}),
    ...(filters?.status ? { status: filters.status as never } : {}),
    ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters?.professionalId ? { professionalId: filters.professionalId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, color: true } },
        patient: { select: { id: true, name: true } },
        professional: { select: { id: true, name: true } },
        commissions: true,
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { items: items as TransactionWithRelations[], total };
}

export async function getTransactionSummary(
  organizationId: string,
  range: DateRange,
  previousRange?: DateRange,
): Promise<TransactionSummary> {
  const where = {
    ...tenantWhere(organizationId),
    date: { gte: range.from, lte: range.to },
    status: { not: "CANCELLED" as const },
  };

  const [revenueAgg, expenseAgg, pendingAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...where, type: "REVENUE" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { ...where, type: "EXPENSE" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { ...tenantWhere(organizationId), status: "PENDING", date: { gte: range.from, lte: range.to } },
      _sum: { amount: true },
    }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.amount ?? 0);
  const totalExpenses = Number(expenseAgg._sum.amount ?? 0);
  const pendingAmount = Number(pendingAgg._sum.amount ?? 0);

  let revenueTrend = 0;
  let expenseTrend = 0;

  if (previousRange) {
    const [prevRevenue, prevExpense] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          ...tenantWhere(organizationId),
          type: "REVENUE",
          status: { not: "CANCELLED" as const },
          date: { gte: previousRange.from, lte: previousRange.to },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          ...tenantWhere(organizationId),
          type: "EXPENSE",
          status: { not: "CANCELLED" as const },
          date: { gte: previousRange.from, lte: previousRange.to },
        },
        _sum: { amount: true },
      }),
    ]);

    const prevRev = Number(prevRevenue._sum.amount ?? 0);
    const prevExp = Number(prevExpense._sum.amount ?? 0);
    if (prevRev > 0) revenueTrend = ((totalRevenue - prevRev) / prevRev) * 100;
    if (prevExp > 0) expenseTrend = ((totalExpenses - prevExp) / prevExp) * 100;
  }

  return {
    totalRevenue,
    totalExpenses,
    balance: totalRevenue - totalExpenses,
    pendingAmount,
    revenueTrend,
    expenseTrend,
  };
}

export async function getCategoryBreakdown(
  organizationId: string,
  range: DateRange,
  type?: "REVENUE" | "EXPENSE",
): Promise<CategoryBreakdown[]> {
  const where: Prisma.TransactionWhereInput = {
    ...tenantWhere(organizationId),
    date: { gte: range.from, lte: range.to },
    status: { not: "CANCELLED" as const },
    ...(type ? { type } : {}),
  };

  const categories = await prisma.financeCategory.findMany({
    where: {
      organizationId,
      ...(type ? { type } : {}),
    },
  });

  const transactions = await prisma.transaction.findMany({
    where,
    select: { categoryId: true, amount: true },
  });

  const categoryMap = new Map(
    categories.map((c) => [c.id, { name: c.name, color: c.color, total: 0, count: 0 }]),
  );

  for (const t of transactions) {
    if (!t.categoryId) continue;
    const entry = categoryMap.get(t.categoryId);
    if (entry) {
      entry.total += Number(t.amount);
      entry.count += 1;
    }
  }

  return Array.from(categoryMap.values()).filter((c) => c.count > 0);
}

export async function getMonthlyData(
  organizationId: string,
  months: number = 6,
): Promise<MonthlyData[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: {
      ...tenantWhere(organizationId),
      date: { gte: start, lte: end },
      status: { not: "CANCELLED" as const },
    },
    select: { type: true, amount: true, date: true },
  });

  const monthMap = new Map<string, { receita: number; despesa: number }>();

  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    monthMap.set(key, { receita: 0, despesa: 0 });
  }

  for (const t of transactions) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    const entry = monthMap.get(key);
    if (entry) {
      if (t.type === "REVENUE") entry.receita += Number(t.amount);
      else entry.despesa += Number(t.amount);
    }
  }

  return Array.from(monthMap.entries()).map(([key, value]) => {
    const [year, month] = key.split("-");
    return {
      month: `${monthNames[parseInt(month)]}/${year.slice(2)}`,
      ...value,
    };
  });
}

export async function listCategories(
  organizationId: string,
  type?: "REVENUE" | "EXPENSE",
) {
  return prisma.financeCategory.findMany({
    where: {
      organizationId,
      ...(type ? { type } : {}),
    },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(
  organizationId: string,
  data: { name: string; type: "REVENUE" | "EXPENSE"; color: string },
) {
  return prisma.financeCategory.create({
    data: { organizationId, ...data },
  });
}

export async function updateCategory(
  id: string,
  organizationId: string,
  data: { name?: string; color?: string },
) {
  return prisma.financeCategory.update({
    where: { id, organizationId },
    data,
  });
}

export async function deleteCategory(id: string, organizationId: string) {
  return prisma.financeCategory.delete({
    where: { id, organizationId },
  });
}

export async function createTransaction(
  organizationId: string,
  data: Omit<Prisma.TransactionUncheckedCreateInput, "organizationId">,
) {
  const created = await prisma.transaction.create({
    data: { organizationId, ...data },
  });

  if (
    data.commissionRate &&
    data.professionalId &&
    Number(data.commissionRate) > 0
  ) {
    const commissionAmount = Number(data.amount) * Number(data.commissionRate);
    await prisma.commission.create({
      data: {
        organizationId,
        transactionId: created.id,
        professionalId: data.professionalId,
        rate: data.commissionRate,
        amount: commissionAmount,
        status: "PENDING",
      },
    });
  }

  return created;
}

export async function updateTransaction(
  id: string,
  organizationId: string,
  data: Prisma.TransactionUpdateInput,
) {
  return prisma.transaction.update({
    where: { id, organizationId },
    data,
  });
}

export async function deleteTransaction(id: string, organizationId: string) {
  return prisma.transaction.delete({
    where: { id, organizationId },
  });
}

export async function listCommissions(
  organizationId: string,
  status?: "PENDING" | "PAID",
): Promise<CommissionWithProfessional[]> {
  return prisma.commission.findMany({
    where: {
      organizationId,
      ...(status ? { status } : {}),
    },
    include: {
      professional: { select: { id: true, name: true } },
      transaction: { select: { id: true, description: true, amount: true, date: true } },
    },
    orderBy: { createdAt: "desc" },
  }) as Promise<CommissionWithProfessional[]>;
}

export async function payCommissions(
  commissionIds: string[],
  organizationId: string,
) {
  return prisma.commission.updateMany({
    where: {
      id: { in: commissionIds },
      organizationId,
      status: "PENDING",
    },
    data: {
      status: "PAID",
      paidAt: new Date(),
    },
  });
}

export async function listProfessionals(organizationId: string) {
  return prisma.professional.findMany({
    where: { organizationId, active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function listPatients(organizationId: string, search?: string) {
  const where: Prisma.PatientWhereInput = {
    organizationId,
    status: "active",
    ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
  };

  return prisma.patient.findMany({
    where,
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: 50,
  });
}
