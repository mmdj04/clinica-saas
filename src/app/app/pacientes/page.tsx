import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/multi-tenancy";
import { listPatientTags } from "@/features/pacientes/services/paciente-service";
import { PacientesPage } from "@/features/pacientes/components/pacientes-page";

export const dynamic = "force-dynamic";

export default async function PacientesListPage() {
  const current = await getCurrentOrganization();
  if (!current) redirect("/onboard");

  const tags = await listPatientTags(current.organization.id);

  const serializedTags = tags.map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
  }));

  return <PacientesPage tags={serializedTags} />;
}
