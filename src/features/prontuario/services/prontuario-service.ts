"use server";

import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/multi-tenancy";
import type {
  AnamnesisContent,
  PrescriptionItem,
  ExamStatus,
  AttachmentCategory,
  EvolutionType,
} from "../types";

function requireOrgId(): string {
  const tenant = getTenant();
  if (!tenant) throw new Error("UNAUTHENTICATED");
  return tenant.organizationId;
}

function requireUserId(): string {
  const tenant = getTenant();
  if (!tenant) throw new Error("UNAUTHENTICATED");
  return tenant.userId;
}

// ─── Patient Search ───────────────────────────────────────────

export async function searchPatients(query: string) {
  const organizationId = requireOrgId();
  const where: Record<string, unknown> = { organizationId, status: "active" };

  if (query.trim()) {
    const sanitized = query.trim();
    where.OR = [
      { name: { contains: sanitized, mode: "insensitive" } },
      { cpf: { contains: sanitized } },
      { phone: { contains: sanitized } },
      { email: { contains: sanitized, mode: "insensitive" } },
    ];
  }

  return prisma.patient.findMany({
    where,
    select: {
      id: true,
      name: true,
      cpf: true,
      phone: true,
      photoUrl: true,
      status: true,
    },
    orderBy: { name: "asc" },
    take: 20,
  });
}

export async function getPatientSummary(patientId: string) {
  const organizationId = requireOrgId();

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, organizationId },
    select: {
      id: true,
      name: true,
      photoUrl: true,
      cpf: true,
      phone: true,
      email: true,
      birthDate: true,
      gender: true,
      status: true,
    },
  });

  if (!patient) return null;

  const [totalVisits, lastAppointment] = await Promise.all([
    prisma.appointment.count({
      where: { patientId, organizationId, status: "COMPLETED" },
    }),
    prisma.appointment.findFirst({
      where: { patientId, organizationId, status: "COMPLETED" },
      orderBy: { startAt: "desc" },
      select: { startAt: true },
    }),
  ]);

  return {
    ...patient,
    totalVisits,
    lastVisit: lastAppointment?.startAt ?? null,
  };
}

// ─── Anamnesis ────────────────────────────────────────────────

export async function getAnamnesis(patientId: string) {
  const organizationId = requireOrgId();
  return prisma.anamnesis.findFirst({
    where: { patientId, organizationId },
    orderBy: { updatedAt: "desc" },
    include: { professional: { select: { id: true, name: true } } },
  });
}

export async function upsertAnamnesis(
  patientId: string,
  content: AnamnesisContent,
) {
  const organizationId = requireOrgId();
  const userId = requireUserId();

  const existing = await prisma.anamnesis.findFirst({
    where: { patientId, organizationId },
  });

  if (existing) {
    return prisma.anamnesis.update({
      where: { id: existing.id },
      data: {
        content: content as never,
        version: existing.version + 1,
      },
    });
  }

  return prisma.anamnesis.create({
    data: {
      organizationId,
      patientId,
      professionalId: userId,
      content: content as never,
    },
  });
}

// ─── Evolution ────────────────────────────────────────────────

export async function listEvolutions(patientId: string) {
  const organizationId = requireOrgId();
  return prisma.evolution.findMany({
    where: { patientId, organizationId },
    include: { professional: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createEvolution(data: {
  patientId: string;
  appointmentId?: string;
  type: EvolutionType;
  content: string;
}) {
  const organizationId = requireOrgId();
  const userId = requireUserId();

  return prisma.evolution.create({
    data: {
      organizationId,
      patientId: data.patientId,
      appointmentId: data.appointmentId || null,
      professionalId: userId,
      type: data.type,
      content: data.content,
    },
    include: { professional: { select: { id: true, name: true } } },
  });
}

// ─── Prescription ─────────────────────────────────────────────

export async function listPrescriptions(patientId: string) {
  const organizationId = requireOrgId();
  return prisma.prescription.findMany({
    where: { patientId, organizationId },
    include: { professional: { select: { id: true, name: true } } },
    orderBy: { issuedAt: "desc" },
  });
}

export async function createPrescription(data: {
  patientId: string;
  items: PrescriptionItem[];
  guidelines?: string;
  validDays?: number;
}) {
  const organizationId = requireOrgId();
  const userId = requireUserId();

  return prisma.prescription.create({
    data: {
      organizationId,
      patientId: data.patientId,
      professionalId: userId,
      items: data.items as never,
      guidelines: data.guidelines ?? "",
      validDays: data.validDays ?? 10,
    },
    include: { professional: { select: { id: true, name: true } } },
  });
}

// ─── Exam ─────────────────────────────────────────────────────

export async function listExams(patientId: string) {
  const organizationId = requireOrgId();
  return prisma.exam.findMany({
    where: { patientId, organizationId },
    include: { professional: { select: { id: true, name: true } } },
    orderBy: { orderedAt: "desc" },
  });
}

export async function createExam(data: {
  patientId: string;
  professionalId?: string;
  name: string;
  category?: string;
  orderedAt?: string;
  summary?: string;
  status?: ExamStatus;
}) {
  const organizationId = requireOrgId();
  const userId = requireUserId();

  return prisma.exam.create({
    data: {
      organizationId,
      patientId: data.patientId,
      professionalId: data.professionalId || userId,
      name: data.name,
      category: data.category ?? "",
      orderedAt: data.orderedAt ? new Date(data.orderedAt) : new Date(),
      summary: data.summary ?? "",
      status: data.status ?? "ordered",
    },
    include: { professional: { select: { id: true, name: true } } },
  });
}

// ─── Attachments ──────────────────────────────────────────────

export async function listAttachments(patientId: string) {
  const organizationId = requireOrgId();
  return prisma.attachment.findMany({
    where: { patientId, organizationId },
    include: { uploadedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAttachment(data: {
  patientId: string;
  appointmentId?: string;
  name: string;
  fileUrl: string;
  mimeType: string;
  size: number;
  category?: AttachmentCategory;
  notes?: string;
}) {
  const organizationId = requireOrgId();
  const userId = requireUserId();

  return prisma.attachment.create({
    data: {
      organizationId,
      patientId: data.patientId,
      appointmentId: data.appointmentId || null,
      uploadedById: userId,
      name: data.name,
      fileUrl: data.fileUrl,
      mimeType: data.mimeType,
      size: data.size,
      category: data.category ?? "OTHER",
      notes: data.notes ?? "",
    },
    include: { uploadedBy: { select: { id: true, name: true } } },
  });
}

// ─── Stats ────────────────────────────────────────────────────

export async function getPatientStats(patientId: string) {
  const organizationId = requireOrgId();

  const [totalVisits, totalEvolutions, totalPrescriptions, totalExams, totalAttachments] =
    await Promise.all([
      prisma.appointment.count({ where: { patientId, organizationId } }),
      prisma.evolution.count({ where: { patientId, organizationId } }),
      prisma.prescription.count({ where: { patientId, organizationId } }),
      prisma.exam.count({ where: { patientId, organizationId } }),
      prisma.attachment.count({ where: { patientId, organizationId } }),
    ]);

  return { totalVisits, totalEvolutions, totalPrescriptions, totalExams, totalAttachments };
}
