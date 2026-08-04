import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, redirectTo } = body as { email: string; redirectTo?: string };

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    await auth.api.requestPasswordReset({
      body: {
        email: email.toLowerCase().trim(),
        redirectTo: redirectTo ?? "/reset-password",
      },
    });

    await recordAudit({
      action: "auth.request_password_reset",
      entityType: "User",
      entityId: user.id,
      metadata: { email: user.email },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}