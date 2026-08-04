import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/multi-tenancy";
import { AgendaPage } from "@/features/appointments/components/agenda-page";

export const dynamic = "force-dynamic";

export default async function AgendaRoute() {
  const current = await getCurrentOrganization();
  if (!current) redirect("/login");

  return <AgendaPage organizationId={current.organization.id} />;
}
