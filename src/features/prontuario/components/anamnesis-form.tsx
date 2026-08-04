"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useAnamnesis, useUpsertAnamnesis } from "../queries/prontuario";
import type { AnamnesisContent } from "../types";

const anamnesisFormSchema = z.object({
  chiefComplaint: z.string().max(5000).default(""),
  presentIllnessHistory: z.string().max(10_000).default(""),
  pastHistory: z.string().max(10_000).default(""),
  allergies: z.string().max(5000).default(""),
  currentMedications: z.string().max(5000).default(""),
  familyHistory: z.string().max(5000).default(""),
  lifestyle: z.string().max(5000).default(""),
  physicalExam: z.string().max(10_000).default(""),
});

type AnamnesisFormValues = z.infer<typeof anamnesisFormSchema>;

const ANAMNESIS_FIELDS = [
  {
    name: "chiefComplaint" as const,
    label: "Queixa Principal",
    placeholder: "Descreva a queixa principal do paciente...",
  },
  {
    name: "presentIllnessHistory" as const,
    label: "História da Doença Atual",
    placeholder: "Descreva a história da doença atual...",
  },
  {
    name: "pastHistory" as const,
    label: "Histórico Pessoal e Patológico",
    placeholder: "Doenças anteriores, cirurgias, internações...",
  },
  {
    name: "allergies" as const,
    label: "Alergias",
    placeholder: "Medicamentos, alimentos, substâncias...",
  },
  {
    name: "currentMedications" as const,
    label: "Medicações em Uso",
    placeholder: "Lista de medicamentos em uso contínuo...",
  },
  {
    name: "familyHistory" as const,
    label: "Histórico Familiar",
    placeholder: "Doenças na família (pais, avós, irmãos)...",
  },
  {
    name: "lifestyle" as const,
    label: "Hábitos de Vida",
    placeholder: "Tabagismo, etilismo, atividade física, alimentação...",
  },
  {
    name: "physicalExam" as const,
    label: "Exame Físico",
    placeholder: "Achados do exame físico geral e específico...",
  },
];

interface AnamnesisFormProps {
  patientId: string;
}

export function AnamnesisForm({ patientId }: AnamnesisFormProps) {
  const { data: existing, isLoading } = useAnamnesis(patientId);
  const upsertMutation = useUpsertAnamnesis();

  const form = useForm<AnamnesisFormValues>({
    resolver: zodResolver(anamnesisFormSchema) as Resolver<AnamnesisFormValues>,
    defaultValues: {
      chiefComplaint: "",
      presentIllnessHistory: "",
      pastHistory: "",
      allergies: "",
      currentMedications: "",
      familyHistory: "",
      lifestyle: "",
      physicalExam: "",
    },
  });

  // Populate form with existing data
  useEffect(() => {
    if (existing?.content) {
      const content = existing.content as AnamnesisContent;
      form.reset({
        chiefComplaint: content.chiefComplaint ?? "",
        presentIllnessHistory: content.presentIllnessHistory ?? "",
        pastHistory: content.pastHistory ?? "",
        allergies: content.allergies ?? "",
        currentMedications: content.currentMedications ?? "",
        familyHistory: content.familyHistory ?? "",
        lifestyle: content.lifestyle ?? "",
        physicalExam: content.physicalExam ?? "",
      });
    }
  }, [existing, form]);

  async function onSubmit(values: AnamnesisFormValues) {
    try {
      await upsertMutation.mutateAsync({
        patientId,
        content: values as AnamnesisContent,
      });
      toast.success("Anamnese salva com sucesso");
    } catch {
      toast.error("Erro ao salvar anamnese");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-24 w-full animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Anamnese</h3>
            {existing && (
              <p className="text-xs text-muted-foreground">
                Versão {existing.version} • Atualizada em{" "}
                {new Date(existing.updatedAt).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
          <Button type="submit" disabled={upsertMutation.isPending}>
            {upsertMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {ANAMNESIS_FIELDS.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={field.placeholder}
                      className="min-h-[120px] resize-y"
                      {...formField}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </form>
    </Form>
  );
}
