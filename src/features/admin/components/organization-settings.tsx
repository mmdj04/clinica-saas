"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { PageSkeleton } from "@/components/shared/skeletons";
import { updateOrganizationSettingsAction } from "@/features/admin/actions";
import { organizationUpdateSchema } from "@/lib/validations/organization";
import { getOrganization } from "@/features/admin/services/admin-service";
import type { z } from "zod";

interface OrganizationSettingsProps {
  organizationId: string;
  canEdit: boolean;
}

const WEEKDAY_LABELS = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

type OrgFormValues = z.infer<typeof organizationUpdateSchema>;

export function OrganizationSettings({ organizationId, canEdit }: OrganizationSettingsProps) {
  const [org, setOrg] = React.useState<{
    name: string;
    cnpj: string | null;
    primaryColor: string | null;
    logoUrl: string | null;
    settings: unknown;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [actionState, setActionState] = React.useState<unknown>(null);

  const settings = (org?.settings as Record<string, unknown>) ?? {};
  const workingHours = (settings.workingHours as { start: string; end: string }) ?? {
    start: "08:00",
    end: "18:00",
  };
  const weekdays = (settings.weekdays as number[]) ?? [1, 2, 3, 4, 5];
  const slotMinutes = (settings.slotMinutes as number) ?? 30;

  const form = useForm<OrgFormValues>({
    resolver: zodResolver(organizationUpdateSchema) as Resolver<OrgFormValues>,
    defaultValues: {
      name: "",
      cnpj: "",
      primaryColor: "#7c3aed",
      logoUrl: "",
      settings: {
        workingHours: { start: "08:00", end: "18:00" },
        slotMinutes: 30,
        weekdays: [1, 2, 3, 4, 5],
      },
    },
  });

  React.useEffect(() => {
    getOrganization(organizationId).then((o) => {
      if (o) {
        const s = (o.settings as Record<string, unknown>) ?? {};
        setOrg(o);
        form.reset({
          name: o.name,
          cnpj: o.cnpj ?? "",
          primaryColor: o.primaryColor ?? "#7c3aed",
          logoUrl: o.logoUrl ?? "",
          settings: {
            workingHours:
              (s.workingHours as { start: string; end: string }) ?? workingHours,
            slotMinutes: (s.slotMinutes as number) ?? slotMinutes,
            weekdays: (s.weekdays as number[]) ?? weekdays,
          },
        });
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  async function handleSubmit() {
    const values = form.getValues();
    const fd = new FormData();
    fd.set("name", values.name || "");
    fd.set("cnpj", values.cnpj || "");
    fd.set("primaryColor", values.primaryColor || "");
    fd.set("logoUrl", values.logoUrl || "");
    fd.set("workingHours", JSON.stringify(values.settings?.workingHours));
    fd.set("slotMinutes", String(values.settings?.slotMinutes));
    fd.set("weekdays", JSON.stringify(values.settings?.weekdays));

    const result = await updateOrganizationSettingsAction(actionState, fd);
    setActionState(result);

    if (result && "success" in result && result.success) {
      toast.success("Configurações salvas.");
    } else if (result && "message" in result) {
      toast.error(result.message as string);
    }
  }

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Configurações da organização</CardTitle>
          <CardDescription>
            Dados gerais e preferências da clínica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              id="org-settings-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da clínica</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!canEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000/0001-00" {...field} disabled={!canEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor principal</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            className="h-9 w-14 cursor-pointer rounded-md border"
                            {...field}
                            disabled={!canEdit}
                          />
                          <Input
                            value={field.value}
                            onChange={field.onChange}
                            className="flex-1"
                            disabled={!canEdit}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do logotipo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                          disabled={!canEdit}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Horário de funcionamento</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="settings.workingHours.start"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Abertura</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} disabled={!canEdit} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="settings.workingHours.end"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fechamento</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} disabled={!canEdit} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="settings.slotMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração do slot (min)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={5}
                            max={240}
                            {...field}
                            disabled={!canEdit}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Dias da semana</Label>
                <div className="flex flex-wrap gap-3">
                  {WEEKDAY_LABELS.map((day) => (
                    <label
                      key={day.value}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={weekdays.includes(day.value)}
                        disabled={!canEdit}
                        onCheckedChange={(checked) => {
                          const current = form.getValues("settings.weekdays") ?? weekdays;
                          if (checked) {
                            form.setValue(
                              "settings.weekdays",
                              [...current, day.value].sort(),
                            );
                          } else {
                            form.setValue(
                              "settings.weekdays",
                              current.filter((d) => d !== day.value),
                            );
                          }
                        }}
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </div>

              {canEdit && (
                <div className="flex justify-end">
                  <Button type="submit">Salvar configurações</Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
