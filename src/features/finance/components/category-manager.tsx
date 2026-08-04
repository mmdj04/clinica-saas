"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/features/finance/actions";
import { useInvalidateFinance } from "@/features/finance/queries/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface CategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Array<{
    id: string;
    name: string;
    type: string;
    color: string;
  }>;
}

const PRESET_COLORS = [
  "#7c3aed",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#f43f5e",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#8b5cf6",
  "#f97316",
  "#64748b",
];

export function CategoryManager({
  open,
  onOpenChange,
  categories,
}: CategoryManagerProps) {
  const invalidate = useInvalidateFinance();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingCat, setEditingCat] = React.useState<{
    id: string;
    name: string;
    type: string;
    color: string;
  } | null>(null);
  const [deletingCat, setDeletingCat] = React.useState<{
    id: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<"REVENUE" | "EXPENSE">("REVENUE");
  const [color, setColor] = React.useState("#7c3aed");

  function openCreate() {
    setEditingCat(null);
    setName("");
    setType("REVENUE");
    setColor("#7c3aed");
    setFormOpen(true);
  }

  function openEdit(cat: { id: string; name: string; type: string; color: string }) {
    setEditingCat(cat);
    setName(cat.name);
    setType(cat.type as "REVENUE" | "EXPENSE");
    setColor(cat.color);
    setFormOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Nome obrigatório.");
      return;
    }
    setLoading(true);
    try {
      if (editingCat) {
        await updateCategoryAction(editingCat.id, { name: name.trim(), color });
        toast.success("Categoria atualizada!");
      } else {
        await createCategoryAction({ name: name.trim(), type, color });
        toast.success("Categoria criada!");
      }
      await invalidate.categories();
      setFormOpen(false);
    } catch {
      toast.error("Erro ao salvar categoria.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deletingCat) return;
    setLoading(true);
    try {
      await deleteCategoryAction(deletingCat.id);
      toast.success("Categoria excluída!");
      await invalidate.categories();
      setDeletingCat(null);
    } catch {
      toast.error("Erro ao excluir categoria.");
    } finally {
      setLoading(false);
    }
  }

  const revenueCategories = categories.filter((c) => c.type === "REVENUE");
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Categorias Financeiras</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Receitas
                  </h4>
                  <Button variant="ghost" size="sm" onClick={openCreate}>
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Adicionar
                  </Button>
                </div>
                {revenueCategories.length === 0 ? (
                  <p className="py-2 text-xs text-muted-foreground">
                    Nenhuma categoria de receita.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {revenueCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-sm">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(cat)}
                            className="rounded p-1 text-muted-foreground hover:bg-muted"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeletingCat({ id: cat.id, name: cat.name })
                            }
                            className="rounded p-1 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                  Despesas
                </h4>
                {expenseCategories.length === 0 ? (
                  <p className="py-2 text-xs text-muted-foreground">
                    Nenhuma categoria de despesa.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {expenseCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-sm">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(cat)}
                            className="rounded p-1 text-muted-foreground hover:bg-muted"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeletingCat({ id: cat.id, name: cat.name })
                            }
                            className="rounded p-1 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editingCat ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Consultas"
              />
            </div>

            {!editingCat && (
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as "REVENUE" | "EXPENSE")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REVENUE">Receita</SelectItem>
                    <SelectItem value="EXPENSE">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full border-2 transition-transform ${
                      color === c
                        ? "scale-110 border-foreground"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <div className="relative">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 h-7 w-7 cursor-pointer opacity-0"
                  />
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/50">
                    <span className="text-xs">+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Salvando..." : editingCat ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingCat}
        onOpenChange={(o) => !o && setDeletingCat(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              A categoria &quot;{deletingCat?.name}&quot; será removida
              permanentemente. Transações associadas perderão a categoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
