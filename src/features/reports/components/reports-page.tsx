"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Users,
  Calendar,
  Wallet,
  AlertTriangle,
  Download,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { DateRangeSelector } from "./date-range-selector";
import { PatientReport } from "./patient-report";
import { AppointmentReport } from "./appointment-report";
import { FinanceReport } from "./finance-report";
import { CancellationReport } from "./cancellation-report";
import type { DateRange } from "../types";

interface ReportsPageProps {
  defaultRange: DateRange;
}

export function ReportsPage({ defaultRange }: ReportsPageProps) {
  const [dateRange, setDateRange] = React.useState<DateRange>(defaultRange);

  const handleExport = (format: "pdf" | "excel") => {
    toast.info(
      `Exportação em breve — funcionalidade será implementada com Resend + ${format === "pdf" ? "pdf-lib" : "xlsx"}`,
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Análises e indicadores da clínica"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("pdf")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("excel")}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </PageHeader>

      <DateRangeSelector value={dateRange} onChange={setDateRange} />

      <Separator />

      <Tabs defaultValue="patients" className="space-y-6">
        <TabsList className="w-full flex-wrap justify-start h-auto">
          <TabsTrigger value="patients" className="gap-2">
            <Users className="h-4 w-4" />
            Pacientes
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2">
            <Calendar className="h-4 w-4" />
            Consultas
          </TabsTrigger>
          <TabsTrigger value="finance" className="gap-2">
            <Wallet className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="cancellations" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Cancelamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients">
          <PatientReport dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="appointments">
          <AppointmentReport dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="finance">
          <FinanceReport dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="cancellations">
          <CancellationReport dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
