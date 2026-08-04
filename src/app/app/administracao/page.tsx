import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/multi-tenancy";
import { listMembers, listSpecialties, listRooms, listProfessionals } from "@/features/admin/services/admin-service";
import { listAuditLogs } from "@/lib/audit";
import { AdminPage } from "@/features/admin/components/admin-page";
import {
  isDemo,
  demoMemberships,
  demoSpecialties,
  demoRooms,
  demoProfessionals,
} from "@/lib/demo";
import type { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminPageRoute() {
  const current = await getCurrentOrganization();
  if (!current) redirect("/onboard");

  const orgId = current.organization.id;

  let members;
  let specialties;
  let rooms;
  let professionals;
  let auditLogs;

  if (isDemo) {
    members = demoMemberships.map((m) => ({
      ...m,
      role: "OWNER" as Role,
      status: "ACTIVE" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { id: m.userId, name: "Dra. Maria Silva", email: "maria@clinica.com.br", image: null },
    }));
    specialties = demoSpecialties.map((s) => ({ ...s, organizationId: orgId, active: true, durationMinutes: 30, createdAt: new Date(), updatedAt: new Date() }));
    rooms = demoRooms.map((r) => ({ ...r, organizationId: orgId, active: true, createdAt: new Date(), updatedAt: new Date() }));
    professionals = demoProfessionals.map((p) => ({ ...p, organizationId: orgId, userId: null, email: null, phone: null, documentNumber: null, commissionRate: 0 as any, active: true, createdAt: new Date(), updatedAt: new Date(), specialty: { id: p.specialtyId, name: p.specialty.name } }));
    auditLogs = { items: [], total: 0, page: 1, limit: 20 };
  } else {
    [members, specialties, rooms, professionals, auditLogs] = await Promise.all([
      listMembers(orgId),
      listSpecialties(orgId),
      listRooms(orgId),
      listProfessionals(orgId),
      listAuditLogs(orgId, { page: 1, limit: 20 }),
    ]);
  }

  return (
    <AdminPage
      organizationId={orgId}
      initialRole={current.role}
      initialMembers={members as any}
      initialSpecialties={specialties as any}
      initialRooms={rooms as any}
      initialProfessionals={professionals as any}
      initialAuditLogs={auditLogs}
    />
  );
}
