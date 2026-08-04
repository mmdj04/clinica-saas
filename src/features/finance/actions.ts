"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";
import {
  transactionCreateSchema,
  transactionUpdateSchema,
  financeCategorySchema,
  commissionPaySchema,
} from "@/lib/validations/finance";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createCategory,
  updateCategory,
  deleteCategory,
  payCommissions,
} from "@/features/finance/services/finance-service";
import { isDemo } from "@/lib/demo";

async function getOrganizationId() {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;
  if (isDemo) {
    return { userId, organizationId: "demo-org-001" };
  }
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    select: { organizationId: true },
  });
  if (!membership) throw new Error("NO_ORGANIZATION");
  return { userId, organizationId: membership.organizationId };
}

export async function createTransactionAction(input: {
  type: "REVENUE" | "EXPENSE";
  categoryId?: string;
  amount: number;
  paymentMethod?: string;
  status?: string;
  date: string;
  dueDate?: string;
  description: string;
  reference?: string;
  patientId?: string;
  professionalId?: string;
  commissionRate?: number;
  notes?: string;
}) {
  const { organizationId } = await getOrganizationId();

  const parsed = transactionCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors,
      message: "Corrija os erros.",
    };
  }

  const data = parsed.data;

  const transaction = await createTransaction(organizationId, {
    type: data.type,
    amount: data.amount,
    paymentMethod: data.paymentMethod as never,
    status: data.status as never,
    date: new Date(data.date),
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    description: data.description,
    reference: data.reference || undefined,
    notes: data.notes || undefined,
    commissionRate: data.commissionRate ?? undefined,
    categoryId: data.categoryId || undefined,
    patientId: data.patientId || undefined,
    professionalId: data.professionalId || undefined,
  });

  await recordAudit({
    action: "finance.transaction.create",
    entityType: "Transaction",
    entityId: transaction.id,
    metadata: { type: data.type, amount: data.amount },
  });

  revalidatePath("/app/financeiro");
  return { success: true, id: transaction.id };
}

export async function updateTransactionAction(
  id: string,
  input: {
    type?: "REVENUE" | "EXPENSE";
    categoryId?: string;
    amount?: number;
    paymentMethod?: string;
    status?: string;
    date?: string;
    dueDate?: string;
    description?: string;
    reference?: string;
    patientId?: string;
    professionalId?: string;
    commissionRate?: number;
    notes?: string;
  },
) {
  const { organizationId } = await getOrganizationId();

  const parsed = transactionUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors,
      message: "Corrija os erros.",
    };
  }

  const data = parsed.data;

  await updateTransaction(id, organizationId, {
    ...(data.type ? { type: data.type } : {}),
    ...(data.amount !== undefined ? { amount: data.amount } : {}),
    ...(data.paymentMethod
      ? { paymentMethod: data.paymentMethod as never }
      : {}),
    ...(data.status ? { status: data.status as never } : {}),
    ...(data.date ? { date: new Date(data.date) } : {}),
    ...(data.dueDate !== undefined
      ? { dueDate: data.dueDate ? new Date(data.dueDate) : null }
      : {}),
    ...(data.description ? { description: data.description } : {}),
    ...(data.reference !== undefined ? { reference: data.reference || null } : {}),
    ...(data.notes !== undefined ? { notes: data.notes || null } : {}),
    ...(data.commissionRate !== undefined
      ? { commissionRate: data.commissionRate }
      : {}),
    ...(data.categoryId !== undefined
      ? data.categoryId
        ? { category: { connect: { id: data.categoryId } } }
        : { category: { disconnect: true } }
      : {}),
    ...(data.patientId !== undefined
      ? data.patientId
        ? { patient: { connect: { id: data.patientId } } }
        : { patient: { disconnect: true } }
      : {}),
    ...(data.professionalId !== undefined
      ? data.professionalId
        ? { professional: { connect: { id: data.professionalId } } }
        : { professional: { disconnect: true } }
      : {}),
  });

  await recordAudit({
    action: "finance.transaction.update",
    entityType: "Transaction",
    entityId: id,
  });

  revalidatePath("/app/financeiro");
  return { success: true };
}

export async function deleteTransactionAction(id: string) {
  const { organizationId } = await getOrganizationId();

  await deleteTransaction(id, organizationId);

  await recordAudit({
    action: "finance.transaction.delete",
    entityType: "Transaction",
    entityId: id,
  });

  revalidatePath("/app/financeiro");
  return { success: true };
}

export async function createCategoryAction(input: {
  name: string;
  type: "REVENUE" | "EXPENSE";
  color?: string;
}) {
  const { organizationId } = await getOrganizationId();

  const parsed = financeCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors,
      message: "Corrija os erros.",
    };
  }

  const category = await createCategory(organizationId, {
    name: parsed.data.name,
    type: parsed.data.type,
    color: parsed.data.color,
  });

  await recordAudit({
    action: "finance.category.create",
    entityType: "FinanceCategory",
    entityId: category.id,
  });

  revalidatePath("/app/financeiro");
  return { success: true, id: category.id };
}

export async function updateCategoryAction(
  id: string,
  input: { name?: string; color?: string },
) {
  const { organizationId } = await getOrganizationId();

  await updateCategory(id, organizationId, input);

  await recordAudit({
    action: "finance.category.update",
    entityType: "FinanceCategory",
    entityId: id,
  });

  revalidatePath("/app/financeiro");
  return { success: true };
}

export async function deleteCategoryAction(id: string) {
  const { organizationId } = await getOrganizationId();

  await deleteCategory(id, organizationId);

  await recordAudit({
    action: "finance.category.delete",
    entityType: "FinanceCategory",
    entityId: id,
  });

  revalidatePath("/app/financeiro");
  return { success: true };
}

export async function payCommissionsAction(commissionIds: string[]) {
  const { organizationId } = await getOrganizationId();

  const parsed = commissionPaySchema.safeParse({ commissionIds });
  if (!parsed.success) {
    return { message: "Selecione ao menos uma comissão." };
  }

  await payCommissions(commissionIds, organizationId);

  await recordAudit({
    action: "finance.commission.pay",
    entityType: "Commission",
    metadata: { count: commissionIds.length },
  });

  revalidatePath("/app/financeiro");
  return { success: true };
}
