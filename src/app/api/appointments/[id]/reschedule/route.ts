import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { rescheduleAppointment } from "@/features/appointments/services/appointment-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const orgId = body.organizationId || "demo-org-001";

    const result = await rescheduleAppointment(
      id,
      orgId,
      new Date(body.startAt),
      new Date(body.endAt),
    );

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
