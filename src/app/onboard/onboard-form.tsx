"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { createOrganizationAction } from "@/features/organization/actions";
import { organizationCreateSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { z } from "zod";

type FormValues = z.infer<typeof organizationCreateSchema>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      Configurar clínica
    </Button>
  );
}

export function OnboardForm() {
  const [state, formAction] = useFormState(createOrganizationAction, undefined);

  const form = useForm<FormValues>({
    resolver: zodResolver(organizationCreateSchema),
    defaultValues: { name: "", slug: "", cnpj: "", primaryColor: "#7c3aed" },
  });

  return (
    <Card className="shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Configure sua clínica</CardTitle>
        <CardDescription>
          Dê um nome à sua clínica. Você pode editar depois na administração.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome da clínica
            </label>
            <Input
              id="name"
              name="name"
              placeholder="Ex.: Clínica Vida"
              onChange={(e) => {
                const name = e.target.value;
                form.setValue("slug", slugify(name) || "");
              }}
            />
            {state && "error" in state ? (
              <p className="text-[0.8rem] font-medium text-destructive">
                {state.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium">
              Endereço de acesso
            </label>
            <Input id="slug" name="slug" placeholder="clinica-vida" />
            <p className="text-xs text-muted-foreground">
              URL única da sua clínica no SaaS.
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="cnpj" className="text-sm font-medium">
              CNPJ <span className="text-muted-foreground">(opcional)</span>
            </label>
            <Input id="cnpj" name="cnpj" placeholder="00.000.000/0001-00" />
          </div>
          <input type="hidden" name="primaryColor" value="#7c3aed" />
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}