import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { updateAppointment, cancelAppointment, rescheduleAppointment } from "@/features/appointments/services/appointment-service";
import { isDemo } from "@/lib/demo";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const orgId = body.organizationId || "demo-org-001";

    const result = await updateAppointment(id, orgId, {
      patientId: body.patientId,
      professionalId: body.professionalId,
      roomId: body.roomId,
      specialtyId: body.specialtyId,
      startAt: body.startAt,
      endAt: body.endAt,
      status: body.status,
      type: body.type,
      price: body.price,
      notes: body.notes,
    });

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
