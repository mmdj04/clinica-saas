"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PatientStatus } from "@/features/pacientes/types";

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function usePatientList(params: {
  q?: string;
  status?: PatientStatus;
  tag?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set("q", params.q);
  if (params.status) searchParams.set("status", params.status);
  if (params.tag) searchParams.set("tag", params.tag);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const queryKey = ["pacientes", "list", params] as const;

  return useQuery({
    queryKey,
    queryFn: () => {
      return apiFetch<{
        items: Array<{
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          cpf: string | null;
          birthDate: string | null;
          gender: string;
          status: string;
          createdAt: string;
          tags: { id: string; name: string; color: string }[];
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/api/pacientes?${searchParams.toString()}`);
    },
    placeholderData: (prev) => prev,
  });
}

export function usePatientDetail(id: string | null) {
  return useQuery({
    queryKey: ["pacientes", "detail", id],
    queryFn: () =>
      apiFetch<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        cpf: string | null;
        rg: string | null;
        birthDate: string | null;
        gender: string;
        photoUrl: string | null;
        cep: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        insuranceProvider: string | null;
        insuranceNumber: string | null;
        emergencyContact: string | null;
        emergencyPhone: string | null;
        responsibleName: string | null;
        responsiblePhone: string | null;
        notes: string | null;
        source: string | null;
        status: string;
        createdAt: string;
        tags: { id: string; name: string; color: string }[];
        _count: {
          appointments: number;
          anamnesis: number;
          evolutions: number;
          prescriptions: number;
          exams: number;
          attachments: number;
        };
        recentAppointments: {
          id: string;
          startAt: string;
          endAt: string;
          status: string;
          professional: { name: string };
        }[];
      }>(`/api/pacientes/${id}`),
    enabled: !!id,
  });
}

export function usePatientMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["pacientes"] });
  };

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/pacientes", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Erro ao criar paciente");
      }
      return res.json() as Promise<{ id: string }>;
    },
    onSuccess: () => invalidateAll(),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const res = await fetch(`/api/pacientes/${id}`, {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Erro ao atualizar paciente");
      }
      return res.json();
    },
    onSuccess: () => invalidateAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pacientes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Erro ao excluir paciente");
      }
      return res.json();
    },
    onSuccess: () => invalidateAll(),
  });

  return { createMutation, updateMutation, deleteMutation };
}
