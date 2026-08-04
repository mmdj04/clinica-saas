import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { listWaitingList, createWaitingListEntry } from "@/features/appointments/services/appointment-service";
import { isDemo } from "@/lib/demo";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId") ?? "demo-org-001";

    const entries = await listWaitingList(organizationId);
    return NextResponse.json(entries);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const orgId = body.organizationId || "demo-org-001";

    const entry = await createWaitingListEntry(orgId, {
      patientId: body.patientId,
      professionalId: body.professionalId,
      specialtyId: body.specialtyId,
      preferredDate: body.preferredDate,
      priority: body.priority,
      notes: body.notes,
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
