"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { runWithTenant } from "@/lib/multi-tenancy";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";
import {
  anamnesisUpsertSchema,
  evolutionCreateSchema,
  prescriptionCreateSchema,
  examCreateSchema,
} from "@/lib/validations/prontuario";
import {
  upsertAnamnesis,
  createEvolution,
  listEvolutions,
  createPrescription,
  listPrescriptions,
  createExam,
  listExams,
  listAttachments,
  searchPatients,
  getPatientSummary,
  getPatientStats,
  getAnamnesis,
} from "./services/prontuario-service";
import type { AnamnesisContent, EvolutionType, PrescriptionItem } from "./types";
import { isDemo } from "@/lib/demo";

async function withTenantContext<T>(fn: () => Promise<T>): Promise<T> {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  if (isDemo) {
    return runWithTenant(
      { organizationId: "demo-org-001", role: "OWNER", userId },
      fn,
    );
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) throw new Error("NO_ORGANIZATION");

  return runWithTenant(
    { organizationId: membership.organizationId, role: membership.role, userId },
    fn,
  );
}

// ─── Patient Search ───────────────────────────────────────────

export async function searchPatientsAction(query: string) {
  return withTenantContext(() => searchPatients(query));
}

export async function getPatientSummaryAction(patientId: string) {
  return withTenantContext(() => getPatientSummary(patientId));
}

export async function getPatientStatsAction(patientId: string) {
  return withTenantContext(() => getPatientStats(patientId));
}

// ─── Anamnesis ────────────────────────────────────────────────

export async function getAnamnesisAction(patientId: string) {
  return withTenantContext(() => getAnamnesis(patientId));
}

export async function upsertAnamnesisAction(patientId: string, content: AnamnesisContent) {
  const parsed = anamnesisUpsertSchema.safeParse({ patientId, content });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  return withTenantContext(async () => {
    const result = await upsertAnamnesis(patientId, content);
    await recordAudit({
      action: "prontuario.anamnesis.upsert",
      entityType: "Anamnesis",
      entityId: result.id,
      metadata: { patientId },
    });
    revalidatePath(`/app/prontuario/${patientId}`);
    return { data: result };
  });
}

// ─── Evolution ────────────────────────────────────────────────

export async function listEvolutionsAction(patientId: string) {
  return withTenantContext(() => listEvolutions(patientId));
}

export async function createEvolutionAction(data: {
  patientId: string;
  appointmentId?: string;
  type: EvolutionType;
  content: string;
}) {
  const parsed = evolutionCreateSchema.safeParse({
    patientId: data.patientId,
    appointmentId: data.appointmentId,
    type: data.type,
    content: data.content,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  return withTenantContext(async () => {
    const result = await createEvolution({
      patientId: data.patientId,
      appointmentId: data.appointmentId,
      type: data.type,
      content: data.content,
    });
    await recordAudit({
      action: "prontuario.evolution.create",
      entityType: "Evolution",
      entityId: result.id,
      metadata: { patientId: data.patientId, type: data.type },
    });
    revalidatePath(`/app/prontuario/${data.patientId}`);
    return { data: result };
  });
}

// ─── Prescription ─────────────────────────────────────────────

export async function listPrescriptionsAction(patientId: string) {
  return withTenantContext(() => listPrescriptions(patientId));
}

export async function createPrescriptionAction(data: {
  patientId: string;
  items: PrescriptionItem[];
  guidelines?: string;
  validDays?: number;
}) {
  const parsed = prescriptionCreateSchema.safeParse({
    patientId: data.patientId,
    items: data.items,
    guidelines: data.guidelines,
    validDays: data.validDays,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  return withTenantContext(async () => {
    const result = await createPrescription({
      patientId: data.patientId,
      items: data.items,
      guidelines: data.guidelines,
      validDays: data.validDays,
    });
    await recordAudit({
      action: "prontuario.prescription.create",
      entityType: "Prescription",
      entityId: result.id,
      metadata: { patientId: data.patientId, itemCount: data.items.length },
    });
    revalidatePath(`/app/prontuario/${data.patientId}`);
    return { data: result };
  });
}

// ─── Exam ─────────────────────────────────────────────────────

export async function listExamsAction(patientId: string) {
  return withTenantContext(() => listExams(patientId));
}

export async function createExamAction(data: {
  patientId: string;
  professionalId?: string;
  name: string;
  category?: string;
  orderedAt?: string;
  summary?: string;
  status?: "ordered" | "collected" | "ready" | "delivered";
}) {
  const parsed = examCreateSchema.safeParse({
    patientId: data.patientId,
    professionalId: data.professionalId,
    name: data.name,
    category: data.category,
    orderedAt: data.orderedAt,
    summary: data.summary,
    status: data.status,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  return withTenantContext(async () => {
    const result = await createExam({
      patientId: data.patientId,
      professionalId: data.professionalId,
      name: data.name,
      category: data.category,
      orderedAt: data.orderedAt,
      summary: data.summary,
      status: data.status,
    });
    await recordAudit({
      action: "prontuario.exam.create",
      entityType: "Exam",
      entityId: result.id,
      metadata: { patientId: data.patientId, name: data.name },
    });
    revalidatePath(`/app/prontuario/${data.patientId}`);
    return { data: result };
  });
}

// ─── Attachments ──────────────────────────────────────────────

export async function listAttachmentsAction(patientId: string) {
  return withTenantContext(() => listAttachments(patientId));
}
