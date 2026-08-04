"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";
import {
  createPatient,
  updatePatient,
  deletePatient,
  createPatientTag,
  deletePatientTag,
  listPatients as listPatientsService,
} from "@/features/pacientes/services/paciente-service";
import type { PatientStatus } from "@/features/pacientes/types";
import { isDemo } from "@/lib/demo";

async function getMembership(userId: string) {
  if (isDemo) {
    return { organizationId: "demo-org-001", role: "OWNER" as const };
  }
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
  });
  return membership;
}

export async function createPatientAction(_prev: unknown, formData: FormData) {
  try {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;

    const membership = await getMembership(userId);
    if (!membership) {
      return { success: false as const, error: "Organização não encontrada." };
    }

    const tagsRaw = formData.get("tags");
    const tags = tagsRaw ? JSON.parse(tagsRaw as string) as string[] : [];

    const data = {
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      cpf: (formData.get("cpf") as string) || null,
      rg: (formData.get("rg") as string) || null,
      birthDate: (formData.get("birthDate") as string) || null,
      gender: (formData.get("gender") as string) || "NOT_INFORMED",
      cep: (formData.get("cep") as string) || null,
      address: (formData.get("address") as string) || null,
      city: (formData.get("city") as string) || null,
      state: (formData.get("state") as string) || null,
      insuranceProvider: (formData.get("insuranceProvider") as string) || null,
      insuranceNumber: (formData.get("insuranceNumber") as string) || null,
      emergencyContact: (formData.get("emergencyContact") as string) || null,
      emergencyPhone: (formData.get("emergencyPhone") as string) || null,
      responsibleName: (formData.get("responsibleName") as string) || null,
      responsiblePhone: (formData.get("responsiblePhone") as string) || null,
      notes: (formData.get("notes") as string) || null,
      source: (formData.get("source") as string) || null,
      status: (formData.get("status") as PatientStatus) || "active",
      tags,
    };

    const patient = await createPatient(membership.organizationId, userId, data);

    await recordAudit({
      action: "patient.create",
      entityType: "Patient",
      entityId: patient.id,
      metadata: { name: data.name },
    });

    revalidatePath("/app/pacientes");
    return { success: true as const, patientId: patient.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao criar paciente";
    return { success: false as const, error: message };
  }
}

export async function updatePatientAction(_prev: unknown, formData: FormData) {
  try {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const patientId = formData.get("patientId") as string;

    const membership = await getMembership(userId);
    if (!membership) {
      return { success: false as const, error: "Organização não encontrada." };
    }

    const tagsRaw = formData.get("tags");
    const tags = tagsRaw ? JSON.parse(tagsRaw as string) as string[] : [];

    const data = {
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      cpf: (formData.get("cpf") as string) || null,
      rg: (formData.get("rg") as string) || null,
      birthDate: (formData.get("birthDate") as string) || null,
      gender: (formData.get("gender") as string) || "NOT_INFORMED",
      cep: (formData.get("cep") as string) || null,
      address: (formData.get("address") as string) || null,
      city: (formData.get("city") as string) || null,
      state: (formData.get("state") as string) || null,
      insuranceProvider: (formData.get("insuranceProvider") as string) || null,
      insuranceNumber: (formData.get("insuranceNumber") as string) || null,
      emergencyContact: (formData.get("emergencyContact") as string) || null,
      emergencyPhone: (formData.get("emergencyPhone") as string) || null,
      responsibleName: (formData.get("responsibleName") as string) || null,
      responsiblePhone: (formData.get("responsiblePhone") as string) || null,
      notes: (formData.get("notes") as string) || null,
      source: (formData.get("source") as string) || null,
      status: (formData.get("status") as PatientStatus) || "active",
      tags,
    };

    await updatePatient(membership.organizationId, patientId, data);

    await recordAudit({
      action: "patient.update",
      entityType: "Patient",
      entityId: patientId,
      metadata: { name: data.name },
    });

    revalidatePath("/app/pacientes");
    revalidatePath(`/app/pacientes/${patientId}`);
    return { success: true as const };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao atualizar paciente";
    return { success: false as const, error: message };
  }
}

export async function deletePatientAction(patientId: string) {
  try {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;

    const membership = await getMembership(userId);
    if (!membership) {
      return { success: false as const, error: "Organização não encontrada." };
    }

    if (!isDemo) {
      const patient = await prisma.patient.findFirst({
        where: { id: patientId, organizationId: membership.organizationId },
        select: { name: true },
      });

      await deletePatient(membership.organizationId, patientId);

      await recordAudit({
        action: "patient.delete",
        entityType: "Patient",
        entityId: patientId,
        metadata: { name: patient?.name },
      });
    }

    revalidatePath("/app/pacientes");
    return { success: true as const };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao excluir paciente";
    return { success: false as const, error: message };
  }
}

export async function listPatients(params: {
  q?: string;
  status?: PatientStatus;
  tag?: string;
  page?: number;
  limit?: number;
}) {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  const membership = await getMembership(userId);
  if (!membership) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  return listPatientsService(membership.organizationId, params);
}

export async function createPatientTagAction(_prev: unknown, formData: FormData) {
  try {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;

    const membership = await getMembership(userId);
    if (!membership) {
      return { success: false as const, error: "Organização não encontrada." };
    }

    const name = formData.get("name") as string;
    const color = formData.get("color") as string;

    const tag = await createPatientTag(membership.organizationId, { name, color });

    await recordAudit({
      action: "patient.tag.create",
      entityType: "PatientTag",
      entityId: tag.id,
      metadata: { name },
    });

    revalidatePath("/app/pacientes");
    return { success: true as const, tag };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao criar tag";
    return { success: false as const, error: message };
  }
}

export async function deletePatientTagAction(tagId: string) {
  try {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;

    const membership = await getMembership(userId);
    if (!membership) {
      return { success: false as const, error: "Organização não encontrada." };
    }

    await deletePatientTag(membership.organizationId, tagId);

    await recordAudit({
      action: "patient.tag.delete",
      entityType: "PatientTag",
      entityId: tagId,
    });

    revalidatePath("/app/pacientes");
    return { success: true as const };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao excluir tag";
    return { success: false as const, error: message };
  }
}
