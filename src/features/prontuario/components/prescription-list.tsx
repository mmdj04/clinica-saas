"use client";

import { Printer, Pill, User, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/empty-state";
import { usePrescriptions } from "../queries/prontuario";
import { formatDate } from "@/lib/utils";
import type { PrescriptionItem } from "../types";

interface PrescriptionListProps {
  patientId: string;
}

export function PrescriptionList({ patientId }: PrescriptionListProps) {
  const { data: prescriptions, isLoading } = usePrescriptions(patientId);

  function handlePrint() {
    window.print();
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!prescriptions?.length) {
    return (
      <EmptyState
        icon={<Pill className="h-6 w-6" />}
        title="Nenhuma receita emitida"
        description="Emita a primeira receita para este paciente."
      />
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="space-y-4 pr-4 print:space-y-2">
        {prescriptions.map((prescription) => {
          const items = prescription.items as unknown as PrescriptionItem[];

          return (
            <Card key={prescription.id} className="print:break-inside-avoid print:shadow-none print:border">
              <CardHeader className="print:p-2 print:pb-1">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base print:text-sm">
                    Receita Médica
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="print:hidden">
                      Válida por {prescription.validDays} dias
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePrint}
                      className="print:hidden"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {prescription.professional.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(prescription.issuedAt)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="print:p-2">
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-md bg-muted/50 p-3 print:bg-transparent print:p-1"
                    >
                      <div className="font-medium print:text-sm">
                        {item.medicine}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground print:text-foreground">
                        <span>Posologia: {item.dosage}</span>
                        <span className="mx-2">•</span>
                        <span>Frequência: {item.frequency}</span>
                        {item.duration && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Duração: {item.duration}</span>
                          </>
                        )}
                      </div>
                      {item.observations && (
                        <div className="mt-1 text-xs text-muted-foreground italic">
                          {item.observations}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {prescription.guidelines && (
                  <div className="mt-4 border-t pt-3 print:mt-2 print:pt-1">
                    <h4 className="text-xs font-medium uppercase text-muted-foreground mb-1">
                      Orientações
                    </h4>
                    <p className="whitespace-pre-wrap text-sm">
                      {prescription.guidelines}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
