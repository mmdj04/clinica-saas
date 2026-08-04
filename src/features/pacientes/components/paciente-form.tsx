"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientCreateSchema } from "@/lib/validations/patient";
import type { PatientCreateInput } from "@/lib/validations/patient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TagList, type TagItem } from "./tag-list";
import { toast } from "sonner";
import type { PatientListItem, PatientStatus } from "@/features/pacientes/types";
import { createPatientAction, updatePatientAction } from "@/features/pacientes/actions";
import { useQueryClient } from "@tanstack/react-query";

interface PacienteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: PatientListItem | null;
  tags: TagItem[];
}

export function PacienteForm({ open, onOpenChange, patient, tags }: PacienteFormProps) {
  const isEditing = !!patient;
  const queryClient = useQueryClient();
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>(
    patient?.tags.map((t) => t.id) ?? [],
  );
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<PatientCreateInput>({
    resolver: zodResolver(patientCreateSchema) as Resolver<PatientCreateInput>,
    defaultValues: {
      name: patient?.name ?? "",
      email: patient?.email ?? "",
      phone: patient?.phone ?? "",
      cpf: patient?.cpf ?? "",
      rg: patient?.rg ?? "",
      birthDate: patient?.birthDate
        ? new Date(patient.birthDate).toISOString().split("T")[0]
        : "",
      gender: (patient?.gender as PatientCreateInput["gender"]) ?? "NOT_INFORMED",
      cep: patient?.cep ?? "",
      address: patient?.address ?? "",
      city: patient?.city ?? "",
      state: patient?.state ?? "",
      insuranceProvider: patient?.insuranceProvider ?? "",
      insuranceNumber: patient?.insuranceNumber ?? "",
      emergencyContact: patient?.emergencyContact ?? "",
      emergencyPhone: patient?.emergencyPhone ?? "",
      responsibleName: patient?.responsibleName ?? "",
      responsiblePhone: patient?.responsiblePhone ?? "",
      notes: patient?.notes ?? "",
      source: patient?.source ?? "",
      status: (patient?.status as PatientStatus) ?? "active",
      tags: patient?.tags.map((t) => t.id) ?? [],
    },
  });

  React.useEffect(() => {
    if (open) {
      setSelectedTagIds(patient?.tags.map((t) => t.id) ?? []);
      form.reset({
        name: patient?.name ?? "",
        email: patient?.email ?? "",
        phone: patient?.phone ?? "",
        cpf: patient?.cpf ?? "",
        rg: patient?.rg ?? "",
        birthDate: patient?.birthDate
          ? new Date(patient.birthDate).toISOString().split("T")[0]
          : "",
        gender: (patient?.gender as PatientCreateInput["gender"]) ?? "NOT_INFORMED",
        cep: patient?.cep ?? "",
        address: patient?.address ?? "",
        city: patient?.city ?? "",
        state: patient?.state ?? "",
        insuranceProvider: patient?.insuranceProvider ?? "",
        insuranceNumber: patient?.insuranceNumber ?? "",
        emergencyContact: patient?.emergencyContact ?? "",
        emergencyPhone: patient?.emergencyPhone ?? "",
        responsibleName: patient?.responsibleName ?? "",
        responsiblePhone: patient?.responsiblePhone ?? "",
        notes: patient?.notes ?? "",
        source: patient?.source ?? "",
        status: (patient?.status as PatientStatus) ?? "active",
        tags: patient?.tags.map((t) => t.id) ?? [],
      });
    }
  }, [open, patient, form]);

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  }

  async function onSubmit(data: PatientCreateInput) {
    setSubmitting(true);
    const fd = new FormData();
    fd.append("name", data.name);
    fd.append("email", data.email ?? "");
    fd.append("phone", data.phone ?? "");
    fd.append("cpf", data.cpf ?? "");
    fd.append("rg", data.rg ?? "");
    fd.append("birthDate", data.birthDate ?? "");
    fd.append("gender", data.gender ?? "NOT_INFORMED");
    fd.append("cep", data.cep ?? "");
    fd.append("address", data.address ?? "");
    fd.append("city", data.city ?? "");
    fd.append("state", data.state ?? "");
    fd.append("insuranceProvider", data.insuranceProvider ?? "");
    fd.append("insuranceNumber", data.insuranceNumber ?? "");
    fd.append("emergencyContact", data.emergencyContact ?? "");
    fd.append("emergencyPhone", data.emergencyPhone ?? "");
    fd.append("responsibleName", data.responsibleName ?? "");
    fd.append("responsiblePhone", data.responsiblePhone ?? "");
    fd.append("notes", data.notes ?? "");
    fd.append("source", data.source ?? "");
    fd.append("status", data.status ?? "active");
    fd.append("tags", JSON.stringify(selectedTagIds));

    let result;
    if (isEditing) {
      fd.append("patientId", patient.id);
      result = await updatePatientAction(null, fd);
    } else {
      result = await createPatientAction(null, fd);
    }

    setSubmitting(false);

    if (result.success) {
      toast.success(isEditing ? "Paciente atualizado" : "Paciente criado com sucesso");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["pacientes"] });
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar paciente" : "Novo paciente"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do paciente."
              : "Preencha os dados para cadastrar um novo paciente."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <Form {...form}>
            <form id="paciente-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="personal">Dados pessoais</TabsTrigger>
                  <TabsTrigger value="address">Endereço</TabsTrigger>
                  <TabsTrigger value="insurance">Plano de saúde</TabsTrigger>
                  <TabsTrigger value="extra">Extras</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do paciente" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG</FormLabel>
                          <FormControl>
                            <Input placeholder="RG" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de nascimento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gênero</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">Masculino</SelectItem>
                            <SelectItem value="FEMALE">Feminino</SelectItem>
                            <SelectItem value="OTHER">Outro</SelectItem>
                            <SelectItem value="NOT_INFORMED">Não informado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="inactive">Inativo</SelectItem>
                            <SelectItem value="blocked">Bloqueado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="address" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input placeholder="00000-000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, número, complemento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UF</FormLabel>
                          <FormControl>
                            <Input placeholder="SP" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="insurance" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="insuranceProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Convênio</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do convênio" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="insuranceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número da carteirinha</FormLabel>
                          <FormControl>
                            <Input placeholder="Nº carteirinha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Separator />
                  <p className="text-sm font-medium text-muted-foreground">Contato de emergência</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do contato</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergencyPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone do contato</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Separator />
                  <p className="text-sm font-medium text-muted-foreground">Responsável (menores)</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="responsibleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do responsável</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="responsiblePhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone do responsável</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="extra" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Como nos conheceu?</FormLabel>
                        <FormControl>
                          <Input placeholder="Indicação, Google, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Observações gerais sobre o paciente..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <TagList
                      tags={tags}
                      selectedTagIds={selectedTagIds}
                      onToggle={toggleTag}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="paciente-form"
            disabled={submitting}
          >
            {submitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar paciente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
