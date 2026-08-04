import { z } from "zod";
import { emailSchema, phoneSchema } from "./common";

export const organizationCreateSchema = z.object({
  name: z.string().trim().min(2, "Nome da clínica obrigatório").max(200),
  slug: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug inválido (apenas minúsculas, números e hífen)")
    .optional(),
  cnpj: z
    .string()
    .trim()
    .regex(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/, "CNPJ inválido")
    .optional()
    .or(z.literal("")),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#7c3aed"),
});

export const organizationUpdateSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  cnpj: z.string().trim().max(20).optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  plan: z.string().max(50).optional(),
  status: z.enum(["active", "suspended"]).optional(),
  settings: z
    .object({
      workingHours: z
        .object({
          start: z.string().regex(/^\d{2}:\d{2}$/),
          end: z.string().regex(/^\d{2}:\d{2}$/),
        })
        .optional(),
      slotMinutes: z.coerce.number().int().min(5).max(240).optional(),
      weekdays: z.array(z.number().int().min(0).max(6)).optional(),
      currency: z.string().max(10).optional(),
      locale: z.string().max(10).optional(),
      timezone: z.string().max(50).optional(),
    })
    .passthrough()
    .optional(),
});

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(["OWNER", "ADMIN", "STAFF", "RECEPTION", "READONLY"]),
  name: z.string().trim().min(2).max(200).optional(),
});

export const updateMemberSchema = z.object({
  memberId: z.string().min(1),
  role: z.enum(["OWNER", "ADMIN", "STAFF", "RECEPTION", "READONLY"]),
  status: z.enum(["ACTIVE", "INVITED", "SUSPENDED"]).optional(),
});

export const professionalCreateSchema = z.object({
  name: z.string().trim().min(2, "Nome obrigatório").max(200),
  email: emailSchema.optional().or(z.literal("")),
  phone: phoneSchema,
  documentNumber: z.string().trim().max(30).optional().or(z.literal("")),
  specialtyId: z.string().optional().or(z.literal("")),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#f59e0b"),
  commissionRate: z.coerce.number().min(0).max(1).default(0),
});

export const specialtyCreateSchema = z.object({
  name: z.string().trim().min(2, "Nome obrigatório").max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#7c3aed"),
  durationMinutes: z.coerce.number().int().min(5).max(600).default(30),
});

export const roomCreateSchema = z.object({
  name: z.string().trim().min(2, "Nome obrigatório").max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#0ea5e9"),
});

export type OrganizationUpdateInput = z.infer<typeof organizationUpdateSchema>;