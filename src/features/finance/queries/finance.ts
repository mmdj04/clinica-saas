"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { subMonths } from "date-fns";
import {
  listTransactions,
  getTransactionSummary,
  getCategoryBreakdown,
  getMonthlyData,
  listCategories,
  listCommissions,
  listProfessionals,
} from "@/features/finance/services/finance-service";

export function useTransactionSummary(organizationId: string, range: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ["finance", "summary", organizationId, range.from.toISOString(), range.to.toISOString()],
    queryFn: () => {
      const prevFrom = subMonths(range.from, 1);
      const prevTo = subMonths(range.to, 1);
      return getTransactionSummary(organizationId, range, {
        from: prevFrom,
        to: prevTo,
      });
    },
    staleTime: 60_000,
  });
}

export function useTransactions(
  organizationId: string,
  range: { from: Date; to: Date },
  filters?: {
    type?: "REVENUE" | "EXPENSE";
    status?: string;
    categoryId?: string;
    professionalId?: string;
  },
  pagination?: { page: number; limit: number },
) {
  return useQuery({
    queryKey: [
      "finance",
      "transactions",
      organizationId,
      range.from.toISOString(),
      range.to.toISOString(),
      filters,
      pagination,
    ],
    queryFn: () =>
      listTransactions(organizationId, range, filters, pagination),
    staleTime: 30_000,
  });
}

export function useCategoryBreakdown(
  organizationId: string,
  range: { from: Date; to: Date },
  type?: "REVENUE" | "EXPENSE",
) {
  return useQuery({
    queryKey: [
      "finance",
      "categories",
      "breakdown",
      organizationId,
      range.from.toISOString(),
      range.to.toISOString(),
      type,
    ],
    queryFn: () => getCategoryBreakdown(organizationId, range, type),
    staleTime: 60_000,
  });
}

export function useMonthlyData(organizationId: string, months = 6) {
  return useQuery({
    queryKey: ["finance", "monthly", organizationId, months],
    queryFn: () => getMonthlyData(organizationId, months),
    staleTime: 60_000,
  });
}

export function useCategories(
  organizationId: string,
  type?: "REVENUE" | "EXPENSE",
) {
  return useQuery({
    queryKey: ["finance", "categories", organizationId, type],
    queryFn: () => listCategories(organizationId, type),
    staleTime: 120_000,
  });
}

export function useCommissions(
  organizationId: string,
  status?: "PENDING" | "PAID",
) {
  return useQuery({
    queryKey: ["finance", "commissions", organizationId, status],
    queryFn: () => listCommissions(organizationId, status),
    staleTime: 30_000,
  });
}

export function useProfessionals(organizationId: string) {
  return useQuery({
    queryKey: ["finance", "professionals", organizationId],
    queryFn: () => listProfessionals(organizationId),
    staleTime: 120_000,
  });
}

export function useInvalidateFinance() {
  const qc = useQueryClient();
  return {
    transactions: () =>
      qc.invalidateQueries({ queryKey: ["finance", "transactions"] }),
    summary: () =>
      qc.invalidateQueries({ queryKey: ["finance", "summary"] }),
    categories: () =>
      qc.invalidateQueries({ queryKey: ["finance", "categories"] }),
    commissions: () =>
      qc.invalidateQueries({ queryKey: ["finance", "commissions"] }),
    monthly: () =>
      qc.invalidateQueries({ queryKey: ["finance", "monthly"] }),
    all: () =>
      qc.invalidateQueries({ queryKey: ["finance"] }),
  };
}
