"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { EmptyState } from "@/components/shared/empty-state";
import { useAuditLogs } from "@/features/admin/queries/admin";
import { formatDate, formatTime } from "@/lib/utils";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import type { AuditLogWithActor } from "@/features/admin/types";

interface AuditLogTabProps {
  organizationId: string;
  initialData: { items: AuditLogWithActor[]; total: number; page: number; limit: number };
}

const ACTION_OPTIONS = [
  { value: "", label: "Todas as ações" },
  { value: "member.invite", label: "Convite de membro" },
  { value: "member.updateRole", label: "Alteração de função" },
  { value: "member.remove", label: "Remoção de membro" },
  { value: "specialty.create", label: "Criação de especialidade" },
  { value: "specialty.update", label: "Atualização de especialidade" },
  { value: "specialty.delete", label: "Exclusão de especialidade" },
  { value: "room.create", label: "Criação de sala" },
  { value: "room.update", label: "Atualização de sala" },
  { value: "room.delete", label: "Exclusão de sala" },
  { value: "professional.create", label: "Criação de profissional" },
  { value: "professional.update", label: "Atualização de profissional" },
  { value: "professional.delete", label: "Exclusão de profissional" },
  { value: "organization.updateSettings", label: "Atualização de configurações" },
];

const ENTITY_OPTIONS = [
  { value: "", label: "Todas as entidades" },
  { value: "OrganizationMember", label: "Membro" },
  { value: "Specialty", label: "Especialidade" },
  { value: "Room", label: "Sala" },
  { value: "Professional", label: "Profissional" },
  { value: "Organization", label: "Organização" },
];

export function AuditLogTab({ organizationId, initialData }: AuditLogTabProps) {
  const [page, setPage] = React.useState(1);
  const [action, setAction] = React.useState("");
  const [entityType, setEntityType] = React.useState("");

  const filters = React.useMemo(
    () => ({
      page,
      limit: 20,
      ...(action ? { action } : {}),
      ...(entityType ? { entityType } : {}),
    }),
    [page, action, entityType],
  );

  const { data } = useAuditLogs(initialData, filters);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Log de auditoria</CardTitle>
          <CardDescription>
            Histórico de ações realizadas na organização.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select
              value={action}
              onValueChange={(v) => {
                setAction(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map((o) => (
                  <SelectItem key={o.value || "all"} value={o.value || "all"}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={entityType}
              onValueChange={(v) => {
                setEntityType(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Entidade" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_OPTIONS.map((o) => (
                  <SelectItem key={o.value || "all"} value={o.value || "all"}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {items.length === 0 ? (
            <EmptyState
              icon={<Activity className="h-6 w-6" />}
              title="Nenhum registro encontrado"
              description="Ajuste os filtros ou aguarde novas ações."
            />
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Ator</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((log: AuditLogWithActor) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm">{formatDate(log.createdAt)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(log.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.actor ? (
                            <div>
                              <p className="text-sm font-medium">{log.actor.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {log.actor.email}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Sistema</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{log.entityType}</Badge>
                        </TableCell>
                        <TableCell>
                          {log.entityId ? (
                            <span className="font-mono text-xs text-muted-foreground">
                              {log.entityId.slice(0, 8)}...
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Página {page} de {totalPages} ({total} registros)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
