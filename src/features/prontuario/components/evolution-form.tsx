"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useCreateEvolution } from "../queries/prontuario";
import type { EvolutionType } from "../types";

const evolutionFormSchema = z.object({
  type: z.enum(["INITIAL", "EVOLUTION", "PROFESSIONAL_NOTE", "DISCHARGE"]),
  content: z.string().min(5, "Conteúdo muito curto").max(50_000),
});

type EvolutionFormValues = z.infer<typeof evolutionFormSchema>;

const EVOLUTION_TYPES: { value: EvolutionType; label: string }[] = [
  { value: "INITIAL", label: "Atendimento Inicial" },
  { value: "EVOLUTION", label: "Evolução" },
  { value: "PROFESSIONAL_NOTE", label: "Nota Profissional" },
  { value: "DISCHARGE", label: "Alta" },
];

interface EvolutionFormProps {
  patientId: string;
}

export function EvolutionForm({ patientId }: EvolutionFormProps) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateEvolution();

  const form = useForm<EvolutionFormValues>({
    resolver: zodResolver(evolutionFormSchema),
    defaultValues: {
      type: "EVOLUTION",
      content: "",
    },
  });

  async function onSubmit(values: EvolutionFormValues) {
    try {
      await createMutation.mutateAsync({
        patientId,
        type: values.type,
        content: values.content,
      });
      toast.success("Evolução registrada com sucesso");
      form.reset({ type: "EVOLUTION", content: "" });
      setOpen(false);
    } catch {
      toast.error("Erro ao registrar evolução");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nova Evolução
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Evolução</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EVOLUTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva a evolução do paciente..."
                      className="min-h-[200px] resize-y"
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
