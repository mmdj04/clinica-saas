"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  startOfMonth,
  endOfMonth,
  subDays,
  subMonths,
  startOfDay,
  endOfDay,
} from "date-fns";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Wallet, Plus, Download } from "lucide-react";
import { useTransactions } from "@/features/finance/queries/finance";
import { getTransactionColumns } from "@/features/finance/components/transaction-columns";
import { TransactionForm } from "@/features/finance/components/transaction-form";
import type { TransactionWithRelations } from "@/features/finance/types";

interface TransactionListProps {
  organizationId: string;
  categories: Array<{ id: string; name: string; type: string }>;
  professionals: Array<{ id: string; name: string }>;
  patients: Array<{ id: string; name: string }>;
}

type DatePreset = "today" | "7d" | "30d" | "month" | "lastMonth";

function getDateRange(preset: DatePreset): { from: Date; to: Date } {
  const now = new Date();
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "7d":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case "30d":
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
    case "month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "lastMonth":
      return {
        from: startOfMonth(subMonths(now, 1)),
        to: endOfMonth(subMonths(now, 1)),
      };
  }
}

const PRESET_LABELS: Record<DatePreset, string> = {
  today: "Hoje",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  month: "Este mês",
  lastMonth: "Mês passado",
};

export function TransactionList({
  organizationId,
  categories,
  professionals,
  patients,
}: TransactionListProps) {
  const [preset, setPreset] = React.useState<DatePreset>("month");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingTx, setEditingTx] =
    React.useState<TransactionWithRelations | null>(null);

  const range = React.useMemo(() => getDateRange(preset), [preset]);

  const { data, isLoading } = useTransactions(organizationId, range, {
    type: typeFilter !== "all" ? (typeFilter as "REVENUE" | "EXPENSE") : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const handleEdit = React.useCallback((row: TransactionWithRelations) => {
    setEditingTx(row);
    setFormOpen(true);
  }, []);

  const handleDelete = React.useCallback(
    async (row: TransactionWithRelations) => {
      if (!confirm("Excluir esta transação?")) return;
      try {
        const { deleteTransactionAction } = await import(
          "@/features/finance/actions"
        );
        await deleteTransactionAction(row.id);
        toast.success("Transação excluída!");
      } catch {
        toast.error("Erro ao excluir.");
      }
    },
    [],
  );

  const columns = React.useMemo(
    () => getTransactionColumns(handleEdit, handleDelete),
    [handleEdit, handleDelete],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={preset}
            onValueChange={(v) => setPreset(v as DatePreset)}
          >
            <SelectTrigger className="w-full sm:w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PRESET_LABELS) as DatePreset[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {PRESET_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6" />

          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="REVENUE">Receita</SelectItem>
              <SelectItem value="EXPENSE">Despesa</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="PAID">Pago</SelectItem>
              <SelectItem value="OVERDUE">Atrasado</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Exportação PDF em breve.")}
          >
            <Download className="mr-1.5 h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Exportação Excel em breve.")}
          >
            <Download className="mr-1.5 h-4 w-4" />
            Excel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingTx(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nova Transação
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            icon={<Wallet className="h-6 w-6" />}
            title="Nenhuma transação"
            description="Crie sua primeira transação para começar a acompanhar as finanças."
            action={
              <Button
                size="sm"
                onClick={() => {
                  setEditingTx(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Nova Transação
              </Button>
            }
          />
        }
      />

      <TransactionForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTx(null);
        }}
        categories={categories}
        professionals={professionals}
        patients={patients}
        editingTransaction={editingTx}
      />
    </div>
  );
}
