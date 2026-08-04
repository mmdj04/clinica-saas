import type { Prisma } from "@prisma/client";

export type MemberWithUser = Prisma.OrganizationMemberGetPayload<{
  include: { user: { select: { id: true; name: true; email: true; image: true } } };
}>;

export type SpecialtyItem = Prisma.SpecialtyGetPayload<object>;

export type RoomItem = Prisma.RoomGetPayload<object>;

export type ProfessionalWithSpecialty = Prisma.ProfessionalGetPayload<{
  include: { specialty: { select: { id: true; name: true } } };
}>;

export type AuditLogWithActor = Prisma.AuditLogGetPayload<{
  include: { actor: { select: { id: true; name: true; email: true } } };
}>;

export interface OrganizationSettings {
  workingHours?: { start: string; end: string };
  slotMinutes?: number;
  weekdays?: number[];
  timezone?: string;
  locale?: string;
  currency?: string;
}
