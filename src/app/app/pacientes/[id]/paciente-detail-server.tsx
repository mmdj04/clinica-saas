"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PacienteForm } from "@/features/pacientes/components/paciente-form";
import { toast } from "sonner";
import { formatDate, formatPhone, formatCPF, getInitials } from "@/lib/utils";
import { GENDER_LABELS, STATUS_LABELS } from "@/features/pacientes/types";
import { deletePatientAction } from "@/features/pacientes/actions";
import type { PatientListItem, PatientStatus, PatientGender } from "@/features/pacientes/types";

interface PacienteDetailServerProps {
  patient: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    cpf: string | null;
    rg: string | null;
    birthDate: Date | null;
    gender: string;
    photoUrl: string | null;
    cep: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    insuranceProvider: string | null;
    insuranceNumber: string | null;
    emergencyContact: string | null;
    emergencyPhone: string | null;
    responsibleName: string | null;
    responsiblePhone: string | null;
    notes: string | null;
    source: string | null;
    status: string;
    createdAt: Date;
    tags: { id: string; name: string; color: string }[];
    _count: {
      appointments: number;
      anamnesis: number;
      evolutions: number;
      prescriptions: number;
      exams: number;
      attachments: number;
    };
    recentAppointments: {
      id: string;
      startAt: Date;
      endAt: Date;
      status: string;
      professional: { name: string };
    }[];
  };
}

const statusVariantMap: Record<string, "success" | "secondary" | "danger"> = {
  active: "success",
  inactive: "secondary",
  blocked: "danger",
};

export function PacienteDetailServer({ patient }: PacienteDetailServerProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const patientListItem: PatientListItem = {
    id: patient.id,
    name: patient.name,
    email: patient.email,
    phone: patient.phone,
    cpf: patient.cpf,
    rg: patient.rg,
    birthDate: patient.birthDate,
    gender: patient.gender as PatientGender,
    photoUrl: patient.photoUrl,
    cep: patient.cep,
    address: patient.address,
    city: patient.city,
    state: patient.state,
    insuranceProvider: patient.insuranceProvider,
    insuranceNumber: patient.insuranceNumber,
    emergencyContact: patient.emergencyContact,
    emergencyPhone: patient.emergencyPhone,
    responsibleName: patient.responsibleName,
    responsiblePhone: patient.responsiblePhone,
    notes: patient.notes,
    source: patient.source,
    status: patient.status as PatientStatus,
    createdAt: patient.createdAt,
    updatedAt: patient.createdAt,
    createdById: null,
    tags: patient.tags,
  };

  async function handleDelete() {
    const result = await deletePatientAction(patient.id);
    if (result.success) {
      toast.success("Paciente excluído");
      router.push("/app/pacientes");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/app/pacientes")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{patient.name}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={statusVariantMap[patient.status] ?? "secondary"}>
              {STATUS_LABELS[patient.status as PatientStatus] ?? patient.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {GENDER_LABELS[patient.gender as PatientGender] ?? "—"}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFormOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dados pessoais</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <InfoField label="Nome" value={patient.name} />
              <InfoField label="E-mail" value={patient.email} />
              <InfoField label="Telefone" value={patient.phone ? formatPhone(patient.phone) : null} />
              <InfoField label="CPF" value={patient.cpf ? formatCPF(patient.cpf) : null} />
              <InfoField label="RG" value={patient.rg} />
              <InfoField label="Nascimento" value={formatDate(patient.birthDate)} />
              <InfoField label="Gênero" value={GENDER_LABELS[patient.gender as PatientGender]} />
              <InfoField label="Como nos conheceu" value={patient.source} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <InfoField label="CEP" value={patient.cep} />
              <InfoField label="Endereço" value={patient.address} />
              <InfoField label="Cidade" value={patient.city} />
              <InfoField label="UF" value={patient.state} />
            </CardContent>
          </Card>

          {(patient.insuranceProvider || patient.insuranceNumber) && (
            <Card>
              <CardHeader>
                <CardTitle>Plano de saúde</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <InfoField label="Convênio" value={patient.insuranceProvider} />
                <InfoField label="Nº Carteirinha" value={patient.insuranceNumber} />
              </CardContent>
            </Card>
          )}

          {(patient.emergencyContact || patient.emergencyPhone || patient.responsibleName) && (
            <Card>
              <CardHeader>
                <CardTitle>Emergência / Responsável</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <InfoField label="Contato emergência" value={patient.emergencyContact} />
                <InfoField label="Tel. emergência" value={patient.emergencyPhone ? formatPhone(patient.emergencyPhone) : null} />
                <InfoField label="Responsável" value={patient.responsibleName} />
                <InfoField label="Tel. responsável" value={patient.responsiblePhone ? formatPhone(patient.responsiblePhone) : null} />
              </CardContent>
            </Card>
          )}

          {patient.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{patient.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <StatCard label="Consultas" value={patient._count.appointments} />
              <StatCard label="Evoluções" value={patient._count.evolutions} />
              <StatCard label="Receitas" value={patient._count.prescriptions} />
              <StatCard label="Exames" value={patient._count.exams} />
              <StatCard label="Anamneses" value={patient._count.anamnesis} />
              <StatCard label="Anexos" value={patient._count.attachments} />
            </CardContent>
          </Card>

          {patient.recentAppointments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Consultas recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <PacienteForm
        open={formOpen}
        onOpenChange={setFormOpen}
        patient={patientListItem}
        tags={[]}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir paciente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{patient.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value ?? "—"}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
