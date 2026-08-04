import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { isDemo, demoRooms } from "@/lib/demo";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId") ?? "demo-org-001";

    if (isDemo) {
      return NextResponse.json(demoRooms.map((r) => ({ id: r.id, name: r.name })));
    }

    const rooms = await prisma.room.findMany({
      where: { organizationId, active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(rooms);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
