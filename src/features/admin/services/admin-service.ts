"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  inviteMemberSchema,
  updateMemberSchema,
  specialtyCreateSchema,
  roomCreateSchema,
  professionalCreateSchema,
  organizationUpdateSchema,
} from "@/lib/validations/organization";
import type { z } from "zod";

type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
type SpecialtyInput = z.infer<typeof specialtyCreateSchema>;
type RoomInput = z.infer<typeof roomCreateSchema>;
type ProfessionalInput = z.infer<typeof professionalCreateSchema>;
type OrgSettingsInput = z.infer<typeof organizationUpdateSchema>;

// ── Members ──────────────────────────────────────────────────

export async function listMembers(organizationId: string) {
  return prisma.organizationMember.findMany({
    where: { organizationId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function inviteMember(organizationId: string, data: InviteMemberInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new Error("Usuário não encontrado. O convite requer um cadastro existente.");
  }

  const existing = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId: user.id } },
  });
  if (existing) {
    throw new Error("Este usuário já é membro da organização.");
  }

  return prisma.organizationMember.create({
    data: {
      organizationId,
      userId: user.id,
      role: data.role,
      status: "ACTIVE",
    },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });
}

export async function updateMemberRole(
  organizationId: string,
  memberId: string,
  data: { role: UpdateMemberInput["role"]; status?: UpdateMemberInput["status"] },
) {
  return prisma.organizationMember.update({
    where: { id: memberId, organizationId },
    data: {
      role: data.role,
      ...(data.status && { status: data.status }),
    },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });
}

export async function removeMember(organizationId: string, memberId: string) {
  const member = await prisma.organizationMember.findFirst({
    where: { id: memberId, organizationId },
  });
  if (!member) throw new Error("Membro não encontrado.");
  if (member.role === "OWNER") throw new Error("Não é possível remover o proprietário.");

  return prisma.organizationMember.delete({ where: { id: memberId } });
}

// ── Specialties ──────────────────────────────────────────────

export async function listSpecialties(organizationId: string) {
  return prisma.specialty.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}

export async function createSpecialty(organizationId: string, data: SpecialtyInput) {
  return prisma.specialty.create({
    data: {
      organizationId,
      name: data.name,
      color: data.color,
      durationMinutes: data.durationMinutes,
    },
  });
}

export async function updateSpecialty(
  organizationId: string,
  id: string,
  data: Partial<SpecialtyInput> & { active?: boolean },
) {
  return prisma.specialty.update({
    where: { id, organizationId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.durationMinutes !== undefined && { durationMinutes: data.durationMinutes }),
      ...(data.active !== undefined && { active: data.active }),
    },
  });
}

export async function deleteSpecialty(organizationId: string, id: string) {
  return prisma.specialty.delete({ where: { id, organizationId } });
}

// ── Rooms ────────────────────────────────────────────────────

export async function listRooms(organizationId: string) {
  return prisma.room.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}

export async function createRoom(organizationId: string, data: RoomInput) {
  return prisma.room.create({
    data: {
      organizationId,
      name: data.name,
      color: data.color,
    },
  });
}

export async function updateRoom(
  organizationId: string,
  id: string,
  data: Partial<RoomInput> & { active?: boolean },
) {
  return prisma.room.update({
    where: { id, organizationId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.active !== undefined && { active: data.active }),
    },
  });
}

export async function deleteRoom(organizationId: string, id: string) {
  return prisma.room.delete({ where: { id, organizationId } });
}

// ── Professionals ────────────────────────────────────────────

export async function listProfessionals(organizationId: string) {
  return prisma.professional.findMany({
    where: { organizationId },
    include: { specialty: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createProfessional(organizationId: string, data: ProfessionalInput) {
  return prisma.professional.create({
    data: {
      organizationId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      documentNumber: data.documentNumber || null,
      specialtyId: data.specialtyId || null,
      color: data.color,
      commissionRate: data.commissionRate,
    },
    include: { specialty: { select: { id: true, name: true } } },
  });
}

export async function updateProfessional(
  organizationId: string,
  id: string,
  data: Partial<ProfessionalInput> & { active?: boolean },
) {
  return prisma.professional.update({
    where: { id, organizationId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.documentNumber !== undefined && { documentNumber: data.documentNumber || null }),
      ...(data.specialtyId !== undefined && { specialtyId: data.specialtyId || null }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.commissionRate !== undefined && { commissionRate: data.commissionRate }),
      ...(data.active !== undefined && { active: data.active }),
    },
    include: { specialty: { select: { id: true, name: true } } },
  });
}

export async function deleteProfessional(organizationId: string, id: string) {
  return prisma.professional.delete({ where: { id, organizationId } });
}

// ── Organization Settings ────────────────────────────────────

export async function getOrganization(id: string) {
  return prisma.organization.findUnique({ where: { id } });
}

export async function updateOrganizationSettings(
  id: string,
  data: OrgSettingsInput,
) {
  const current = await prisma.organization.findUnique({ where: { id } });
  if (!current) throw new Error("Organização não encontrada.");

  const currentSettings = (current.settings as Record<string, unknown>) ?? {};
  const newSettings = data.settings
    ? { ...currentSettings, ...data.settings }
    : currentSettings;

  return prisma.organization.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.cnpj !== undefined && { cnpj: data.cnpj || null }),
      ...(data.primaryColor !== undefined && { primaryColor: data.primaryColor }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl || null }),
      settings: newSettings as Prisma.InputJsonValue,
    },
  });
}
