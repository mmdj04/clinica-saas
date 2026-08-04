"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import { useCreateExam } from "../queries/prontuario";

const examFormSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(200),
  category: z.string().max(100).default(""),
  status: z.enum(["ordered", "collected", "ready", "delivered"]).default("ordered"),
  summary: z.string().max(5000).default(""),
});

type ExamFormValues = z.infer<typeof examFormSchema>;

interface ExamFormProps {
  patientId: string;
}

export function ExamForm({ patientId }: ExamFormProps) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateExam();

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema) as Resolver<ExamFormValues>,
    defaultValues: {
      name: "",
      category: "",
      status: "ordered",
      summary: "",
    },
  });

  async function onSubmit(values: ExamFormValues) {
    try {
      await createMutation.mutateAsync({
        patientId,
        name: values.name,
        category: values.category,
        status: values.status,
        summary: values.summary,
      });
      toast.success("Exame registrado com sucesso");
      form.reset();
      setOpen(false);
    } catch {
      toast.error("Erro ao registrar exame");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Novo Exame
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Exame</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Exame</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Hemograma completo, Raio-X tórax..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Laboratorial, Imagem..."
                        {...field}
                      />
                    </FormControl>
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ordered">Solicitado</SelectItem>
                        <SelectItem value="collected">Coletado</SelectItem>
                        <SelectItem value="ready">Pronto</SelectItem>
                        <SelectItem value="delivered">Entregue</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resumo / Resultado</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o resultado do exame..."
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
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Registrar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
