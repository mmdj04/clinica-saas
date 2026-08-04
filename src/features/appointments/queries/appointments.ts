"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AppointmentWithRelations,
  WaitingListEntryWithRelations,
} from "../types";

// ── Fetch helpers ─────────────────────────────────────────────

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro ao carregar dados");
  return res.json();
}

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error("Erro na requisição");
  return res.json();
}

async function deleteJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error("Erro ao excluir");
  return res.json();
}

// ── Query Keys ────────────────────────────────────────────────

export const appointmentKeys = {
  all: ["appointments"] as const,
  list: (params: {
    organizationId: string;
    from: string;
    to: string;
  }) => [...appointmentKeys.all, "list", params] as const,
  detail: (id: string) => [...appointmentKeys.all, "detail", id] as const,
};

export const waitingListKeys = {
  all: ["waitingList"] as const,
  list: (organizationId: string) =>
    [...waitingListKeys.all, organizationId] as const,
};

export const relatedDataKeys = {
  patients: (organizationId: string) =>
    ["appointments", "patients", organizationId] as const,
  professionals: (organizationId: string) =>
    ["appointments", "professionals", organizationId] as const,
  rooms: (organizationId: string) =>
    ["appointments", "rooms", organizationId] as const,
  specialties: (organizationId: string) =>
    ["appointments", "specialties", organizationId] as const,
};

// ── Appointments ──────────────────────────────────────────────

export function useAppointments(params: {
  organizationId: string;
  from: string;
  to: string;
}) {
  const searchParams = new URLSearchParams({
    organizationId: params.organizationId,
    from: params.from,
    to: params.to,
  });

  return useQuery<AppointmentWithRelations[]>({
    queryKey: appointmentKeys.list(params),
    queryFn: () => fetchJson(`/api/appointments?${searchParams}`),
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      organizationId: string;
      patientId: string;
      professionalId: string;
      roomId?: string;
      specialtyId?: string;
      startAt: string;
      endAt: string;
      type?: string;
      price?: number;
      notes?: string;
    }) => postJson("/api/appointments", data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
      qc.invalidateQueries({
        queryKey: waitingListKeys.list(variables.organizationId),
      });
    },
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      organizationId: string;
      patientId?: string;
      professionalId?: string;
      roomId?: string;
      specialtyId?: string;
      startAt?: string;
      endAt?: string;
      status?: string;
      type?: string;
      price?: number;
      notes?: string;
    }) =>
      postJson(`/api/appointments/${data.id}`, {
        organizationId: data.organizationId,
        patientId: data.patientId,
        professionalId: data.professionalId,
        roomId: data.roomId,
        specialtyId: data.specialtyId,
        startAt: data.startAt,
        endAt: data.endAt,
        status: data.status,
        type: data.type,
        price: data.price,
        notes: data.notes,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      organizationId: string;
      reason: string;
    }) =>
      postJson(`/api/appointments/${data.id}/cancel`, {
        organizationId: data.organizationId,
        reason: data.reason,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

export function useRescheduleAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      organizationId: string;
      startAt: string;
      endAt: string;
    }) =>
      postJson(`/api/appointments/${data.id}/reschedule`, {
        organizationId: data.organizationId,
        startAt: data.startAt,
        endAt: data.endAt,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

// ── Waiting List ──────────────────────────────────────────────

export function useWaitingList(organizationId: string) {
  return useQuery<WaitingListEntryWithRelations[]>({
    queryKey: waitingListKeys.list(organizationId),
    queryFn: () =>
      fetchJson(`/api/waiting-list?organizationId=${organizationId}`),
  });
}

export function useCreateWaitingListEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      organizationId: string;
      patientId: string;
      professionalId?: string;
      specialtyId?: string;
      preferredDate?: string;
      priority?: number;
      notes?: string;
    }) => postJson("/api/waiting-list", data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: waitingListKeys.list(variables.organizationId),
      });
    },
  });
}

export function useUpdateWaitingListStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      organizationId: string;
      status: string;
    }) =>
      postJson(`/api/waiting-list/${data.id}/status`, {
        organizationId: data.organizationId,
        status: data.status,
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: waitingListKeys.list(variables.organizationId),
      });
    },
  });
}

export function useDeleteWaitingListEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; organizationId: string }) =>
      deleteJson(
        `/api/waiting-list/${data.id}?organizationId=${data.organizationId}`,
      ),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: waitingListKeys.list(variables.organizationId),
      });
    },
  });
}

// ── Related Data ──────────────────────────────────────────────

export function usePatients(organizationId: string) {
  return useQuery<{ id: string; name: string; phone: string | null }[]>({
    queryKey: relatedDataKeys.patients(organizationId),
    queryFn: () =>
      fetchJson(`/api/patients?organizationId=${organizationId}&minimal=true`),
    staleTime: 5 * 60_000,
  });
}

export function useProfessionals(organizationId: string) {
  return useQuery<
    { id: string; name: string; color: string; specialtyId: string | null }[]
  >({
    queryKey: relatedDataKeys.professionals(organizationId),
    queryFn: () =>
      fetchJson(
        `/api/professionals?organizationId=${organizationId}&minimal=true`,
      ),
    staleTime: 5 * 60_000,
  });
}

export function useRooms(organizationId: string) {
  return useQuery<{ id: string; name: string }[]>({
    queryKey: relatedDataKeys.rooms(organizationId),
    queryFn: () =>
      fetchJson(`/api/rooms?organizationId=${organizationId}&minimal=true`),
    staleTime: 5 * 60_000,
  });
}

export function useSpecialties(organizationId: string) {
  return useQuery<{ id: string; name: string; color: string }[]>({
    queryKey: relatedDataKeys.specialties(organizationId),
    queryFn: () =>
      fetchJson(
        `/api/specialties?organizationId=${organizationId}&minimal=true`,
      ),
    staleTime: 5 * 60_000,
  });
}
