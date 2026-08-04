"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { useSpecialties } from "@/features/admin/queries/admin";
import {
  createSpecialtyAction,
  updateSpecialtyAction,
  deleteSpecialtyAction,
} from "@/features/admin/actions";
import { specialtyCreateSchema } from "@/lib/validations/organization";
import { Stethoscope, Plus, Edit, Trash2 } from "lucide-react";
import type { z } from "zod";
import type { SpecialtyItem } from "@/features/admin/types";

interface SpecialtiesTabProps {
  organizationId: string;
  canEdit: boolean;
  initialData: SpecialtyItem[];
}

type SpecialtyFormValues = z.infer<typeof specialtyCreateSchema>;

export function SpecialtiesTab({ organizationId, canEdit, initialData }: SpecialtiesTabProps) {
  const router = useRouter();
  const { data: specialties } = useSpecialties(initialData);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = React.useState<{ id: string; name: string } | null>(null);
  const [pending, setPending] = React.useState(false);

  const form = useForm<SpecialtyFormValues>({
    resolver: zodResolver(specialtyCreateSchema),
    defaultValues: { name: "", color: "#7c3aed", durationMinutes: 30 },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ name: "", color: "#7c3aed", durationMinutes: 30 });
    setDialogOpen(true);
  }

  function openEdit(s: SpecialtyItem) {
    setEditing({ id: s.id, name: s.name });
    form.reset({ name: s.name, color: s.color, durationMinutes: s.durationMinutes });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    setPending(true);
    const values = form.getValues();
    const fd = new FormData();
    fd.set("name", values.name);
    fd.set("color", values.color);
    fd.set("durationMinutes", String(values.durationMinutes));

    let result;
    if (editing) {
      fd.set("id", editing.id);
      result = await updateSpecialtyAction(null, fd);
    } else {
      result = await createSpecialtyAction(null, fd);
    }
    setPending(false);

    if (result && "success" in result && result.success) {
      toast.success(editing ? "Especialidade atualizada." : "Especialidade criada.");
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
    const result = await deleteSpecialtyAction(null, fd);
    setPending(false);

    if (result && "success" in result && result.success) {
      toast.success("Especialidade excluída.");
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
    const result = await updateSpecialtyAction(null, fd);
    if (result && "success" in result && result.success) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Especialidades</CardTitle>
            <CardDescription>
              Cadastre as especialidades offered pela clínica.
            </CardDescription>
          </div>
          {canEdit && (
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              Nova especialidade
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!specialties || specialties.length === 0 ? (
            <EmptyState
              icon={<Stethoscope className="h-6 w-6" />}
              title="Nenhuma especialidade"
              description="Cadastre especialidades para associar aos profissionais."
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cor</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Ativo</TableHead>
                    {canEdit && <TableHead className="w-24">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specialties.map((s: SpecialtyItem) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div
                          className="h-5 w-5 rounded-full border"
                          style={{ backgroundColor: s.color }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.durationMinutes} min</TableCell>
                      <TableCell>
                        <Switch
                          checked={s.active}
                          onCheckedChange={(checked) => handleToggleActive(s.id, checked)}
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
                              onClick={() => openEdit(s)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => setDeleting({ id: s.id, name: s.name })}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar especialidade" : "Nova especialidade"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da especialidade.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Cardiologia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
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
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={5}
                          max={600}
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
            <AlertDialogTitle>Excluir especialidade</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleting?.name}</strong>?
              Profissionais associados perderão esta referência.
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
