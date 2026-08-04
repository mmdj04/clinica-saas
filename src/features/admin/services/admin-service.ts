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
import { isDemo } from "@/lib/demo";

type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
type SpecialtyInput = z.infer<typeof specialtyCreateSchema>;
type RoomInput = z.infer<typeof roomCreateSchema>;
type ProfessionalInput = z.infer<typeof professionalCreateSchema>;
type OrgSettingsInput = z.infer<typeof organizationUpdateSchema>;

// ── Members ──────────────────────────────────────────────────

const demoMembers = [
  { id: "mem-1", organizationId: "demo-org-001", userId: "u-1", role: "OWNER" as const, status: "ACTIVE" as const, createdAt: new Date(), updatedAt: new Date(), user: { id: "u-1", name: "Dr. Admin", email: "admin@clinica.com", image: null } },
  { id: "mem-2", organizationId: "demo-org-001", userId: "u-2", role: "PROFESSIONAL" as const, status: "ACTIVE" as const, createdAt: new Date(), updatedAt: new Date(), user: { id: "u-2", name: "Dra. Maria Silva", email: "maria@clinica.com", image: null } },
  { id: "mem-3", organizationId: "demo-org-001", userId: "u-3", role: "SECRETARY" as const, status: "ACTIVE" as const, createdAt: new Date(), updatedAt: new Date(), user: { id: "u-3", name: "Ana Recepcionista", email: "ana@clinica.com", image: null } },
];

