"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";
import { startOfMonth, endOfMonth } from "date-fns";
import { FinanceOverview } from "@/features/finance/components/finance-overview";
import { TransactionList } from "@/features/finance/components/transaction-list";
import { CommissionPanel } from "@/features/finance/components/commission-panel";
import { CategoryManager } from "@/features/finance/components/category-manager";
import { useCategories } from "@/features/finance/queries/finance";

interface FinancePageProps {
  organizationId: string;
  professionals: Array<{ id: string; name: string }>;
  patients: Array<{ id: string; name: string }>;
}

export function FinancePage({
  organizationId,
  professionals,
  patients,
}: FinancePageProps) {
  const [categoryManagerOpen, setCategoryManagerOpen] = React.useState(false);

  const { data: categories } = useCategories(organizationId);

  const range = React.useMemo(
    () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        description="Gestão financeira da clínica"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCategoryManagerOpen(true)}
        >
          <Tag className="mr-1.5 h-4 w-4" />
          Categorias
        </Button>
      </PageHeader>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="commissions">Comissões</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <FinanceOverview organizationId={organizationId} range={range} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionList
            organizationId={organizationId}
            categories={categories ?? []}
            professionals={professionals}
            patients={patients}
          />
        </TabsContent>

        <TabsContent value="commissions">
          <CommissionPanel organizationId={organizationId} />
        </TabsContent>
      </Tabs>

      <CategoryManager
        open={categoryManagerOpen}
        onOpenChange={setCategoryManagerOpen}
        categories={categories ?? []}
      />
    </div>
  );
}
