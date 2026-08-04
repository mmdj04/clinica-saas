"use client";

import * as React from "react";
import { toast } from "sonner";
import { useCommissions, useInvalidateFinance } from "@/features/finance/queries/finance";
import { payCommissionsAction } from "@/features/finance/actions";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, DollarSign } from "lucide-react";
import type { CommissionWithProfessional } from "@/features/finance/types";

interface CommissionPanelProps {
  organizationId: string;
}

export function CommissionPanel({ organizationId }: CommissionPanelProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = React.useState(false);

  const { data: pendingCommissions, isLoading: loadingPending } =
    useCommissions(organizationId, "PENDING");
  const { data: paidCommissions, isLoading: loadingPaid } =
    useCommissions(organizationId, "PAID");

  const invalidate = useInvalidateFinance();

  const pendingTotal = React.useMemo(
    () =>
      (pendingCommissions ?? []).reduce(
        (acc, c) => acc + Number(c.amount),
        0,
      ),
    [pendingCommissions],
  );

  const paidTotal = React.useMemo(
    () =>
      (paidCommissions ?? []).reduce(
        (acc, c) => acc + Number(c.amount),
        0,
      ),
    [paidCommissions],
  );

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const pending = pendingCommissions ?? [];
    if (selectedIds.size === pending.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pending.map((c) => c.id)));
    }
  }

  async function handlePay() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      toast.error("Selecione ao menos uma comissão.");
      return;
    }
    setLoading(true);
    try {
      await payCommissionsAction(ids);
      toast.success(
        `${ids.length} comissão(ões) paga(s)!`,
      );
      setSelectedIds(new Set());
      await invalidate.commissions();
    } catch {
      toast.error("Erro ao pagar comissões.");
    } finally {
      setLoading(false);
    }
  }

  function groupByProfessional(
    items: CommissionWithProfessional[],
  ) {
    const map = new Map<
      string,
      { name: string; total: number; items: CommissionWithProfessional[] }
    >();
    for (const c of items) {
      const key = c.professionalId;
      const existing = map.get(key);
      if (existing) {
        existing.total += Number(c.amount);
        existing.items.push(c);
      } else {
        map.set(key, {
          name: c.professional.name,
          total: Number(c.amount),
          items: [c],
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }

  const pendingGroups = groupByProfessional(pendingCommissions ?? []);
  const paidGroups = groupByProfessional(paidCommissions ?? []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Pendente
          </div>
          <p className="mt-1 text-2xl font-semibold text-amber-600 dark:text-amber-400">
            {formatCurrency(pendingTotal)}
          </p>
          <p className="text-xs text-muted-foreground">
            {pendingCommissions?.length ?? 0} comissões
          </p>
        </div>
        <div className="rounded-xl border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            Pago
          </div>
          <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(paidTotal)}
          </p>
          <p className="text-xs text-muted-foreground">
            {paidCommissions?.length ?? 0} comissões
          </p>
        </div>
        <div className="rounded-xl border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            Total
          </div>
          <p className="mt-1 text-2xl font-semibold">
            {formatCurrency(pendingTotal + paidTotal)}
          </p>
          <p className="text-xs text-muted-foreground">
            {(pendingCommissions?.length ?? 0) + (paidCommissions?.length ?? 0)}{" "}
            comissões
          </p>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">Comissões Pendentes</h3>
          {selectedIds.size > 0 && (
            <Button
              size="sm"
              onClick={handlePay}
              disabled={loading}
            >
              <CheckCircle className="mr-1.5 h-4 w-4" />
              Pagar selecionadas ({selectedIds.size})
            </Button>
          )}
        </div>

        {loadingPending ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : pendingGroups.length === 0 ? (
          <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
            Nenhuma comissão pendente.
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3 pr-4">
              {pendingGroups.map((group) => (
                <div key={group.name} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={
                          group.items.every((i) => selectedIds.has(i.id)) &&
                          group.items.length > 0
                        }
                        onCheckedChange={() => {
                          const allSelected = group.items.every((i) =>
                            selectedIds.has(i.id),
                          );
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            for (const item of group.items) {
                              if (allSelected) next.delete(item.id);
                              else next.add(item.id);
                            }
                            return next;
                          });
                        }}
                      />
                      <span className="font-medium">{group.name}</span>
                    </div>
                    <Badge variant="warning">
                      {formatCurrency(group.total)}
                    </Badge>
                  </div>
                  <div className="ml-6 space-y-1">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedIds.has(item.id)}
                            onCheckedChange={() => toggleSelect(item.id)}
                          />
                          <span className="text-muted-foreground">
                            {item.transaction.description}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{formatPercent(Number(item.rate))}</span>
                          <span className="font-medium text-foreground">
                            {formatCurrency(Number(item.amount))}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-medium">Comissões Pagas</h3>
        {loadingPaid ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : paidGroups.length === 0 ? (
          <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
            Nenhuma comissão paga.
          </div>
        ) : (
          <div className="space-y-3">
            {paidGroups.map((group) => (
              <div key={group.name} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{group.name}</span>
                  <Badge variant="success">
                    {formatCurrency(group.total)}
                  </Badge>
                </div>
                <div className="ml-4 space-y-1">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {item.transaction.description}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatPercent(Number(item.rate))}</span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(Number(item.amount))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
