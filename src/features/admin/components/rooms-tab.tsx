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
import { useRooms } from "@/features/admin/queries/admin";
import {
  createRoomAction,
  updateRoomAction,
  deleteRoomAction,
} from "@/features/admin/actions";
import { roomCreateSchema } from "@/lib/validations/organization";
import { MapPin, Plus, Edit, Trash2 } from "lucide-react";
import type { z } from "zod";
import type { RoomItem } from "@/features/admin/types";

interface RoomsTabProps {
  organizationId: string;
  canEdit: boolean;
  initialData: RoomItem[];
}

type RoomFormValues = z.infer<typeof roomCreateSchema>;

export function RoomsTab({ organizationId: _organizationId, canEdit, initialData }: RoomsTabProps) {
  const router = useRouter();
  const { data: rooms } = useRooms(initialData);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = React.useState<{ id: string; name: string } | null>(null);
  const [pending, setPending] = React.useState(false);

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomCreateSchema),
    defaultValues: { name: "", color: "#0ea5e9" },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ name: "", color: "#0ea5e9" });
    setDialogOpen(true);
  }

  function openEdit(r: RoomItem) {
    setEditing({ id: r.id, name: r.name });
    form.reset({ name: r.name, color: r.color });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    setPending(true);
    const values = form.getValues();
    const fd = new FormData();
    fd.set("name", values.name);
    fd.set("color", values.color);

    let result;
    if (editing) {
      fd.set("id", editing.id);
      result = await updateRoomAction(null, fd);
    } else {
      result = await createRoomAction(null, fd);
    }
    setPending(false);

    if (result && "success" in result && result.success) {
      toast.success(editing ? "Sala atualizada." : "Sala criada.");
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
    const result = await deleteRoomAction(null, fd);
    setPending(false);

    if (result && "success" in result && result.success) {
      toast.success("Sala excluída.");
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
    const result = await updateRoomAction(null, fd);
    if (result && "success" in result && result.success) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Salas</CardTitle>
            <CardDescription>
              Gerencie as salas de atendimento.
            </CardDescription>
          </div>
          {canEdit && (
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              Nova sala
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!rooms || rooms.length === 0 ? (
            <EmptyState
              icon={<MapPin className="h-6 w-6" />}
              title="Nenhuma sala cadastrada"
              description="Cadastre salas para usar no agendamento."
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cor</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Ativo</TableHead>
                    {canEdit && <TableHead className="w-24">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((r: RoomItem) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div
                          className="h-5 w-5 rounded-full border"
                          style={{ backgroundColor: r.color }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>
                        <Switch
                          checked={r.active}
                          onCheckedChange={(checked) => handleToggleActive(r.id, checked)}
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
                              onClick={() => openEdit(r)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => setDeleting({ id: r.id, name: r.name })}
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
            <DialogTitle>{editing ? "Editar sala" : "Nova sala"}</DialogTitle>
            <DialogDescription>Preencha os dados da sala.</DialogDescription>
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
                      <Input placeholder="Ex: Sala 01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            <AlertDialogTitle>Excluir sala</AlertDialogTitle>
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
