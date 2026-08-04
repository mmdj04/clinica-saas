"use server";

import { prisma } from "@/lib/prisma";
import type { PatientStatus } from "@/features/pacientes/types";
import type { Prisma } from "@prisma/client";
import { isDemo, demoPatients } from "@/lib/demo";

const patientInclude = {
  tags: {
    include: { tag: true },
  },
} satisfies Prisma.PatientInclude;

function formatPatient(raw: Prisma.PatientGetPayload<{ include: typeof patientInclude }>) {
  return {
    ...raw,
    tags: raw.tags.map((link) => ({
      id: link.tag.id,
      name: link.tag.name,
      color: link.tag.color,
    })),
  };
}

export async function listPatients(
  organizationId: string,
  params: {
    q?: string;
    status?: PatientStatus;
    tag?: string;
    page?: number;
    limit?: number;
  } = {},
) {
  const { q, status, tag, page = 1, limit = 20 } = params;

  if (isDemo) {
    let filtered = demoPatients.map((p) => ({
      ...p,
      organizationId,
      gender: "NOT_INFORMED" as const,
      photoUrl: null,
      cep: null,
      address: null,
      city: null,
      state: null,
      insuranceProvider: null,
      insuranceNumber: null,
      emergencyContact: null,
      emergencyPhone: null,
      responsibleName: null,
      responsiblePhone: null,
      notes: null,
      source: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: null,
      tags: [],
    }));

    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.phone?.includes(query) ||
          p.email?.toLowerCase().includes(query) ||
          p.cpf?.includes(query),
      );
    }
    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const items = filtered.slice((page - 1) * limit, page * limit);

    return { items, total, page, limit, totalPages };
  }
  const skip = (page - 1) * limit;

  const where: Prisma.PatientWhereInput = {
    organizationId,
    ...(status ? { status } : {}),
    ...(tag
      ? { tags: { some: { tag: { name: tag } } } }
      : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { email: { contains: q, mode: "insensitive" } },
            { cpf: { contains: q } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      include: patientInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.patient.count({ where }),
  ]);

  return {
    items: items.map(formatPatient),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getPatientById(organizationId: string, patientId: string) {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, organizationId },
    include: {
      ...patientInclude,
      _count: {
        select: {
          appointments: true,
          anamnesis: true,
          evolutions: true,
          prescriptions: true,
          exams: true,
          attachments: true,
        },
      },
      appointments: {
        orderBy: { startAt: "desc" },
        take: 5,
        include: {
          professional: { select: { name: true } },
        },
      },
    },
  });

  if (!patient) return null;

  const { appointments, ...rest } = patient;

  return {
    ...formatPatient(rest as typeof rest & { tags: typeof rest.tags }),
    _count: patient._count,
    recentAppointments: appointments.map((a: typeof appointments[number]) => ({
      id: a.id,
      startAt: a.startAt,
      endAt: a.endAt,
      status: a.status,
      professional: { name: a.professional.name },
    })),
  };
}

export async function createPatient(
  organizationId: string,
  createdById: string,
  data: {
    name: string;
    email?: string | null;
    phone?: string | null;
    cpf?: string | null;
    rg?: string | null;
    birthDate?: string | null;
    gender?: string;
    cep?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    insuranceProvider?: string | null;
    insuranceNumber?: string | null;
    emergencyContact?: string | null;
    emergencyPhone?: string | null;
    responsibleName?: string | null;
    responsiblePhone?: string | null;
    notes?: string | null;
    source?: string | null;
    status?: PatientStatus;
    tags?: string[];
  },
) {
  const tagIds = data.tags ?? [];

  return prisma.$transaction(async (tx) => {
    const patient = await tx.patient.create({
      data: {
        organizationId,
        createdById,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        cpf: data.cpf || null,
        rg: data.rg || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        gender: (data.gender as Prisma.EnumGenderFieldUpdateOperationsInput["set"]) ?? "NOT_INFORMED",
        cep: data.cep || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        insuranceProvider: data.insuranceProvider || null,
        insuranceNumber: data.insuranceNumber || null,
        emergencyContact: data.emergencyContact || null,
        emergencyPhone: data.emergencyPhone || null,
        responsibleName: data.responsibleName || null,
        responsiblePhone: data.responsiblePhone || null,
        notes: data.notes || null,
        source: data.source || null,
        status: data.status ?? "active",
      },
    });

    if (tagIds.length > 0) {
      await tx.patientTagLink.createMany({
        data: tagIds.map((tagId) => ({
          patientId: patient.id,
          tagId,
        })),
      });
    }

    return patient;
  });
}

