import { NextRequest, NextResponse } from "next/server";
import { getCurrentOrganization } from "@/lib/multi-tenancy";
import {
  fetchPatientReport,
  fetchAppointmentReport,
  fetchFinanceReport,
  fetchCancellationReport,
} from "@/features/reports/services/report-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const current = await getCurrentOrganization();
  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const report = searchParams.get("report");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFrom = from ? new Date(from) : undefined;
  const dateTo = to ? new Date(to) : undefined;
  const organizationId = current.organization.id;

  try {
    switch (report) {
      case "patients":
        return NextResponse.json(
          await fetchPatientReport(organizationId, dateFrom, dateTo),
        );
      case "appointments":
        return NextResponse.json(
          await fetchAppointmentReport(organizationId, dateFrom, dateTo),
        );
      case "finance":
        return NextResponse.json(
          await fetchFinanceReport(organizationId, dateFrom, dateTo),
        );
      case "cancellations":
        return NextResponse.json(
          await fetchCancellationReport(organizationId, dateFrom, dateTo),
        );
      default:
        return NextResponse.json(
          { error: "Unknown report type" },
          { status: 400 },
        );
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 },
    );
  }
}
