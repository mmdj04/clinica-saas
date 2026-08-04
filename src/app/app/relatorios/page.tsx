import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/multi-tenancy";
import { ReportsPage } from "@/features/reports/components/reports-page";
import { startOfDay, subDays, endOfDay } from "date-fns";

export const dynamic = "force-dynamic";

export default async function ReportsPageRoute() {
  const current = await getCurrentOrganization();
  if (!current) redirect("/onboard");

  const now = new Date();
  const defaultRange = {
    from: startOfDay(subDays(now, 29)),
    to: endOfDay(now),
  };

  return <ReportsPage defaultRange={defaultRange} />;
}
