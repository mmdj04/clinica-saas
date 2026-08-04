"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/features/finance/types";
import type { TransactionWithRelations } from "@/features/finance/types";

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "PAID"
      ? "success"
      : status === "PENDING"
        ? "warning"
        : status === "OVERDUE"
          ? "danger"
          : "secondary";
  return (
    <Badge variant={variant as "success" | "warning" | "danger" | "secondary"}>
      {TRANSACTION_STATUS_LABELS[status as keyof typeof TRANSACTION_STATUS_LABELS] ?? status}
    </Badge>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <Badge variant={type === "REVENUE" ? "success" : "danger"}>
      {type === "REVENUE" ? "↑" : "↓"}{" "}
      {TRANSACTION_TYPE_LABELS[type as keyof typeof TRANSACTION_TYPE_LABELS]}
    </Badge>
  );
}

export function getTransactionColumns(
  onEdit?: (row: TransactionWithRelations) => void,
  onDelete?: (row: TransactionWithRelations) => void,
): ColumnDef<TransactionWithRelations>[] {
  return [
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => <TypeBadge type={row.original.type} />,
      size: 110,
    },
    {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => (
        <div className="max-w-[250px] truncate font-medium">
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Valor</div>,
      cell: ({ row }) => {
        const amount = Number(row.original.amount);
        return (
          <div
            className={`text-right font-medium tabular-nums ${
              row.original.type === "REVENUE"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {row.original.type === "REVENUE" ? "+" : "-"}
            {formatCurrency(amount)}
          </div>
        );
      },
      size: 140,
    },
    {
      accessorKey: "category",
      header: "Categoria",
      cell: ({ row }) => {
        const cat = row.original.category;
        if (!cat) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            <span className="truncate">{cat.name}</span>
          </div>
        );
      },
      size: 150,
    },
    {
      accessorKey: "paymentMethod",
      header: "Pagamento",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {PAYMENT_METHOD_LABELS[row.original.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS]}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      size: 100,
    },
    {
      accessorKey: "professional",
      header: "Profissional",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.professional?.name ?? "—"}
        </span>
      ),
      size: 150,
    },
    {
      accessorKey: "date",
      header: () => <div className="text-right">Data</div>,
      cell: ({ row }) => (
        <div className="text-right text-sm text-muted-foreground tabular-nums">
          {formatDate(row.original.date)}
        </div>
      ),
      size: 110,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(row.original)}
              className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(row.original)}
              className="rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
            >
              Excluir
            </button>
          )}
        </div>
      ),
      size: 100,
    },
  ];
}
