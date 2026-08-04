import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import {
  listPatients,
  createPatient,
} from "@/features/pacientes/services/paciente-service";
import { recordAudit } from "@/lib/audit";
import type { PatientStatus } from "@/features/pacientes/types";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;

    const membership = await prisma.organizationMember.findFirst({
      where: { userId },
    });
    if (!membership) {
      return NextResponse.json(
        { error: "Organização não encontrada" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? undefined;
    const status = (searchParams.get("status") as PatientStatus) ?? undefined;
    const tag = searchParams.get("tag") ?? undefined;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;

    const result = await listPatients(membership.organizationId, {
      q,
      status,
      tag,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;

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

    const patient = await createPatient(membership.organizationId, userId, {
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
      status: body.status,
      tags: body.tags,
    });

    await recordAudit({
      action: "patient.create",
      entityType: "Patient",
      entityId: patient.id,
      metadata: { name: body.name },
    });

    return NextResponse.json({ id: patient.id }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
