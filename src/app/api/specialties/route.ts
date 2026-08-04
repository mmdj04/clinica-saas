import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { isDemo, demoSpecialties } from "@/lib/demo";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId") ?? "demo-org-001";

    if (isDemo) {
      return NextResponse.json(
        demoSpecialties.map((s) => ({ id: s.id, name: s.name, color: s.color }))
      );
    }

    const specialties = await prisma.specialty.findMany({
      where: { organizationId, active: true },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(specialties);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
