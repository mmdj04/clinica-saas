"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  CalendarDays,
  LayoutDashboard,
  BarChart3,
  Settings,
  Users,
  Wallet,
  ClipboardPlus,
  Search,
  Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const commands = [
  {
    group: "Navegação",
    items: [
      { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
      { name: "Agenda", href: "/app/agenda", icon: CalendarDays },
      { name: "Pacientes", href: "/app/pacientes", icon: Users },
      { name: "Novo paciente", href: "/app/pacientes/novo", icon: Users },
      { name: "Financeiro", href: "/app/financeiro", icon: Wallet },
      { name: "Prontuário", href: "/app/prontuario", icon: ClipboardPlus },
      { name: "Relatórios", href: "/app/relatorios", icon: BarChart3 },
      { name: "Administração", href: "/app/administracao", icon: Settings },
      { name: "Integrações", href: "/app/integracoes", icon: Plug },
    ],
  },
];

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const run = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-56 justify-between text-muted-foreground"
        onClick={() => setOpen(true)}
        aria-label="Busca rápida"
      >
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Buscar...
        </span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Digite um comando ou busca..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          {commands.map((section) => (
            <CommandGroup key={section.group} heading={section.group}>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem key={item.href} onSelect={() => run(item.href)}>
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}