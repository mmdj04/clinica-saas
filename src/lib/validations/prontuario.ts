import { z } from "zod";

export const evolutionCreateSchema = z.object({
  patientId: z.string().min(1, "Paciente obrigatório"),
  appointmentId: z.string().optional().or(z.literal("")),
  type: z
    .enum(["INITIAL", "EVOLUTION", "PROFESSIONAL_NOTE", "DISCHARGE"])
    .default("EVOLUTION"),
  content: z.string().trim().min(5, "Conteúdo muito curto").max(50_000),
});

export const anamnesisUpsertSchema = z.object({
  patientId: z.string().min(1),
  content: z
    .record(z.string(), z.unknown())
    .refine((v) => Object.keys(v).length > 0, "Anamnese vazia"),
});

export const prescriptionItemSchema = z.object({
  medicine: z.string().trim().min(1, "Medicamento obrigatório").max(200),
  dosage: z.string().trim().min(1, "Posologia obrigatória").max(300),
  frequency: z.string().trim().min(1, "Frequência obrigatória").max(200),
  duration: z.string().trim().max(100).default(""),
  observations: z.string().trim().max(500).default(""),
});

export const prescriptionCreateSchema = z.object({
  patientId: z.string().min(1),
  items: z.array(prescriptionItemSchema).min(1, "Adicione ao menos um item"),
  guidelines: z.string().trim().max(2000).default(""),
  validDays: z.coerce.number().int().min(1).max(365).default(10),
});

export const examCreateSchema = z.object({
  patientId: z.string().min(1),
  professionalId: z.string().optional().or(z.literal("")),
  name: z.string().trim().min(1, "Nome do exame obrigatório").max(200),
  category: z.string().trim().max(100).default(""),
  orderedAt: z.string().datetime({ offset: true }).optional().or(z.literal("")),
  summary: z.string().max(5000).default(""),
  status: z
    .enum(["ordered", "collected", "ready", "delivered"])
    .default("ordered"),
});

export const attachmentCreateSchema = z.object({
  patientId: z.string().min(1),
  category: z
    .enum(["DOCUMENT", "PHOTO", "EXTERNAL_REPORT", "EXAM", "RECEIPT", "OTHER"])
    .default("OTHER"),
  notes: z.string().max(500).default(""),
});

export type EvolutionCreateInput = z.infer<typeof evolutionCreateSchema>;
export type PrescriptionCreateInput = z.infer<typeof prescriptionCreateSchema>;