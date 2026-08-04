"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  searchPatientsAction,
  getPatientSummaryAction,
  getPatientStatsAction,
  getAnamnesisAction,
  upsertAnamnesisAction,
  listEvolutionsAction,
  createEvolutionAction,
  listPrescriptionsAction,
  createPrescriptionAction,
  listExamsAction,
  createExamAction,
  listAttachmentsAction,
} from "../actions";
import type {
  AnamnesisContent,
  EvolutionType,
  PrescriptionItem,
  ExamStatus,
} from "../types";

// ─── Patient Search ───────────────────────────────────────────

export function usePatientSearch(query: string) {
  return useQuery({
    queryKey: ["prontuario", "patients", query],
    queryFn: () => searchPatientsAction(query),
    enabled: true,
    staleTime: 30_000,
  });
}

export function usePatientSummary(patientId: string | null) {
  return useQuery({
    queryKey: ["prontuario", "patient-summary", patientId],
    queryFn: () => getPatientSummaryAction(patientId!),
    enabled: !!patientId,
    staleTime: 60_000,
  });
}

export function usePatientStats(patientId: string | null) {
  return useQuery({
    queryKey: ["prontuario", "patient-stats", patientId],
    queryFn: () => getPatientStatsAction(patientId!),
    enabled: !!patientId,
    staleTime: 60_000,
  });
}

// ─── Anamnesis ────────────────────────────────────────────────

export function useAnamnesis(patientId: string | null) {
  return useQuery({
    queryKey: ["prontuario", "anamnesis", patientId],
    queryFn: () => getAnamnesisAction(patientId!),
    enabled: !!patientId,
  });
}

export function useUpsertAnamnesis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      content,
    }: {
      patientId: string;
      content: AnamnesisContent;
    }) => upsertAnamnesisAction(patientId, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["prontuario", "anamnesis", variables.patientId],
      });
    },
  });
}

// ─── Evolution ────────────────────────────────────────────────

export function useEvolutions(patientId: string | null) {
  return useQuery({
    queryKey: ["prontuario", "evolutions", patientId],
    queryFn: () => listEvolutionsAction(patientId!),
    enabled: !!patientId,
  });
}

export function useCreateEvolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      patientId: string;
      appointmentId?: string;
      type: EvolutionType;
      content: string;
    }) => createEvolutionAction(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["prontuario", "evolutions", variables.patientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["prontuario", "patient-stats", variables.patientId],
      });
    },
  });
}

// ─── Prescription ─────────────────────────────────────────────

export function usePrescriptions(patientId: string | null) {
  return useQuery({
    queryKey: ["prontuario", "prescriptions", patientId],
    queryFn: () => listPrescriptionsAction(patientId!),
    enabled: !!patientId,
  });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      patientId: string;
      items: PrescriptionItem[];
      guidelines?: string;
      validDays?: number;
    }) => createPrescriptionAction(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["prontuario", "prescriptions", variables.patientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["prontuario", "patient-stats", variables.patientId],
      });
    },
  });
}

// ─── Exam ─────────────────────────────────────────────────────

export function useExams(patientId: string | null) {
  return useQuery({
    queryKey: ["prontuario", "exams", patientId],
    queryFn: () => listExamsAction(patientId!),
    enabled: !!patientId,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      patientId: string;
      professionalId?: string;
      name: string;
      category?: string;
      orderedAt?: string;
      summary?: string;
      status?: ExamStatus;
    }) => createExamAction(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["prontuario", "exams", variables.patientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["prontuario", "patient-stats", variables.patientId],
      });
    },
  });
}

// ─── Attachments ──────────────────────────────────────────────

export function useAttachments(patientId: string | null) {
  return useQuery({
    queryKey: ["prontuario", "attachments", patientId],
    queryFn: () => listAttachmentsAction(patientId!),
    enabled: !!patientId,
  });
}
