import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { listAppointments, createAppointment } from "@/features/appointments/services/appointment-service";
import { isDemo } from "@/lib/demo";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId") ?? "demo-org-001";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json({ error: "from and to are required" }, { status: 400 });
    }

    const appointments = await listAppointments({
      organizationId,
      from: new Date(from),
      to: new Date(to),
    });

    return NextResponse.json(appointments);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();

    let orgId = body.organizationId;
    if (!orgId) {
      if (isDemo) {
        orgId = "demo-org-001";
      } else {
        return NextResponse.json({ error: "organizationId required" }, { status: 400 });
      }
    }

    const appointment = await createAppointment(orgId, {
      patientId: body.patientId,
      professionalId: body.professionalId,
      roomId: body.roomId,
      specialtyId: body.specialtyId,
      startAt: body.startAt,
      endAt: body.endAt,
      status: body.status ?? "SCHEDULED",
      type: body.type ?? "RETURN",
      price: body.price ?? 0,
      notes: body.notes,
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
