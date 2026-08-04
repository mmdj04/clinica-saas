"use client";

import * as React from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { MembersTab } from "@/features/admin/components/members-tab";
import { SpecialtiesTab } from "@/features/admin/components/specialties-tab";
import { RoomsTab } from "@/features/admin/components/rooms-tab";
import { ProfessionalsTab } from "@/features/admin/components/professionals-tab";
import { OrganizationSettings } from "@/features/admin/components/organization-settings";
import { AuditLogTab } from "@/features/admin/components/audit-log-tab";
import type { MemberWithUser, SpecialtyItem, RoomItem, ProfessionalWithSpecialty, AuditLogWithActor } from "@/features/admin/types";
import {
  Users,
  Stethoscope,
  MapPin,
  Settings,
  Activity,
} from "lucide-react";

interface AdminPageProps {
  organizationId: string;
  initialRole: string;
  initialMembers: MemberWithUser[];
  initialSpecialties: SpecialtyItem[];
  initialRooms: RoomItem[];
  initialProfessionals: ProfessionalWithSpecialty[];
  initialAuditLogs: { items: AuditLogWithActor[]; total: number; page: number; limit: number };
}

export function AdminPage({
  organizationId,
  initialRole,
  initialMembers,
  initialSpecialties,
  initialRooms,
  initialProfessionals,
  initialAuditLogs,
}: AdminPageProps) {
  const canEdit = ["OWNER", "ADMIN"].includes(initialRole);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administração"
        description="Gerencie membros, catálogo e configurações da clínica."
      />

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="members">
            <Users className="mr-1.5 h-4 w-4" />
            Membros
          </TabsTrigger>
          <TabsTrigger value="specialties">
            <Stethoscope className="mr-1.5 h-4 w-4" />
            Especialidades
          </TabsTrigger>
          <TabsTrigger value="rooms">
            <MapPin className="mr-1.5 h-4 w-4" />
            Salas
          </TabsTrigger>
          <TabsTrigger value="professionals">
            <Users className="mr-1.5 h-4 w-4" />
            Profissionais
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-1.5 h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Activity className="mr-1.5 h-4 w-4" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <MembersTab
            organizationId={organizationId}
            canEdit={canEdit}
            initialData={initialMembers}
          />
        </TabsContent>

        <TabsContent value="specialties">
          <SpecialtiesTab
            organizationId={organizationId}
            canEdit={canEdit}
            initialData={initialSpecialties}
          />
        </TabsContent>

        <TabsContent value="rooms">
          <RoomsTab
            organizationId={organizationId}
            canEdit={canEdit}
            initialData={initialRooms}
          />
        </TabsContent>

        <TabsContent value="professionals">
          <ProfessionalsTab
            organizationId={organizationId}
            canEdit={canEdit}
            initialData={initialProfessionals}
            specialtiesData={initialSpecialties}
          />
        </TabsContent>

        <TabsContent value="settings">
          <OrganizationSettings organizationId={organizationId} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogTab
            organizationId={organizationId}
            initialData={initialAuditLogs}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