export async function updatePatient(
  organizationId: string,
  patientId: string,
  data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    cpf?: string | null;
    rg?: string | null;
    birthDate?: string | null;
    gender?: string;
    cep?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    insuranceProvider?: string | null;
    insuranceNumber?: string | null;
    emergencyContact?: string | null;
    emergencyPhone?: string | null;
    responsibleName?: string | null;
    responsiblePhone?: string | null;
    notes?: string | null;
    source?: string | null;
    status?: PatientStatus;
    tags?: string[];
  },
) {
  const { tags: tagIds, ...patientData } = data;

  return prisma.$transaction(async (tx) => {
    const updateData: Prisma.PatientUpdateInput = {
      ...(patientData.name !== undefined && { name: patientData.name }),
      ...(patientData.email !== undefined && { email: patientData.email || null }),
      ...(patientData.phone !== undefined && { phone: patientData.phone || null }),
      ...(patientData.cpf !== undefined && { cpf: patientData.cpf || null }),
      ...(patientData.rg !== undefined && { rg: patientData.rg || null }),
      ...(patientData.birthDate !== undefined && {
        birthDate: patientData.birthDate ? new Date(patientData.birthDate) : null,
      }),
      ...(patientData.gender !== undefined && { gender: patientData.gender as Prisma.EnumGenderFieldUpdateOperationsInput["set"] }),
      ...(patientData.cep !== undefined && { cep: patientData.cep || null }),
      ...(patientData.address !== undefined && { address: patientData.address || null }),
      ...(patientData.city !== undefined && { city: patientData.city || null }),
      ...(patientData.state !== undefined && { state: patientData.state || null }),
      ...(patientData.insuranceProvider !== undefined && {
        insuranceProvider: patientData.insuranceProvider || null,
      }),
      ...(patientData.insuranceNumber !== undefined && {
        insuranceNumber: patientData.insuranceNumber || null,
      }),
      ...(patientData.emergencyContact !== undefined && {
        emergencyContact: patientData.emergencyContact || null,
      }),
      ...(patientData.emergencyPhone !== undefined && {
        emergencyPhone: patientData.emergencyPhone || null,
      }),
      ...(patientData.responsibleName !== undefined && {
        responsibleName: patientData.responsibleName || null,
      }),
      ...(patientData.responsiblePhone !== undefined && {
        responsiblePhone: patientData.responsiblePhone || null,
      }),
      ...(patientData.notes !== undefined && { notes: patientData.notes || null }),
      ...(patientData.source !== undefined && { source: patientData.source || null }),
      ...(patientData.status !== undefined && { status: patientData.status }),
    };

    const patient = await tx.patient.update({
      where: { id: patientId, organizationId },
      data: updateData,
    });

    if (tagIds !== undefined) {
      await tx.patientTagLink.deleteMany({ where: { patientId } });
      if (tagIds.length > 0) {
        await tx.patientTagLink.createMany({
          data: tagIds.map((tagId) => ({
            patientId,
            tagId,
          })),
        });
      }
    }

    return patient;
  });
}

export async function deletePatient(organizationId: string, patientId: string) {
  return prisma.patient.delete({
    where: { id: patientId, organizationId },
  });
}

export async function listPatientTags(organizationId: string) {
  return prisma.patientTag.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}

export async function createPatientTag(
  organizationId: string,
  data: { name: string; color: string },
) {
  return prisma.patientTag.create({
    data: {
      organizationId,
      name: data.name,
      color: data.color,
    },
  });
}

export async function deletePatientTag(organizationId: string, tagId: string) {
  return prisma.patientTag.delete({
    where: { id: tagId, organizationId },
  });
}
