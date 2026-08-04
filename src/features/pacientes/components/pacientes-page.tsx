"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Plus, User, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { PageSkeleton } from "@/components/shared/skeletons";
import { PacienteList } from "./paciente-list";
import { PacienteForm } from "./paciente-form";
import { PacienteDetail } from "./paciente-detail";
import { type TagItem } from "./tag-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { usePatientList } from "@/features/pacientes/queries/pacientes";
import { deletePatientAction } from "@/features/pacientes/actions";
import { toast } from "sonner";
import type { PatientListItem, PatientStatus } from "@/features/pacientes/types";

interface PacientesPageProps {
  tags: TagItem[];
}

export function PacientesPage({ tags }: PacientesPageProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<PatientStatus | "all">("all");
  const [tagFilter, setTagFilter] = React.useState<string>("");
  const [page, setPage] = React.useState(1);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingPatient, setEditingPatient] = React.useState<PatientListItem | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailPatientId, setDetailPatientId] = React.useState<string | null>(null);
  const [deletingPatient, setDeletingPatient] = React.useState<PatientListItem | null>(null);

  const { data, isLoading } = usePatientList({
    q: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    tag: tagFilter || undefined,
    page,
    limit: 20,
  });

  const patients = (data?.items ?? []) as unknown as PatientListItem[];
  const totalPages = data?.totalPages ?? 1;

  function handleView(patient: PatientListItem) {
    setDetailPatientId(patient.id);
    setDetailOpen(true);
  }

  function handleEdit(patient: PatientListItem) {
    setEditingPatient(patient);
    setFormOpen(true);
  }

  function handleCreate() {
    setEditingPatient(null);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deletingPatient) return;
    const result = await deletePatientAction(deletingPatient.id);
    if (result.success) {
      toast.success("Paciente excluído com sucesso");
      setDeletingPatient(null);
    } else {
      toast.error(result.error);
    }
  }

  if (isLoading && patients.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <PageHeader
        title="Pacientes"
        description="Gerencie o cadastro de pacientes da clínica."
      >
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo paciente
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Buscar por nome, telefone, e-mail ou CPF..."
          onValueChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          className="w-full sm:max-w-sm"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as PatientStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
            <SelectItem value="blocked">Bloqueados</SelectItem>
          </SelectContent>
        </Select>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  setTagFilter(tagFilter === tag.name ? "" : tag.name);
                  setPage(1);
                }}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  tagFilter === tag.name
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                style={
                  tagFilter !== tag.name
                    ? { borderColor: tag.color + "40", color: tag.color }
                    : undefined
                }
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      {patients.length === 0 && !isLoading ? (
        <EmptyState
          icon={<User className="h-6 w-6" />}
          title="Nenhum paciente cadastrado"
          description={search || statusFilter !== "all" || tagFilter
            ? "Nenhum paciente corresponde aos filtros aplicados."
            : "Comece cadastrando o primeiro paciente da clínica."}
          action={
            !search && statusFilter === "all" && !tagFilter ? (
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar paciente
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setTagFilter("");
                  setPage(1);
                }}
              >
                Limpar filtros
              </Button>
            )
          }
        />
      ) : (
        <PacienteList
          data={patients}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={setDeletingPatient}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Create / Edit Form */}
      <PacienteForm
        open={formOpen}
        onOpenChange={setFormOpen}
        patient={editingPatient}
        tags={tags}
      />

      {/* Detail Sheet */}
      <PacienteDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        patientId={detailPatientId}
        onEdit={handleEdit}
        onDelete={setDeletingPatient}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingPatient}
        onOpenChange={(open) => {
          if (!open) setDeletingPatient(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir paciente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o paciente{" "}
              <strong>{deletingPatient?.name}</strong>? Esta ação não pode ser desfeita.
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
