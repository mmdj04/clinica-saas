import { redirect, notFound } from "next/navigation";
import { getCurrentOrganization } from "@/lib/multi-tenancy";
import { getPatientById } from "@/features/pacientes/services/paciente-service";
import { PacienteDetailServer } from "./paciente-detail-server";

export const dynamic = "force-dynamic";

export default async function PacienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const current = await getCurrentOrganization();
  if (!current) redirect("/onboard");

  const { id } = await params;
  const patient = await getPatientById(current.organization.id, id);

  if (!patient) notFound();

  return <PacienteDetailServer patient={patient} />;
}
