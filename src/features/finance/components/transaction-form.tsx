"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { transactionCreateSchema } from "@/lib/validations/finance";
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/features/finance/actions";
import { useInvalidateFinance } from "@/features/finance/queries/finance";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import type { TransactionWithRelations } from "@/features/finance/types";

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Array<{ id: string; name: string; type: string }>;
  professionals: Array<{ id: string; name: string }>;
  patients: Array<{ id: string; name: string }>;
  editingTransaction?: TransactionWithRelations | null;
}

export function TransactionForm({
  open,
  onOpenChange,
  categories,
  professionals,
  patients,
  editingTransaction,
}: TransactionFormProps) {
  const invalidate = useInvalidateFinance();
  const [loading, setLoading] = React.useState(false);
  const isEditing = !!editingTransaction;

  const form = useForm({
    resolver: zodResolver(transactionCreateSchema),
    defaultValues: {
      type: ("REVENUE" as "REVENUE" | "EXPENSE"),
      categoryId: "",
      amount: 0,
      paymentMethod: "OTHER" as string,
      status: "PENDING" as string,
      date: new Date().toISOString(),
      dueDate: "",
      description: "",
      reference: "",
      patientId: "",
      professionalId: "",
      commissionRate: 0,
      notes: "",
    },
  });

  React.useEffect(() => {
    if (editingTransaction) {
      form.reset({
        type: editingTransaction.type,
        categoryId: editingTransaction.categoryId ?? "",
        amount: Number(editingTransaction.amount),
        paymentMethod: editingTransaction.paymentMethod,
        status: editingTransaction.status,
        date: new Date(editingTransaction.date).toISOString(),
        dueDate: editingTransaction.dueDate
          ? new Date(editingTransaction.dueDate).toISOString()
          : "",
        description: editingTransaction.description,
        reference: editingTransaction.reference ?? "",
        patientId: editingTransaction.patientId ?? "",
        professionalId: editingTransaction.professionalId ?? "",
        commissionRate: editingTransaction.commissionRate
          ? Number(editingTransaction.commissionRate)
          : 0,
        notes: editingTransaction.notes ?? "",
      });
    } else {
      form.reset({
        type: "REVENUE",
        categoryId: "",
        amount: 0,
        paymentMethod: "OTHER",
        status: "PENDING",
        date: new Date().toISOString(),
        dueDate: "",
        description: "",
        reference: "",
        patientId: "",
        professionalId: "",
        commissionRate: 0,
        notes: "",
      });
    }
  }, [editingTransaction, open, form]);

  const transactionType = form.watch("type");

  const filteredCategories = categories.filter(
    (c) => c.type === transactionType,
  );

  async function onSubmit(values: Record<string, unknown>) {
    setLoading(true);
    try {
      const result = isEditing
        ? await updateTransactionAction(editingTransaction.id, values)
        : await createTransactionAction(values as Parameters<typeof createTransactionAction>[0]);

      if (result && "error" in result && result.error) {
        toast.error("Corrija os erros no formulário.");
        return;
      }

      toast.success(
        isEditing ? "Transação atualizada!" : "Transação criada!",
      );
      await invalidate.all();
      onOpenChange(false);
    } catch {
      toast.error("Erro ao salvar transação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Transação" : "Nova Transação"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="REVENUE">Receita</SelectItem>
                      <SelectItem value="EXPENSE">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Consulta cardiologia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: cat.name ? "#64748b" : "#64748b" }}
                              />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="CARD">Cartão</SelectItem>
                        <SelectItem value="CASH">Dinheiro</SelectItem>
                        <SelectItem value="TRANSFER">Transferência</SelectItem>
                        <SelectItem value="HEALTH_PLAN">
                          Plano de saúde
                        </SelectItem>
                        <SelectItem value="OTHER">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PENDING">Pendente</SelectItem>
                        <SelectItem value="PAID">Pago</SelectItem>
                        <SelectItem value="OVERDUE">Atrasado</SelectItem>
                        <SelectItem value="CANCELLED">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? new Date(e.target.value + "T12:00:00").toISOString()
                              : "",
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? new Date(e.target.value + "T12:00:00").toISOString()
                              : "",
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="professionalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissional</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Nenhum" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {professionals.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Nenhum" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {transactionType === "REVENUE" &&
              form.watch("professionalId") && (
                <FormField
                  control={form.control}
                  name="commissionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de Comissão (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={
                            field.value
                              ? String(Math.round(Number(field.value) * 100))
                              : "0"
                          }
                          onChange={(e) => {
                            const pct = parseFloat(e.target.value) || 0;
                            field.onChange(Math.min(pct / 100, 1));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referência</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Código PIX, NSU, NF..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas internas..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
