"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createPatientTagAction,
  deletePatientTagAction,
} from "@/features/pacientes/actions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export interface TagItem {
  id: string;
  name: string;
  color: string;
}

interface TagListProps {
  tags: TagItem[];
  selectedTagIds: string[];
  onToggle: (tagId: string) => void;
  variant?: "selectable" | "display";
  patientTagNames?: string[];
}

export function TagList({
  tags,
  selectedTagIds,
  onToggle,
  variant = "selectable",
  patientTagNames = [],
}: TagListProps) {
  const [open, setOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newColor, setNewColor] = React.useState("#7c3aed");
  const [creating, setCreating] = React.useState(false);
  const queryClient = useQueryClient();

  async function handleCreateTag() {
    if (!newName.trim()) return;
    setCreating(true);
    const fd = new FormData();
    fd.append("name", newName.trim());
    fd.append("color", newColor);
    const result = await createPatientTagAction(null, fd);
    setCreating(false);
    if (result.success) {
      toast.success("Tag criada com sucesso");
      setNewName("");
      setNewColor("#7c3aed");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["pacientes"] });
    } else {
      toast.error(result.error);
    }
  }

  async function handleDeleteTag(tagId: string) {
    const result = await deletePatientTagAction(tagId);
    if (result.success) {
      toast.success("Tag excluída");
      queryClient.invalidateQueries({ queryKey: ["pacientes"] });
    } else {
      toast.error(result.error);
    }
  }

  if (variant === "display") {
    return (
      <div className="flex flex-wrap gap-1">
        {patientTagNames.map((tagName) => {
          const tag = tags.find((t) => t.name === tagName);
          return (
            <Badge
              key={tagName}
              variant="secondary"
              className="text-xs"
              style={tag ? { backgroundColor: tag.color + "20", color: tag.color } : undefined}
            >
              {tagName}
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onToggle(tag.id)}
              className="group relative"
            >
              <Badge
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer text-xs transition-colors"
                style={
                  isSelected
                    ? { backgroundColor: tag.color, borderColor: tag.color, color: "#fff" }
                    : { borderColor: tag.color + "40", color: tag.color }
                }
              >
                {tag.name}
                {isSelected && <X className="ml-1 h-3 w-3" />}
              </Badge>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTag(tag.id);
                }}
                className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground group-hover:flex"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </button>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" type="button">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Nova tag
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Criar tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: VIP, Retorno..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cor</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded border"
                />
                <span className="text-xs text-muted-foreground">{newColor}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateTag}
              disabled={creating || !newName.trim()}
              type="button"
            >
              {creating ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
