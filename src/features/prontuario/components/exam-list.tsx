"use client";

import { TestTube, Download, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/empty-state";
import { useExams } from "../queries/prontuario";
import { formatDate } from "@/lib/utils";
import type { ExamStatus } from "../types";

const STATUS_LABELS: Record<ExamStatus, string> = {
  ordered: "Solicitado",
  collected: "Coletado",
  ready: "Pronto",
  delivered: "Entregue",
};

const STATUS_VARIANTS: Record<ExamStatus, "info" | "warning" | "success" | "secondary"> = {
  ordered: "info",
  collected: "warning",
  ready: "success",
  delivered: "secondary",
};

interface ExamListProps {
  patientId: string;
}

export function ExamList({ patientId }: ExamListProps) {
  const { data: exams, isLoading } = useExams(patientId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded bg-muted"
          />
        ))}
      </div>
    );
  }

  if (!exams?.length) {
    return (
      <EmptyState
        icon={<TestTube className="h-6 w-6" />}
        title="Nenhum exame registrado"
        description="Registre o primeiro exame para este paciente."
      />
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Solicitado em</TableHead>
            <TableHead>Resultado em</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell className="font-medium">{exam.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {exam.category || "—"}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANTS[exam.status as ExamStatus]}>
                  {STATUS_LABELS[exam.status as ExamStatus]}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(exam.orderedAt)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(exam.resultDate)}
              </TableCell>
              <TableCell>
                {exam.fileUrl && (
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={exam.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
