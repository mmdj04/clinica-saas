import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/multi-tenancy";
import { prisma } from "@/lib/prisma";
import { FinancePage } from "@/features/finance/components/finance-page";
import { isDemo, demoProfessionals, demoPatients } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const current = await getCurrentOrganization();
  if (!current) redirect("/onboard");

  const orgId = current.organization.id;

  let professionals: { id: string; name: string }[];
  let patients: { id: string; name: string }[];

  if (isDemo) {
    professionals = demoProfessionals.map((p) => ({ id: p.id, name: p.name }));
    patients = demoPatients.map((p) => ({ id: p.id, name: p.name }));
  } else {
    [professionals, patients] = await Promise.all([
      prisma.professional.findMany({
        where: { organizationId: orgId, active: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.patient.findMany({
        where: { organizationId: orgId, status: "active" },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
        take: 200,
      }),
    ]);
  }

  return (
    <FinancePage
      organizationId={orgId}
      professionals={professionals}
      patients={patients}
    />
  );
}
