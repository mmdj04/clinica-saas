import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { isDemo, demoPatients } from "@/lib/demo";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId") ?? "demo-org-001";
    const minimal = searchParams.get("minimal") === "true";

    if (isDemo) {
      const patients = demoPatients
        .filter((p) => p.status === "active")
        .map((p) => ({
          id: p.id,
          name: p.name,
          phone: p.phone,
        }));
      return NextResponse.json(patients);
    }

    const patients = await prisma.patient.findMany({
      where: { organizationId, status: "active" },
      select: { id: true, name: true, phone: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(patients);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
