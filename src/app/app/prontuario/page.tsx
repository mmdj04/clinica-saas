"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, User, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientSearch } from "@/features/prontuario/queries/prontuario";
import { getInitials } from "@/lib/utils";

export default function ProntuarioSearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: patients, isLoading } = usePatientSearch(searchQuery);

  const handleSelectPatient = useCallback(
    (patientId: string) => {
      router.push(`/app/prontuario/${patientId}`);
    },
    [router],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prontuário"
        description="Busque o paciente pelo nome, CPF ou telefone para acessar o prontuário."
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar paciente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-transparent pl-9 pr-4 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : !patients?.length ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title={
            searchQuery
              ? "Nenhum paciente encontrado"
              : "Busque por um paciente"
          }
          description={
            searchQuery
              ? "Tente outros termos de busca."
              : "Digite o nome, CPF ou telefone do paciente."
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <Card
              key={patient.id}
              className="cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => handleSelectPatient(patient.id)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={patient.photoUrl ?? undefined} />
                  <AvatarFallback>
                    {getInitials(patient.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{patient.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {patient.cpf && <span>CPF: {patient.cpf}</span>}
                    {patient.phone && <span>Tel: {patient.phone}</span>}
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
