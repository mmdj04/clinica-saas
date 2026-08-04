"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  PatientReportData,
  AppointmentReportData,
  FinanceReportData,
  CancellationReportData,
} from "../types";

function buildUrl(report: string, from?: Date, to?: Date) {
  const params = new URLSearchParams({ report });
  if (from) params.set("from", from.toISOString());
  if (to) params.set("to", to.toISOString());
  return `/api/reports?${params.toString()}`;
}

export function usePatientReport(from?: Date, to?: Date) {
  return useQuery<PatientReportData>({
    queryKey: ["reports", "patients", from?.toISOString(), to?.toISOString()],
    queryFn: async () => {
      const res = await fetch(buildUrl("patients", from, to));
      if (!res.ok) throw new Error("Falha ao carregar relatório de pacientes");
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useAppointmentReport(from?: Date, to?: Date) {
  return useQuery<AppointmentReportData>({
    queryKey: ["reports", "appointments", from?.toISOString(), to?.toISOString()],
    queryFn: async () => {
      const res = await fetch(buildUrl("appointments", from, to));
      if (!res.ok) throw new Error("Falha ao carregar relatório de consultas");
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useFinanceReport(from?: Date, to?: Date) {
  return useQuery<FinanceReportData>({
    queryKey: ["reports", "finance", from?.toISOString(), to?.toISOString()],
    queryFn: async () => {
      const res = await fetch(buildUrl("finance", from, to));
      if (!res.ok) throw new Error("Falha ao carregar relatório financeiro");
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useCancellationReport(from?: Date, to?: Date) {
  return useQuery<CancellationReportData>({
    queryKey: ["reports", "cancellations", from?.toISOString(), to?.toISOString()],
    queryFn: async () => {
      const res = await fetch(buildUrl("cancellations", from, to));
      if (!res.ok) throw new Error("Falha ao carregar relatório de cancelamentos");
      return res.json();
    },
    staleTime: 60_000,
  });
}
