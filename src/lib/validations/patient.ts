import { z } from "zod";
import { emailSchema, phoneSchema, cpfSchema, cepSchema, dateSchema } from "./common";

export const patientCreateSchema = z.object({
  name: z.string().trim().min(2, "Nome é obrigatório").max(200),
  email: emailSchema.optional().or(z.literal("")),
  phone: phoneSchema,
  cpf: cpfSchema,
  rg: z.string().trim().max(30).optional().or(z.literal("")),
  birthDate: dateSchema.optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "NOT_INFORMED"]).default("NOT_INFORMED"),
  cep: cepSchema,
  address: z.string().trim().max(300).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  state: z
    .string()
    .trim()
    .max(2)
    .regex(/^[A-Z]{2}$/, "UF inválida")
    .optional()
    .or(z.literal("")),
  insuranceProvider: z.string().trim().max(100).optional().or(z.literal("")),
  insuranceNumber: z.string().trim().max(50).optional().or(z.literal("")),
  emergencyContact: z.string().trim().max(200).optional().or(z.literal("")),
  emergencyPhone: phoneSchema,
  responsibleName: z.string().trim().max(200).optional().or(z.literal("")),
  responsiblePhone: phoneSchema,
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  source: z.string().trim().max(100).optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "blocked"]).default("active"),
  tags: z.array(z.string()).max(20).default([]),
});

export const patientUpdateSchema = patientCreateSchema.partial();

export const patientSearchSchema = z.object({
  q: z.string().trim().max(200).default(""),
  tag: z.string().trim().optional(),
  status: z.enum(["active", "inactive", "blocked"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const patientTagSchema = z.object({
  name: z.string().trim().min(1, "Nome da tag obrigatório").max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida"),
});

export type PatientCreateInput = z.infer<typeof patientCreateSchema>;
export type PatientUpdateInput = z.infer<typeof patientUpdateSchema>;