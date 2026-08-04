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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { useMembers } from "@/features/admin/queries/admin";
import {
  inviteMemberAction,
  updateMemberRoleAction,
  removeMemberAction,
} from "@/features/admin/actions";
import { inviteMemberSchema } from "@/lib/validations/organization";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/permissions";
import { initials } from "@/lib/utils";
import { UserPlus, Users, Edit, Trash2 } from "lucide-react";
import type { Role } from "@prisma/client";
import type { MemberWithUser } from "@/features/admin/types";

interface MembersTabProps {
  organizationId: string;
  canEdit: boolean;
  initialData: MemberWithUser[];
}

const ROLE_OPTIONS: Role[] = ["OWNER", "ADMIN", "STAFF", "RECEPTION", "READONLY"];

const ROLE_BADGE_VARIANT: Record<string, "default" | "secondary" | "success" | "info" | "warning" | "danger"> = {
  OWNER: "default",
  ADMIN: "info",
  STAFF: "success",
  RECEPTION: "warning",
  READONLY: "secondary",
};

export function MembersTab({ organizationId, canEdit, initialData }: MembersTabProps) {
  const router = useRouter();
  const { data: members } = useMembers(initialData);

  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [editMember, setEditMember] = React.useState<{ id: string; role: Role; name: string } | null>(null);
  const [deleteMember, setDeleteMember] = React.useState<{ id: string; name: string } | null>(null);
  const [invitePending, setInvitePending] = React.useState(false);
  const [editPending, setEditPending] = React.useState(false);
  const [deletePending, setDeletePending] = React.useState(false);

  const inviteForm = useForm({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "", role: "STAFF" as Role },
  });

  const editForm = useForm({
    resolver: zodResolver(inviteMemberSchema.pick({ role: true })),
    defaultValues: { role: "STAFF" as Role },
  });

  async function handleInvite() {
    setInvitePending(true);
    const values = inviteForm.getValues();
    const fd = new FormData();
    fd.set("email", values.email);
    fd.set("role", values.role);
    const result = await inviteMemberAction(null, fd);
    setInvitePending(false);
    if (result && "success" in result && result.success) {
      toast.success("Membro convidado com sucesso.");
      setInviteOpen(false);
      inviteForm.reset();
      router.refresh();
    } else if (result && "message" in result) {
      toast.error(result.message as string);
    }
  }

  async function handleEdit() {
    setEditPending(true);
    const values = editForm.getValues();
    const fd = new FormData();
    fd.set("memberId", editMember?.id ?? "");
    fd.set("role", values.role);
    const result = await updateMemberRoleAction(null, fd);
    setEditPending(false);
    if (result && "success" in result && result.success) {
      toast.success("Função atualizada.");
      setEditMember(null);
      router.refresh();
    } else if (result && "message" in result) {
      toast.error(result.message as string);
    }
  }

  async function handleDelete() {
    setDeletePending(true);
    const fd = new FormData();
    fd.set("memberId", deleteMember?.id ?? "");
    const result = await removeMemberAction(null, fd);
    setDeletePending(false);
    if (result && "success" in result && result.success) {
      toast.success("Membro removido.");
      setDeleteMember(null);
      router.refresh();
    } else if (result && "message" in result) {
      toast.error(result.message as string);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Membros da organização</CardTitle>
            <CardDescription>
              Gerencie quem tem acesso à clínica.
            </CardDescription>
          </div>
          {canEdit && (
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus className="mr-1.5 h-4 w-4" />
              Convidar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!members || members.length === 0 ? (
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="Nenhum membro encontrado"
              description="Convide membros para começar a gerenciar a clínica."
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    {canEdit && <TableHead className="w-24">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m: MemberWithUser) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={m.user.image ?? undefined} />
                            <AvatarFallback className="text-xs">
                              {initials(m.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {m.user.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {m.user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ROLE_BADGE_VARIANT[m.role] ?? "secondary"}>
                          {ROLE_LABELS[m.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            m.status === "ACTIVE"
                              ? "success"
                              : m.status === "INVITED"
                                ? "info"
                                : "danger"
                          }
                        >
                          {m.status === "ACTIVE"
                            ? "Ativo"
                            : m.status === "INVITED"
                              ? "Convidado"
                              : "Suspenso"}
                        </Badge>
                      </TableCell>
                      {canEdit && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                editForm.setValue("role", m.role);
                                setEditMember({ id: m.id, role: m.role, name: m.user.name });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => setDeleteMember({ id: m.id, name: m.user.name })}
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

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar membro</DialogTitle>
            <DialogDescription>
              O usuário deve possuir cadastro no sistema.
            </DialogDescription>
          </DialogHeader>
          <Form {...inviteForm}>
            <form className="space-y-4">
              <FormField
                control={inviteForm.control}
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
                control={inviteForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLE_OPTIONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInvite} disabled={invitePending}>
              {invitePending ? "Convidando..." : "Convidar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editMember} onOpenChange={(open) => !open && setEditMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar função</DialogTitle>
            <DialogDescription>
              Altere a função de {editMember?.name}.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form className="space-y-4">
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLE_OPTIONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABELS[r]} — {ROLE_DESCRIPTIONS[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMember(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={editPending}>
              {editPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteMember} onOpenChange={(open) => !open && setDeleteMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{deleteMember?.name}</strong> da organização?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deletePending}
            >
              {deletePending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
