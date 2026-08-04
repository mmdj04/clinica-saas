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
import { isDemo, demoPatients } from "@/lib/demo";

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
  if (isDemo) {
    let filtered = demoPatients.filter((p) => p.status === "active");
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.cpf?.includes(q) ||
          p.phone?.includes(q) ||
          p.email?.toLowerCase().includes(q),
      );
    }
    return filtered.map((p) => ({
      id: p.id,
      name: p.name,
      cpf: p.cpf,
      phone: p.phone,
      photoUrl: null,
      status: p.status,
    }));
  }

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
  if (isDemo) {
    const p = demoPatients.find((dp) => dp.id === patientId);
    if (!p) return null;
    return {
      id: p.id,
      name: p.name,
      photoUrl: null,
      cpf: p.cpf,
      phone: p.phone,
      email: p.email,
      birthDate: p.birthDate ? new Date(p.birthDate) : null,
      lastVisit: new Date(),
      totalAppointments: 5,
    };
  }

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
  if (isDemo) {
    return {
      id: "anam-1",
      organizationId: "demo-org-001",
      patientId,
      professionalId: "pr-1",
      content: {
        chiefComplaint: "Dor de cabeça há 3 dias",
        historyOfPresentIllness: "Paciente relata cefaleia tensional",
        pastHistory: "Hipertensão arterial",
        allergies: "Nenhuma",
        medications: "Losartana 50mg",
      },
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      professional: { id: "pr-1", name: "Dra. Maria Silva" },
    };
  }

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
  if (isDemo) {
    return [
      {
        id: "evo-1",
        organizationId: "demo-org-001",
        patientId,
        appointmentId: null,
        professionalId: "pr-1",
        type: "INITIAL",
        content: "Primeira consulta: paciente relata cefaleia tensional há 3 dias. Exame físico normal. PA 130x85mmHg.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        professional: { id: "pr-1", name: "Dra. Maria Silva" },
      },
      {
        id: "evo-2",
        organizationId: "demo-org-001",
        patientId,
        appointmentId: null,
        professionalId: "pr-1",
        type: "EVOLUTION",
        content: "Retorno: melhora dos sintomas. Manter medicação atual. Retornar em 15 dias.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        professional: { id: "pr-1", name: "Dra. Maria Silva" },
      },
    ];
  }

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
  if (isDemo) {
    return [
      {
        id: "rx-1",
        organizationId: "demo-org-001",
        patientId,
        professionalId: "pr-1",
        items: [
          { medicine: "Losartana", dosage: "50mg", frequency: "1x ao dia", duration: "30 dias" },
          { medicine: "Dipirona", dosage: "500mg", frequency: "6/6h se dor", duration: "5 dias" },
        ],
        guidelines: "Evitar esforço físico. Retornar em 15 dias.",
        validDays: 10,
        issuedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        professional: { id: "pr-1", name: "Dra. Maria Silva" },
      },
    ];
  }

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
  if (isDemo) {
    return [
      {
        id: "exam-1",
        organizationId: "demo-org-001",
        patientId,
        professionalId: "pr-1",
        name: "Hemograma completo",
        category: "laboratorial",
        fileUrl: null,
        orderedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        resultDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        summary: "Resultados dentro dos limites normais",
        status: "delivered",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        professional: { id: "pr-1", name: "Dra. Maria Silva" },
      },
    ];
  }

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
