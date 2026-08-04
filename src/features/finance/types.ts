import type { Transaction, FinanceCategory, Commission, Professional } from "@prisma/client";

export type TransactionWithRelations = Transaction & {
  category: Pick<FinanceCategory, "id" | "name" | "color"> | null;
  patient: { id: string; name: string } | null;
  professional: { id: string; name: string } | null;
  commissions: Commission[];
};

export type CommissionWithProfessional = Commission & {
  professional: Pick<Professional, "id" | "name">;
  transaction: Pick<Transaction, "id" | "description" | "amount" | "date">;
};

export type CategoryType = "REVENUE" | "EXPENSE";

export interface TransactionSummary {
  totalRevenue: number;
  totalExpenses: number;
  balance: number;
  pendingAmount: number;
  revenueTrend: number;
  expenseTrend: number;
}

export interface CategoryBreakdown {
  name: string;
  color: string;
  total: number;
  count: number;
}

export interface MonthlyData {
  month: string;
  receita: number;
  despesa: number;
}

export type PaymentMethod =
  | "PIX"
  | "CARD"
  | "CASH"
  | "TRANSFER"
  | "OTHER"
  | "HEALTH_PLAN";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: "PIX",
  CARD: "Cartão",
  CASH: "Dinheiro",
  TRANSFER: "Transferência",
  OTHER: "Outro",
  HEALTH_PLAN: "Plano de saúde",
};

export type TransactionStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  OVERDUE: "Atrasado",
  CANCELLED: "Cancelado",
};

export type TransactionType = "REVENUE" | "EXPENSE";

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  REVENUE: "Receita",
  EXPENSE: "Despesa",
};