export async function listMembers(organizationId: string) {
  if (isDemo) return demoMembers;
  return prisma.organizationMember.findMany({
    where: { organizationId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function findUserByEmail(email: string) {
  if (isDemo) return { id: "u-new", name: "Usuário Demo", email, image: null };
  return prisma.user.findUnique({ where: { email } });
}

export async function inviteMember(organizationId: string, data: InviteMemberInput) {
  if (isDemo) {
    return { id: `mem-${Date.now()}`, organizationId, userId: "u-new", role: data.role, status: "ACTIVE" as const, createdAt: new Date(), user: { id: "u-new", name: "Usuário Demo", email: data.email, image: null } };
  }
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
  if (isDemo) {
    const m = demoMembers.find((m) => m.id === memberId);
    return { ...m, role: data.role, ...(data.status && { status: data.status }) } as any;
  }
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
  if (isDemo) {
    return { success: true };
  }
  const member = await prisma.organizationMember.findFirst({
    where: { id: memberId, organizationId },
  });
  if (!member) throw new Error("Membro não encontrado.");
  if (member.role === "OWNER") throw new Error("Não é possível remover o proprietário.");

  return prisma.organizationMember.delete({ where: { id: memberId } });
}

// ── Specialties ──────────────────────────────────────────────

const demoSpecialties = [
  { id: "sp-1", organizationId: "demo-org-001", name: "Clínico Geral", color: "#7c3aed", durationMinutes: 30, active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "sp-2", organizationId: "demo-org-001", name: "Dermatologia", color: "#0ea5e9", durationMinutes: 45, active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "sp-3", organizationId: "demo-org-001", name: "Psicologia", color: "#10b981", durationMinutes: 50, active: true, createdAt: new Date(), updatedAt: new Date() },
];

export async function listSpecialties(organizationId: string) {
  if (isDemo) return demoSpecialties;
  return prisma.specialty.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}

export async function createSpecialty(organizationId: string, data: SpecialtyInput) {
  if (isDemo) {
    return { id: `sp-${Date.now()}`, organizationId, name: data.name, color: data.color, durationMinutes: data.durationMinutes, active: true, createdAt: new Date(), updatedAt: new Date() };
  }
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
  if (isDemo) {
    const s = demoSpecialties.find((s) => s.id === id);
    return { ...s, ...(data.name && { name: data.name }), ...(data.color && { color: data.color }), ...(data.durationMinutes && { durationMinutes: data.durationMinutes }), ...(data.active !== undefined && { active: data.active }) } as any;
  }
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
  if (isDemo) return { success: true };
  return prisma.specialty.delete({ where: { id, organizationId } });
}

// ── Rooms ────────────────────────────────────────────────────

const demoRooms = [
  { id: "rm-1", organizationId: "demo-org-001", name: "Sala 1", color: "#7c3aed", active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "rm-2", organizationId: "demo-org-001", name: "Sala 2", color: "#0ea5e9", active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "rm-3", organizationId: "demo-org-001", name: "Enfermaria", color: "#10b981", active: true, createdAt: new Date(), updatedAt: new Date() },
];

export async function listRooms(organizationId: string) {
  if (isDemo) return demoRooms;
  return prisma.room.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}

export async function createRoom(organizationId: string, data: RoomInput) {
  if (isDemo) {
    return { id: `rm-${Date.now()}`, organizationId, name: data.name, color: data.color, active: true, createdAt: new Date(), updatedAt: new Date() };
  }
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
  if (isDemo) {
    const r = demoRooms.find((r) => r.id === id);
    return { ...r, ...(data.name && { name: data.name }), ...(data.color && { color: data.color }), ...(data.active !== undefined && { active: data.active }) } as any;
  }
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
  if (isDemo) return { success: true };
  return prisma.room.delete({ where: { id, organizationId } });
}

// ── Professionals ────────────────────────────────────────────

const demoProfessionals = [
  { id: "pr-1", organizationId: "demo-org-001", name: "Dra. Maria Silva", email: "maria@clinica.com", phone: "(11) 99999-1111", documentNumber: "12345678900", specialtyId: "sp-1", color: "#7c3aed", commissionRate: 0.1, active: true, createdAt: new Date(), updatedAt: new Date(), userId: null, specialty: { id: "sp-1", name: "Clínico Geral" } },
  { id: "pr-2", organizationId: "demo-org-001", name: "Dr. João Santos", email: "joao@clinica.com", phone: "(11) 99999-2222", documentNumber: "98765432100", specialtyId: "sp-2", color: "#0ea5e9", commissionRate: 0.15, active: true, createdAt: new Date(), updatedAt: new Date(), userId: null, specialty: { id: "sp-2", name: "Dermatologia" } },
];

export async function listProfessionals(organizationId: string) {
  if (isDemo) return demoProfessionals;
  return prisma.professional.findMany({
    where: { organizationId },
    include: { specialty: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createProfessional(organizationId: string, data: ProfessionalInput) {
  if (isDemo) {
    return { id: `pr-${Date.now()}`, organizationId, name: data.name, email: data.email || null, phone: data.phone || null, documentNumber: data.documentNumber || null, specialtyId: data.specialtyId || null, color: data.color, commissionRate: data.commissionRate, active: true, createdAt: new Date(), updatedAt: new Date(), userId: null, specialty: null } as any;
  }
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
  if (isDemo) {
    const p = demoProfessionals.find((p) => p.id === id);
    return { ...p, ...(data.name && { name: data.name }), ...(data.email && { email: data.email }), ...(data.color && { color: data.color }) } as any;
  }
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
  if (isDemo) return { success: true };
  return prisma.professional.delete({ where: { id, organizationId } });
}

// ── Organization Settings ────────────────────────────────────

const demoOrg = {
  id: "demo-org-001",
  name: "Clínica Saúde Total",
  slug: "clinica-saude-total",
  cnpj: "12.345.678/0001-90",
  logoUrl: null,
  primaryColor: "#7c3aed",
  settings: { workingHours: { start: "08:00", end: "18:00" }, workingDays: [1, 2, 3, 4, 5] },
  createdAt: new Date(),
};

export async function getOrganization(id: string) {
  if (isDemo) return demoOrg;
  return prisma.organization.findUnique({ where: { id } });
}

export async function updateOrganizationSettings(
  id: string,
  data: OrgSettingsInput,
) {
  if (isDemo) {
    return { ...demoOrg, ...(data.name && { name: data.name }), ...(data.cnpj !== undefined && { cnpj: data.cnpj }) } as any;
  }
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
