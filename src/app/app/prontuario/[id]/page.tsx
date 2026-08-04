import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/multi-tenancy";
import { prisma } from "@/lib/prisma";
import { ProntuarioPage } from "@/features/prontuario/components/prontuario-page";
import { isDemo, demoPatients } from "@/lib/demo";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientProntuarioPage({ params }: PageProps) {
  const { id } = await params;
  const current = await getCurrentOrganization();
  if (!current) redirect("/onboard");

  let patient: { id: string; name: string } | null;

  if (isDemo) {
    const p = demoPatients.find((dp) => dp.id === id);
    patient = p ? { id: p.id, name: p.name } : null;
  } else {
    patient = await prisma.patient.findFirst({
      where: { id, organizationId: current.organization.id },
      select: { id: true, name: true },
    });
  }

  if (!patient) redirect("/app/prontuario");

  return (
    <div className="h-full">
      <ProntuarioPage patientId={patient.id} />
    </div>
  );
}
