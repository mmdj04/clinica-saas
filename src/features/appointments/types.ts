import type {
  Appointment,
  Patient,
  Professional,
  Room,
  Specialty,
  WaitingListEntry,
} from "@prisma/client";

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type AppointmentType = "FIRST_VISIT" | "RETURN" | "EXAM" | "FOLLOW_UP";

export type ViewMode = "daily" | "weekly" | "monthly";

export interface AppointmentWithRelations extends Appointment {
  patient: Pick<Patient, "id" | "name" | "phone">;
  professional: Pick<Professional, "id" | "name" | "color">;
  room: Pick<Room, "id" | "name"> | null;
  specialty: Pick<Specialty, "id" | "name" | "color"> | null;
}

export interface WaitingListEntryWithRelations extends WaitingListEntry {
  patient: Pick<Patient, "id" | "name" | "phone">;
  professional: Pick<Professional, "id" | "name"> | null;
  specialty: Pick<Specialty, "id" | "name"> | null;
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Agendado",
  CONFIRMED: "Confirmado",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  NO_SHOW: "Não compareceu",
};

export const STATUS_VARIANT: Record<
  AppointmentStatus,
  "info" | "success" | "warning" | "default" | "danger"
> = {
  SCHEDULED: "info",
  CONFIRMED: "success",
  IN_PROGRESS: "warning",
  COMPLETED: "default",
  CANCELLED: "danger",
  NO_SHOW: "danger",
};

export const TYPE_LABELS: Record<AppointmentType, string> = {
  FIRST_VISIT: "Primeira consulta",
  RETURN: "Retorno",
  EXAM: "Exame",
  FOLLOW_UP: "Acompanhamento",
};

export const WAITLIST_STATUS_LABELS: Record<string, string> = {
  waiting: "Aguardando",
  contacted: "Contato realizado",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

export const HOURS_RANGE = Array.from({ length: 11 }, (_, i) => i + 8);
