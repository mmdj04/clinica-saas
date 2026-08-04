"use client";

import { useState } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Loader2, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useCreatePrescription } from "../queries/prontuario";
import { prescriptionItemSchema } from "@/lib/validations/prontuario";

const prescriptionFormSchema = z.object({
  items: z
    .array(prescriptionItemSchema)
    .min(1, "Adicione ao menos um medicamento"),
  guidelines: z.string().max(2000).default(""),
  validDays: z.coerce.number().int().min(1).max(365).default(10),
});

type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;

const DEFAULT_ITEM = {
  medicine: "",
  dosage: "",
  frequency: "",
  duration: "",
  observations: "",
};

interface PrescriptionFormProps {
  patientId: string;
}

export function PrescriptionForm({ patientId }: PrescriptionFormProps) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreatePrescription();

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema) as Resolver<PrescriptionFormValues>,
    defaultValues: {
      items: [{ ...DEFAULT_ITEM }],
      guidelines: "",
      validDays: 10,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  async function onSubmit(values: PrescriptionFormValues) {
    try {
      await createMutation.mutateAsync({
        patientId,
        items: values.items,
        guidelines: values.guidelines,
        validDays: values.validDays,
      });
      toast.success("Receita criada com sucesso");
      form.reset({ items: [{ ...DEFAULT_ITEM }], guidelines: "", validDays: 10 });
      setOpen(false);
    } catch {
      toast.error("Erro ao criar receita");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Pill className="mr-2 h-4 w-4" />
          Nova Receita
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Receita</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      Medicamento {index + 1}
                    </h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="h-7 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.medicine`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Medicamento</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nome do medicamento"
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.dosage`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Posologia</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 500mg" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.frequency`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Frequência</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: 8/8h"
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.duration`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Duração</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: 7 dias"
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`items.${index}.observations`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Observações adicionais"
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ ...DEFAULT_ITEM })}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Medicamento
              </Button>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="validDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validade (dias)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={365} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="guidelines"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orientações Gerais</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Orientações gerais para o paciente..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Pill className="mr-2 h-4 w-4" />
                )}
                Criar Receita
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
