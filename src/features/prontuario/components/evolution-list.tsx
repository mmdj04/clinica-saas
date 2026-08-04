"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/empty-state";
import { useEvolutions } from "../queries/prontuario";
import { formatDate, formatTime } from "@/lib/utils";
import type { EvolutionType } from "../types";

const EVOLUTION_TYPE_LABELS: Record<EvolutionType, string> = {
  INITIAL: "Atendimento Inicial",
  EVOLUTION: "Evolução",
  PROFESSIONAL_NOTE: "Nota Profissional",
  DISCHARGE: "Alta",
};

const EVOLUTION_TYPE_VARIANTS: Record<
  EvolutionType,
  "default" | "secondary" | "info" | "success" | "warning"
> = {
  INITIAL: "info",
  EVOLUTION: "default",
  PROFESSIONAL_NOTE: "secondary",
  DISCHARGE: "success",
};

interface EvolutionListProps {
  patientId: string;
}

export function EvolutionList({ patientId }: EvolutionListProps) {
  const { data: evolutions, isLoading } = useEvolutions(patientId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            <div className="h-20 w-full animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (!evolutions?.length) {
    return (
      <EmptyState
        icon={<FileText className="h-6 w-6" />}
        title="Nenhuma evolução registrada"
        description="Registre a primeira evolução deste paciente."
      />
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="space-y-4 pr-4">
        <AnimatePresence mode="popLayout">
          {evolutions.map((evo, index) => (
            <motion.div
              key={evo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={EVOLUTION_TYPE_VARIANTS[evo.type]}>
                          {EVOLUTION_TYPE_LABELS[evo.type]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(evo.createdAt)} às{" "}
                          {formatTime(evo.createdAt)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm">
                        {evo.content}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{evo.professional.name}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
