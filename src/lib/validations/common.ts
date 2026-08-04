import { z } from "zod";

const phoneRegex = /^\(?[1-9]{2}\)?\s?\d{4,5}-?\d{4}$/;
const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
const cepRegex = /^\d{5}-?\d{3}$/;

export const emailSchema = z
  .string()
  .email("E-mail inválido")
  .max(255)
  .transform((v) => v.toLowerCase().trim());

export const phoneSchema = z
  .string()
  .trim()
  .regex(phoneRegex, "Telefone inválido")
  .optional()
  .or(z.literal(""));

export const cpfSchema = z
  .string()
  .trim()
  .regex(cpfRegex, "CPF inválido")
  .optional()
  .or(z.literal(""));

export const cepSchema = z
  .string()
  .trim()
  .regex(cepRegex, "CEP inválido")
  .optional()
  .or(z.literal(""));

export const dateSchema = z
  .string()
  .datetime({ offset: true, message: "Data inválida" })
  .or(z.string().min(1, "Data obrigatória"));

export const idSchema = z.string().cuid().or(z.string().min(8));

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().trim().max(200).default(""),
  sortBy: z.string().trim().default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});