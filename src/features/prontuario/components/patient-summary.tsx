"use client";

import { User, Calendar, Clock, FileText, Pill, TestTube } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientSummary, usePatientStats } from "../queries/prontuario";
import { getInitials, formatDate } from "@/lib/utils";

interface PatientSummaryProps {
  patientId: string;
}

export function PatientSummary({ patientId }: PatientSummaryProps) {
  const { data: patient, isLoading: loadingPatient } = usePatientSummary(patientId);
  const { data: stats, isLoading: loadingStats } = usePatientStats(patientId);

  if (loadingPatient) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-px w-full" />
        <div className="space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14">
          <AvatarImage src={patient.photoUrl ?? undefined} alt={patient.name} />
          <AvatarFallback className="text-lg">
            {getInitials(patient.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{patient.name}</h3>
          <p className="text-sm text-muted-foreground">
            {patient.cpf ?? "CPF não informado"}
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-3 text-sm">
        {patient.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4 shrink-0" />
            <span>{patient.phone}</span>
          </div>
        )}
        {patient.email && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4 shrink-0" />
            <span className="truncate">{patient.email}</span>
          </div>
        )}
        {patient.birthDate && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{formatDate(patient.birthDate)}</span>
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="text-xs font-medium uppercase text-muted-foreground">
          Resumo
        </h4>
        {loadingStats ? (
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Consultas</span>
              <span className="ml-auto font-medium">{stats?.totalVisits ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Evoluções</span>
              <span className="ml-auto font-medium">
                {stats?.totalEvolutions ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5">
              <Pill className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Receitas</span>
              <span className="ml-auto font-medium">
                {stats?.totalPrescriptions ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5">
              <TestTube className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Exames</span>
              <span className="ml-auto font-medium">{stats?.totalExams ?? 0}</span>
            </div>
          </div>
        )}
      </div>

      {patient.lastVisit && (
        <div className="text-xs text-muted-foreground">
          Última consulta: {formatDate(patient.lastVisit)}
        </div>
      )}
    </div>
  );
}
