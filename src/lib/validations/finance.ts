import { z } from "zod";

export const transactionCreateSchema = z.object({
  type: z.enum(["REVENUE", "EXPENSE"]),
  categoryId: z.string().optional().or(z.literal("")),
  amount: z.coerce.number().positive("Valor deve ser maior que zero").max(100_000_000),
  paymentMethod: z
    .enum(["PIX", "CARD", "CASH", "TRANSFER", "OTHER", "HEALTH_PLAN"])
    .default("OTHER"),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]).default("PENDING"),
  date: z.string().datetime({ offset: true, message: "Data inválida" }),
  dueDate: z.string().datetime({ offset: true }).optional().or(z.literal("")),
  description: z.string().trim().min(1, "Descrição obrigatória").max(300),
  reference: z.string().trim().max(100).optional().or(z.literal("")),
  appointmentId: z.string().optional().or(z.literal("")),
  patientId: z.string().optional().or(z.literal("")),
  professionalId: z.string().optional().or(z.literal("")),
  commissionRate: z.coerce.number().min(0).max(1).optional(),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const transactionUpdateSchema = transactionCreateSchema.partial();

export const transactionListSchema = z.object({
  from: z.string().datetime({ offset: true }),
  to: z.string().datetime({ offset: true }),
  type: z.enum(["REVENUE", "EXPENSE"]).optional(),
  status: z.string().optional(),
  categoryId: z.string().optional(),
  professionalId: z.string().optional(),
  patientId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const financeCategorySchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(100),
  type: z.enum(["REVENUE", "EXPENSE"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#64748b"),
});

export const commissionPaySchema = z.object({
  commissionIds: z.array(z.string().min(1)).min(1, "Selecione ao menos uma comissão"),
});

export type TransactionCreateInput = z.infer<typeof transactionCreateSchema>;