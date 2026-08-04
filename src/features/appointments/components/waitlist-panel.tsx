"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { Clock, Trash2, Phone } from "lucide-react";
import { waitlistCreateSchema } from "@/lib/validations/appointment";
import { cn, formatPhone } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  useWaitingList,
  useCreateWaitingListEntry,
  useUpdateWaitingListStatus,
  useDeleteWaitingListEntry,
} from "../queries/appointments";
import type { WaitingListEntryWithRelations } from "../types";
import { WAITLIST_STATUS_LABELS } from "../types";

interface WaitlistPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  patients: { id: string; name: string; phone: string | null }[];
  professionals: { id: string; name: string }[];
  specialties: { id: string; name: string }[];
}

export function WaitlistPanel({
  open,
  onOpenChange,
  organizationId,
  patients,
  professionals,
  specialties,
}: WaitlistPanelProps) {
  const { data: entries = [], isLoading } = useWaitingList(organizationId);
  const createMutation = useCreateWaitingListEntry();
  const updateStatusMutation = useUpdateWaitingListStatus();
  const deleteMutation = useDeleteWaitingListEntry();

  const [showForm, setShowForm] = React.useState(false);
  const [deleteTarget, setDeleteTarget] =
    React.useState<WaitingListEntryWithRelations | null>(null);

  const form = useForm({
    resolver: zodResolver(waitlistCreateSchema),
    defaultValues: {
      patientId: "",
      professionalId: "",
      specialtyId: "",
      preferredDate: "",
      priority: 1,
      notes: "",
    },
  });

  function onAdd(data: {
    patientId: string;
    professionalId?: string;
    specialtyId?: string;
    preferredDate?: string;
    priority?: number;
    notes?: string;
  }) {
    createMutation.mutate(
      { organizationId, ...data },
      {
        onSuccess: () => {
          toast.success("Adicionado à fila de espera.");
          form.reset();
          setShowForm(false);
        },
        onError: () => toast.error("Erro ao adicionar."),
      },
    );
  }

  function onUpdateStatus(entryId: string, status: string) {
    updateStatusMutation.mutate(
      { id: entryId, organizationId, status },
      {
        onSuccess: () => toast.success("Status atualizado."),
        onError: () => toast.error("Erro ao atualizar."),
      },
    );
  }

  function onDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      { id: deleteTarget.id, organizationId },
      {
        onSuccess: () => {
          toast.success("Removido da fila.");
          setDeleteTarget(null);
        },
        onError: () => toast.error("Erro ao remover."),
      },
    );
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Fila de Espera</SheetTitle>
            <SheetDescription>
              Gerencie a fila de espera de pacientes.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {entries.length} {entries.length === 1 ? "paciente" : "pacientes"}{" "}
              na fila
            </p>
            <Button
              size="sm"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancelar" : "+ Adicionar"}
            </Button>
          </div>

          {/* Add form */}
          {showForm && (
            <div className="mt-4 rounded-lg border p-3">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onAdd)}
                  className="space-y-3"
                >
                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paciente *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {patients.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="professionalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profissional</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Opcional" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {professionals.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialtyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especialidade</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Opcional" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {specialties.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="preferredDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data preferida</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridade (1–5)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    size="sm"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Adicionando..." : "Adicionar"}
                  </Button>
                </form>
              </Form>
            </div>
          )}

          {/* Entry list */}
          <div className="mt-4 space-y-2">
            {isLoading && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Carregando...
              </p>
            )}

            {!isLoading && entries.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum paciente na fila de espera.
              </p>
            )}

            {entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border p-3 transition-colors hover:bg-accent/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {entry.patient.name}
                    </p>
                    {entry.patient.phone && (
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {formatPhone(entry.patient.phone)}
                      </div>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {entry.professional && (
                        <Badge variant="outline" className="text-[10px]">
                          {entry.professional.name}
                        </Badge>
                      )}
                      {entry.specialty && (
                        <Badge variant="secondary" className="text-[10px]">
                          {entry.specialty.name}
                        </Badge>
                      )}
                      {entry.preferredDate && (
                        <Badge variant="outline" className="text-[10px]">
                          <Clock className="mr-1 h-2.5 w-2.5" />
                          {format(new Date(entry.preferredDate), "dd/MM/yyyy")}
                        </Badge>
                      )}
                      <Badge variant="info" className="text-[10px]">
                        P{entry.priority}
                      </Badge>
                    </div>
                    {entry.notes && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {entry.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Badge
                      className={cn(
                        "cursor-pointer text-[10px]",
                        entry.status === "waiting" && "bg-muted",
                        entry.status === "contacted" && "bg-blue-500/15 text-blue-600",
                        entry.status === "confirmed" && "bg-emerald-500/15 text-emerald-600",
                        entry.status === "cancelled" && "bg-rose-500/15 text-rose-600",
                      )}
                      onClick={() => {
                        const next =
                          entry.status === "waiting"
                            ? "contacted"
                            : entry.status === "contacted"
                              ? "confirmed"
                              : "waiting";
                        onUpdateStatus(entry.id, next);
                      }}
                    >
                      {WAITLIST_STATUS_LABELS[entry.status] || entry.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setDeleteTarget(entry)}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover da fila?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover{" "}
              <strong>{deleteTarget?.patient.name}</strong> da fila de espera?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
