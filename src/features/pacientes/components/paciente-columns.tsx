"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { formatDate, formatPhone, formatCPF } from "@/lib/utils";
import { GENDER_LABELS, STATUS_LABELS } from "@/features/pacientes/types";
import type { PatientListItem, PatientStatus, PatientGender } from "@/features/pacientes/types";

const statusVariantMap: Record<PatientStatus, "success" | "secondary" | "danger"> = {
  active: "success",
  inactive: "secondary",
  blocked: "danger",
};

export function createPatientColumns(onActions: {
  onEdit: (patient: PatientListItem) => void;
  onDelete: (patient: PatientListItem) => void;
  onView: (patient: PatientListItem) => void;
}): ColumnDef<PatientListItem, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {row.original.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0])
              .join("")
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.original.name}</p>
            {row.original.cpf && (
              <p className="truncate text-xs text-muted-foreground">
                CPF: {formatCPF(row.original.cpf)}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Telefone",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.phone ? formatPhone(row.original.phone) : "—"}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "E-mail",
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate text-sm text-muted-foreground">
          {row.original.email ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "birthDate",
      header: "Nascimento",
      cell: ({ row }) => (
        <span className="text-sm">{formatDate(row.original.birthDate)}</span>
      ),
    },
    {
      accessorKey: "gender",
      header: "Gênero",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {GENDER_LABELS[row.original.gender as PatientGender] ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status as PatientStatus;
        return (
          <Badge variant={statusVariantMap[status] ?? "secondary"}>
            {STATUS_LABELS[status] ?? status}
          </Badge>
        );
      },
    },
    {
      id: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.original.tags;
        if (!tags.length) return <span className="text-sm text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-[10px]"
                style={{ backgroundColor: tag.color + "20", color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="secondary" className="text-[10px]">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Criado em",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onActions.onView(row.original)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onActions.onEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onActions.onDelete(row.original)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 48,
    },
  ];
}
