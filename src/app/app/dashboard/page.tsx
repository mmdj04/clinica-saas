import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/multi-tenancy";
import { fetchDashboardData } from "@/features/dashboard/queries/dashboard";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";

export const dynamic = "force-dynamic";

export default async function DashboardPageRoute() {
  const current = await getCurrentOrganization();
  if (!current) redirect("/onboard");

  const data = await fetchDashboardData(current.organization.id);

  return <DashboardPage initialData={data} />;
}
