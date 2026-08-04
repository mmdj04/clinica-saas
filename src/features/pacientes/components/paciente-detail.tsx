"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Phone,
  Mail,
  FileText,
  Calendar,
  Heart,
  Shield,
  MapPin,
  Edit,
  Trash2,
} from "lucide-react";
import { formatDate, formatPhone, formatCPF, getInitials } from "@/lib/utils";
import { GENDER_LABELS, STATUS_LABELS } from "@/features/pacientes/types";
import type { PatientListItem, PatientStatus, PatientGender } from "@/features/pacientes/types";
import { usePatientDetail } from "@/features/pacientes/queries/pacientes";

const statusVariantMap: Record<PatientStatus, "success" | "secondary" | "danger"> = {
  active: "success",
  inactive: "secondary",
  blocked: "danger",
};

interface PacienteDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string | null;
  onEdit?: (patient: PatientListItem) => void;
  onDelete?: (patient: PatientListItem) => void;
}

export function PacienteDetail({
  open,
  onOpenChange,
  patientId,
  onEdit,
  onDelete,
}: PacienteDetailProps) {
  const { data: patient, isLoading } = usePatientDetail(patientId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Detalhes do paciente</SheetTitle>
          <SheetDescription>Informações completas do paciente</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 pt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : !patient ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Paciente não encontrado</p>
          </div>
        ) : (
          <ScrollArea className="mt-6 h-[calc(100vh-12rem)]">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={patient.photoUrl ?? undefined} />
                  <AvatarFallback className="text-lg">
                    {getInitials(patient.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-semibold">{patient.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariantMap[patient.status as PatientStatus] ?? "secondary"}>
                      {STATUS_LABELS[patient.status as PatientStatus] ?? patient.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {GENDER_LABELS[patient.gender as PatientGender] ?? "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {patient.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {patient.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="text-xs"
                      style={{ backgroundColor: tag.color + "20", color: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              <Separator />

              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Contato</h4>
                <InfoRow icon={Phone} label="Telefone" value={patient.phone ? formatPhone(patient.phone) : null} />
                <InfoRow icon={Mail} label="E-mail" value={patient.email} />
                <InfoRow icon={FileText} label="CPF" value={patient.cpf ? formatCPF(patient.cpf) : null} />
                <InfoRow icon={FileText} label="RG" value={patient.rg} />
                <InfoRow icon={Calendar} label="Nascimento" value={formatDate(patient.birthDate)} />
              </div>

              <Separator />

              {/* Address */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Endereço</h4>
                <InfoRow icon={MapPin} label="CEP" value={patient.cep} />
                <InfoRow icon={MapPin} label="Endereço" value={patient.address} />
                <InfoRow icon={MapPin} label="Cidade/UF" value={patient.city && patient.state ? `${patient.city}/${patient.state}` : patient.city ?? patient.state ?? null} />
              </div>

              <Separator />

              {/* Insurance */}
              {(patient.insuranceProvider || patient.insuranceNumber) && (
                <>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Plano de saúde</h4>
                    <InfoRow icon={Shield} label="Convênio" value={patient.insuranceProvider} />
                    <InfoRow icon={Shield} label="Nº Carteirinha" value={patient.insuranceNumber} />
                  </div>
                  <Separator />
                </>
              )}

              {/* Emergency & Responsible */}
              {(patient.emergencyContact || patient.responsibleName) && (
                <>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Emergência / Responsável</h4>
                    <InfoRow icon={Phone} label="Contato emergência" value={patient.emergencyContact} />
                    <InfoRow icon={Phone} label="Tel. emergência" value={patient.emergencyPhone ? formatPhone(patient.emergencyPhone) : null} />
                    <InfoRow icon={User} label="Responsável" value={patient.responsibleName} />
                    <InfoRow icon={Phone} label="Tel. responsável" value={patient.responsiblePhone ? formatPhone(patient.responsiblePhone) : null} />
                  </div>
                  <Separator />
                </>
              )}

              {/* Notes */}
              {patient.notes && (
                <>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Observações</h4>
                    <p className="whitespace-pre-wrap text-sm">{patient.notes}</p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Quick Stats */}
              {patient._count && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Resumo</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <StatMini label="Consultas" value={patient._count.appointments} />
                    <StatMini label="Evoluções" value={patient._count.evolutions} />
                    <StatMini label="Receitas" value={patient._count.prescriptions} />
                    <StatMini label="Exames" value={patient._count.exams} />
                    <StatMini label="Anamneses" value={patient._count.anamnesis} />
                    <StatMini label="Anexos" value={patient._count.attachments} />
                  </div>
                </div>
              )}

              {/* Recent Appointments */}
              {patient.recentAppointments && patient.recentAppointments.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Consultas recentes
                    </h4>
                    <div className="space-y-2">
                      {patient.recentAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="flex items-center justify-between rounded-lg border p-2.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {formatDate(apt.startAt)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {apt.professional.name}
                            </p>
                          </div>
                          <Badge variant="outline" className="shrink-0 text-[10px]">
                            {apt.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      onEdit(patient as unknown as PatientListItem);
                      onOpenChange(false);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      onDelete(patient as unknown as PatientListItem);
                      onOpenChange(false);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-words text-sm">{value}</p>
      </div>
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-2 text-center">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
