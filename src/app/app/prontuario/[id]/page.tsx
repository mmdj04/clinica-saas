import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/multi-tenancy";
import { prisma } from "@/lib/prisma";
import { ProntuarioPage } from "@/features/prontuario/components/prontuario-page";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientProntuarioPage({ params }: PageProps) {
  const { id } = await params;
  const current = await getCurrentOrganization();
  if (!current) redirect("/onboard");

  const patient = await prisma.patient.findFirst({
    where: { id, organizationId: current.organization.id },
    select: { id: true, name: true },
  });

  if (!patient) redirect("/app/prontuario");

  return (
    <div className="h-full">
      <ProntuarioPage patientId={patient.id} />
    </div>
  );
}
