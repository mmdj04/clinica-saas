import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import {
  getPatientById,
  updatePatient,
  deletePatient,
} from "@/features/pacientes/services/paciente-service";
import { recordAudit } from "@/lib/audit";
import type { PatientStatus } from "@/features/pacientes/types";
import { isDemo } from "@/lib/demo";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const { id } = await params;

    let orgId: string;
    if (isDemo) {
      orgId = "demo-org-001";
    } else {
      const membership = await prisma.organizationMember.findFirst({
        where: { userId },
      });
      if (!membership) {
        return NextResponse.json(
          { error: "Organização não encontrada" },
          { status: 403 },
        );
      }
      orgId = membership.organizationId;
    }

    const patient = await getPatientById(orgId, id);
    if (!patient) {
      return NextResponse.json(
        { error: "Paciente não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(patient);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const { id } = await params;

    if (isDemo) {
      return NextResponse.json(
        { error: "Modo demo não permite escrita" },
        { status: 403 },
      );
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId },
    });
    if (!membership) {
      return NextResponse.json(
        { error: "Organização não encontrada" },
        { status: 403 },
      );
    }

    const body = await request.json();

    await updatePatient(membership.organizationId, id, {
      name: body.name,
      email: body.email,
      phone: body.phone,
      cpf: body.cpf,
      rg: body.rg,
      birthDate: body.birthDate,
      gender: body.gender,
      cep: body.cep,
      address: body.address,
      city: body.city,
      state: body.state,
      insuranceProvider: body.insuranceProvider,
      insuranceNumber: body.insuranceNumber,
      emergencyContact: body.emergencyContact,
      emergencyPhone: body.emergencyPhone,
      responsibleName: body.responsibleName,
      responsiblePhone: body.responsiblePhone,
      notes: body.notes,
      source: body.source,
      status: body.status as PatientStatus | undefined,
      tags: body.tags,
    });

    await recordAudit({
      action: "patient.update",
      entityType: "Patient",
      entityId: id,
      metadata: { name: body.name },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const { id } = await params;

    if (isDemo) {
      return NextResponse.json(
        { error: "Modo demo não permite escrita" },
        { status: 403 },
      );
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId },
    });
    if (!membership) {
      return NextResponse.json(
        { error: "Organização não encontrada" },
        { status: 403 },
      );
    }

    const patient = await prisma.patient.findFirst({
      where: { id, organizationId: membership.organizationId },
      select: { name: true },
    });

    await deletePatient(membership.organizationId, id);

    await recordAudit({
      action: "patient.delete",
      entityType: "Patient",
      entityId: id,
      metadata: { name: patient?.name },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
