import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/multi-tenancy";
import { prisma } from "@/lib/prisma";
import { FinancePage } from "@/features/finance/components/finance-page";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const current = await getCurrentOrganization();
  if (!current) redirect("/onboard");

  const orgId = current.organization.id;

  const [professionals, patients] = await Promise.all([
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

  return (
    <FinancePage
      organizationId={orgId}
      professionals={professionals}
      patients={patients}
    />
  );
}
