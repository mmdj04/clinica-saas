"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  appointmentCreateSchema,
  appointmentUpdateSchema,
} from "@/lib/validations/appointment";
import type { AppointmentCreateInput } from "@/lib/validations/appointment";
import {
  createAppointmentAction,
  updateAppointmentAction,
} from "../actions";
import type { AppointmentWithRelations } from "../types";
import { TYPE_LABELS } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  appointment?: AppointmentWithRelations;
  patients: { id: string; name: string; phone: string | null }[];
  professionals: {
    id: string;
    name: string;
    color: string;
    specialtyId: string | null;
  }[];
  rooms: { id: string; name: string }[];
  specialties: { id: string; name: string; color: string }[];
  defaultDate?: Date;
  onSuccess?: () => void;
}

export function AppointmentForm({
  open,
  onOpenChange,
  organizationId,
  appointment,
  patients,
  professionals,
  rooms,
  specialties,
  defaultDate,
  onSuccess,
}: AppointmentFormProps) {
  const isEditing = !!appointment;

  const defaultStartAt = defaultDate
    ? format(defaultDate, "yyyy-MM-dd'T'HH:mm")
    : format(new Date(), "yyyy-MM-dd'T'HH:mm");

  const defaultEndAt = defaultDate
    ? (() => {
        const d = new Date(defaultDate);
        d.setMinutes(d.getMinutes() + 30);
        return format(d, "yyyy-MM-dd'T'HH:mm");
      })()
    : (() => {
        const d = new Date();
        d.setMinutes(d.getMinutes() + 30);
        return format(d, "yyyy-MM-dd'T'HH:mm");
      })();

  const form = useForm({
    resolver: zodResolver(
      isEditing ? appointmentUpdateSchema : appointmentCreateSchema,
    ),
    defaultValues: {
      patientId: appointment?.patientId ?? "",
      professionalId: appointment?.professionalId ?? "",
      roomId: appointment?.roomId ?? "",
      specialtyId: appointment?.specialtyId ?? "",
      startAt: appointment
        ? format(new Date(appointment.startAt), "yyyy-MM-dd'T'HH:mm")
        : defaultStartAt,
      endAt: appointment
        ? format(new Date(appointment.endAt), "yyyy-MM-dd'T'HH:mm")
        : defaultEndAt,
      type: appointment?.type ?? "RETURN",
      price: appointment?.price ? Number(appointment.price) : 0,
      notes: appointment?.notes ?? "",
    },
  });

  const [isPending, startTransition] = React.useTransition();

  function onSubmit(data: Record<string, unknown>) {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fd.set(key, String(value));
        }
      });

      let result;
      if (isEditing) {
        result = await updateAppointmentAction(
          appointment.id,
          organizationId,
          null,
          fd,
        );
      } else {
        result = await createAppointmentAction(organizationId, null, fd);
      }

      if (result?.success) {
        toast.success(isEditing ? "Agendamento atualizado!" : "Agendamento criado!");
        onOpenChange(false);
        form.reset();
        onSuccess?.();
      } else {
        toast.error(result?.message || "Erro ao salvar agendamento.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Altere os dados do agendamento."
              : "Preencha os dados para criar um novo agendamento."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Patient */}
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o paciente" />
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

            {/* Professional */}
            <FormField
              control={form.control}
              name="professionalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profissional *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o profissional" />
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

            {/* Row: Room + Specialty */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sala</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Opcional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
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
                      disabled={isPending}
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

            {/* Row: Start + End */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="startAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data/hora início *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data/hora fim *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row: Type + Price */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Observações opcionais..."
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : isEditing ? "Salvar" : "Agendar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
