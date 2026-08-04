import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { isDemo, demoProfessionals } from "@/lib/demo";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId") ?? "demo-org-001";

    if (isDemo) {
      return NextResponse.json(
        demoProfessionals.map((p) => ({
          id: p.id,
          name: p.name,
          color: p.color,
          specialtyId: p.specialtyId,
        }))
      );
    }

    const professionals = await prisma.professional.findMany({
      where: { organizationId, active: true },
      select: { id: true, name: true, color: true, specialtyId: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(professionals);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
