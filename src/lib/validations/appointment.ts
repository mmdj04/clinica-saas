import { z } from "zod";

export const appointmentCreateSchema = z.object({
  patientId: z.string().min(1, "Paciente obrigatório"),
  professionalId: z.string().min(1, "Profissional obrigatório"),
  roomId: z.string().optional().or(z.literal("")),
  specialtyId: z.string().optional().or(z.literal("")),
  startAt: z.string().datetime({ offset: true, message: "Data/hora inválida" }),
  endAt: z.string().datetime({ offset: true, message: "Data/hora inválida" }),
  status: z
    .enum(["SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"])
    .default("SCHEDULED"),
  type: z.enum(["FIRST_VISIT", "RETURN", "EXAM", "FOLLOW_UP"]).default("RETURN"),
  price: z.coerce.number().min(0).max(1_000_000).default(0),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const appointmentUpdateSchema = appointmentCreateSchema.partial();

export const appointmentRescheduleSchema = z.object({
  startAt: z.string().datetime({ offset: true, message: "Data/hora inválida" }),
  endAt: z.string().datetime({ offset: true, message: "Data/hora inválida" }),
});

export const appointmentCancelSchema = z.object({
  reason: z.string().trim().min(1, "Informe o motivo do cancelamento").max(500),
});

export const appointmentListSchema = z.object({
  from: z.string().datetime({ offset: true }),
  to: z.string().datetime({ offset: true }),
  professionalId: z.string().optional(),
  roomId: z.string().optional(),
  specialtyId: z.string().optional(),
  status: z.string().optional(),
});

export const waitlistCreateSchema = z.object({
  patientId: z.string().min(1, "Paciente obrigatório"),
  professionalId: z.string().optional().or(z.literal("")),
  specialtyId: z.string().optional().or(z.literal("")),
  preferredDate: z.string().datetime({ offset: true }).optional().or(z.literal("")),
  priority: z.coerce.number().int().min(1).max(5).default(1),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;
export type AppointmentUpdateInput = z.infer<typeof appointmentUpdateSchema>;