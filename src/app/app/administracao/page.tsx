import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/multi-tenancy";
import { listMembers, listSpecialties, listRooms, listProfessionals } from "@/features/admin/services/admin-service";
import { listAuditLogs } from "@/lib/audit";
import { AdminPage } from "@/features/admin/components/admin-page";

export const dynamic = "force-dynamic";

export default async function AdminPageRoute() {
  const current = await getCurrentOrganization();
  if (!current) redirect("/onboard");

  const orgId = current.organization.id;

  const [members, specialties, rooms, professionals, auditLogs] = await Promise.all([
    listMembers(orgId),
    listSpecialties(orgId),
    listRooms(orgId),
    listProfessionals(orgId),
    listAuditLogs(orgId, { page: 1, limit: 20 }),
  ]);

  return (
    <AdminPage
      organizationId={orgId}
      initialRole={current.role}
      initialMembers={members}
      initialSpecialties={specialties}
      initialRooms={rooms}
      initialProfessionals={professionals}
      initialAuditLogs={auditLogs}
    />
  );
}
