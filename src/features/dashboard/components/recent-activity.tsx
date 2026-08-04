import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  UserPlus,
  CalendarPlus,
  FileText,
  CreditCard,
  Settings,
  Activity,
} from "lucide-react";
import type { DashboardData } from "../queries/dashboard";

interface RecentActivityProps {
  activities: DashboardData["recentActivity"];
}

const actionIcons: Record<string, typeof Activity> = {
  "patient.create": UserPlus,
  "patient.update": UserPlus,
  "appointment.create": CalendarPlus,
  "appointment.update": CalendarPlus,
  "evolution.create": FileText,
  "transaction.create": CreditCard,
  "settings.update": Settings,
};

const actionLabels: Record<string, string> = {
  "patient.create": "Paciente criado",
  "patient.update": "Paciente atualizado",
  "appointment.create": "Consulta agendada",
  "appointment.update": "Consulta atualizada",
  "evolution.create": "Evolução registrada",
  "transaction.create": "Transação registrada",
  "settings.update": "Configurações atualizadas",
};

const entityLabels: Record<string, string> = {
  Patient: "Paciente",
  Appointment: "Consulta",
  Evolution: "Evolução",
  Transaction: "Transação",
  Settings: "Configuração",
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <CardDescription>Últimas 10 ações registradas</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma atividade registrada.
          </p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {activities.map((log) => {
                const Icon = actionIcons[log.action] ?? Activity;
                const label = actionLabels[log.action] ?? log.action;
                const entity = entityLabels[log.entityType] ?? log.entityType;

                return (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground">
                        {entity}
                        {log.actorName ? ` — ${log.actorName}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
