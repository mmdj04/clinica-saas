import { NextResponse } from "next/server";
import { getCurrentOrganization } from "@/lib/multi-tenancy";
import { fetchDashboardData } from "@/features/dashboard/queries/dashboard";

export const dynamic = "force-dynamic";

export async function GET() {
  const current = await getCurrentOrganization();
  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await fetchDashboardData(current.organization.id);
  return NextResponse.json(data);
}
