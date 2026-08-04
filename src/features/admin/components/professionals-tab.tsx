"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { EmptyState } from "@/components/shared/empty-state";
import { useProfessionals } from "@/features/admin/queries/admin";
import {
  createProfessionalAction,
  updateProfessionalAction,
  deleteProfessionalAction,
} from "@/features/admin/actions";
import { professionalCreateSchema } from "@/lib/validations/organization";
import { Users, Plus, Edit, Trash2 } from "lucide-react";
import type { z } from "zod";
import type { ProfessionalWithSpecialty, SpecialtyItem } from "@/features/admin/types";

interface ProfessionalsTabProps {
  organizationId: string;
  canEdit: boolean;
  initialData: ProfessionalWithSpecialty[];
  specialtiesData: SpecialtyItem[];
}

type ProfessionalFormValues = z.infer<typeof professionalCreateSchema>;

export function ProfessionalsTab({
  organizationId: _organizationId,
  canEdit,
  initialData,
  specialtiesData,
}: ProfessionalsTabProps) {
  const router = useRouter();
  const { data: professionals } = useProfessionals(initialData);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = React.useState<{ id: string; name: string } | null>(null);
  const [pending, setPending] = React.useState(false);

  const form = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalCreateSchema) as Resolver<ProfessionalFormValues>,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      documentNumber: "",
      specialtyId: "",
      color: "#f59e0b",
      commissionRate: 0,
    },
  });

  function openCreate() {
    setEditing(null);
    form.reset({
      name: "",
      email: "",
      phone: "",
      documentNumber: "",
      specialtyId: "",
      color: "#f59e0b",
      commissionRate: 0,
    });
    setDialogOpen(true);
  }

  function openEdit(p: ProfessionalWithSpecialty) {
    setEditing({ id: p.id, name: p.name });
    form.reset({
      name: p.name,
      email: p.email ?? "",
      phone: p.phone ?? "",
      documentNumber: p.documentNumber ?? "",
      specialtyId: p.specialtyId ?? "",
      color: p.color,
      commissionRate: Number(p.commissionRate),
    });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    setPending(true);
    const values = form.getValues();
    const fd = new FormData();
    fd.set("name", values.name);
    fd.set("email", values.email || "");
    fd.set("phone", values.phone || "");
    fd.set("documentNumber", values.documentNumber || "");
    fd.set("specialtyId", values.specialtyId || "");
    fd.set("color", values.color);
    fd.set("commissionRate", String(values.commissionRate));

    let result;
    if (editing) {
      fd.set("id", editing.id);
      result = await updateProfessionalAction(null, fd);
    } else {
      result = await createProfessionalAction(null, fd);
    }
    setPending(false);

    if (result && "success" in result && result.success) {
      toast.success(editing ? "Profissional atualizado." : "Profissional criado.");
      setDialogOpen(false);
      router.refresh();
    } else if (result && "message" in result) {
      toast.error(result.message as string);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setPending(true);
    const fd = new FormData();
    fd.set("id", deleting.id);
    const result = await deleteProfessionalAction(null, fd);
    setPending(false);

    if (result && "success" in result && result.success) {
      toast.success("Profissional excluído.");
      setDeleting(null);
      router.refresh();
    } else if (result && "message" in result) {
      toast.error(result.message as string);
    }
  }

  async function handleToggleActive(id: string, active: boolean) {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("active", String(active));
    const result = await updateProfessionalAction(null, fd);
    if (result && "success" in result && result.success) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Profissionais</CardTitle>
            <CardDescription>
              Gerencie os profissionais da clínica.
            </CardDescription>
          </div>
          {canEdit && (
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              Novo profissional
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!professionals || professionals.length === 0 ? (
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="Nenhum profissional"
              description="Cadastre profissionais para vincular aos agendamentos."
            />
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cor</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>CRM/CRO</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Ativo</TableHead>
                    {canEdit && <TableHead className="w-24">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {professionals.map((p: ProfessionalWithSpecialty) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div
                          className="h-5 w-5 rounded-full border"
                          style={{ backgroundColor: p.color }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          {p.email && (
                            <p className="text-xs text-muted-foreground">{p.email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {p.documentNumber ? (
                          <Badge variant="outline">{p.documentNumber}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {p.specialty ? (
                          <Badge variant="secondary">{p.specialty.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{(Number(p.commissionRate) * 100).toFixed(0)}%</TableCell>
                      <TableCell>
                        <Switch
                          checked={p.active}
                          onCheckedChange={(checked) => handleToggleActive(p.id, checked)}
                          disabled={!canEdit}
                        />
                      </TableCell>
                      {canEdit && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(p)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => setDeleting({ id: p.id, name: p.name })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar profissional" : "Novo profissional"}
            </DialogTitle>
            <DialogDescription>Preencha os dados do profissional.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemplo.com" {...field} />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="documentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CRM / CRO / CRP</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} />
                      </FormControl>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {specialtiesData.map((s: SpecialtyItem) => (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            className="h-9 w-14 cursor-pointer rounded-md border"
                            value={field.value}
                            onChange={field.onChange}
                          />
                          <Input value={field.value} onChange={field.onChange} className="flex-1" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="commissionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comissão (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={Number(field.value) * 100}
                          onChange={(e) => field.onChange(Number(e.target.value) / 100)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={pending}>
              {pending ? "Salvando..." : editing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir profissional</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleting?.name}</strong>?
              Agendamentos vinculados perderão esta referência.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={pending}
            >
              {pending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
