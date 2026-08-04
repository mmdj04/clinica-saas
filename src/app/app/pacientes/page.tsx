import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/multi-tenancy";
import { listPatientTags } from "@/features/pacientes/services/paciente-service";
import { PacientesPage } from "@/features/pacientes/components/pacientes-page";
import { isDemo } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function PacientesListPage() {
  const current = await getCurrentOrganization();
  if (!current) redirect("/onboard");

  let tags;
  if (isDemo) {
    tags = [
      { id: "tag-1", name: "Retorno", color: "#7c3aed" },
      { id: "tag-2", name: "Particular", color: "#0ea5e9" },
      { id: "tag-3", name: "Plano de Saúde", color: "#10b981" },
      { id: "tag-4", name: "Urgência", color: "#ef4444" },
    ];
  } else {
    const rawTags = await listPatientTags(current.organization.id);
    tags = rawTags.map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
    }));
  }

  return <PacientesPage tags={tags} />;
}
