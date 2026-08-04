import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTime } from "@/lib/utils";
import type { DashboardData } from "../queries/dashboard";

interface AppointmentsTodayProps {
  appointments: DashboardData["todayAppointments"];
}

const statusVariant: Record<string, "success" | "warning" | "danger" | "info" | "secondary"> = {
  COMPLETED: "success",
  SCHEDULED: "warning",
  CONFIRMED: "info",
  IN_PROGRESS: "info",
  CANCELLED: "danger",
  NO_SHOW: "danger",
};

const statusLabel: Record<string, string> = {
  COMPLETED: "Concluída",
  SCHEDULED: "Agendada",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "Em andamento",
  CANCELLED: "Cancelada",
  NO_SHOW: "No-show",
};

export function AppointmentsToday({ appointments }: AppointmentsTodayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultas de Hoje</CardTitle>
        <CardDescription>
          {appointments.length === 0
            ? "Nenhuma consulta agendada para hoje"
            : `${appointments.length} consulta(s) agendada(s)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma consulta para hoje.
          </p>
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horário</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appt) => (
                <TableRow key={appt.id}>
                  <TableCell className="font-medium">
                    {formatTime(appt.startAt)}
                  </TableCell>
                  <TableCell>{appt.patientName}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: appt.professionalColor }}
                      />
                      {appt.professionalName}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[appt.status] ?? "secondary"}>
                      {statusLabel[appt.status] ?? appt.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
