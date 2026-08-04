"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { MemberWithUser, SpecialtyItem, RoomItem, ProfessionalWithSpecialty, AuditLogWithActor } from "@/features/admin/types";

export const adminKeys = {
  all: ["admin"] as const,
  members: () => [...adminKeys.all, "members"] as const,
  specialties: () => [...adminKeys.all, "specialties"] as const,
  rooms: () => [...adminKeys.all, "rooms"] as const,
  professionals: () => [...adminKeys.all, "professionals"] as const,
  auditLogs: (filters: Record<string, unknown>) =>
    [...adminKeys.all, "auditLogs", filters] as const,
};

export function useMembers(initialData: MemberWithUser[]) {
  return useQuery({
    queryKey: adminKeys.members(),
    queryFn: async () => initialData,
    initialData,
    staleTime: Infinity,
  });
}

export function useSpecialties(initialData: SpecialtyItem[]) {
  return useQuery({
    queryKey: adminKeys.specialties(),
    queryFn: async () => initialData,
    initialData,
    staleTime: Infinity,
  });
}

export function useRooms(initialData: RoomItem[]) {
  return useQuery({
    queryKey: adminKeys.rooms(),
    queryFn: async () => initialData,
    initialData,
    staleTime: Infinity,
  });
}

export function useProfessionals(initialData: ProfessionalWithSpecialty[]) {
  return useQuery({
    queryKey: adminKeys.professionals(),
    queryFn: async () => initialData,
    initialData,
    staleTime: Infinity,
  });
}

export function useAuditLogs(
  initialData: { items: AuditLogWithActor[]; total: number; page: number; limit: number },
  filters: { page?: number; limit?: number; action?: string; entityType?: string },
) {
  return useQuery({
    queryKey: adminKeys.auditLogs(filters),
    queryFn: async () => initialData,
    initialData,
    staleTime: Infinity,
  });
}

export function useInvalidateAdmin() {
  const qc = useQueryClient();
  return {
    invalidateMembers: () => qc.invalidateQueries({ queryKey: adminKeys.members() }),
    invalidateSpecialties: () => qc.invalidateQueries({ queryKey: adminKeys.specialties() }),
    invalidateRooms: () => qc.invalidateQueries({ queryKey: adminKeys.rooms() }),
    invalidateProfessionals: () => qc.invalidateQueries({ queryKey: adminKeys.professionals() }),
    invalidateAll: () => qc.invalidateQueries({ queryKey: adminKeys.all }),
  };
}

export {
  inviteMemberAction,
  updateMemberRoleAction,
  removeMemberAction,
  createSpecialtyAction,
  updateSpecialtyAction,
  deleteSpecialtyAction,
  createRoomAction,
  updateRoomAction,
  deleteRoomAction,
  createProfessionalAction,
  updateProfessionalAction,
  deleteProfessionalAction,
  updateOrganizationSettingsAction,
} from "@/features/admin/actions";
