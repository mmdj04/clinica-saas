"use client";

import * as React from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandMenu } from "@/components/layout/command-menu";
import { OrganizationSwitcher } from "@/components/layout/organization-switcher";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Permission } from "@/lib/permissions";
import { can } from "@/lib/permissions";
import type { ShellContext } from "@/types/shell";
import type { Role } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface AppShellProps {
  context: ShellContext;
  role: Role;
  children: React.ReactNode;
}

export function AppShell({ context, role, children }: AppShellProps) {
  const has = (p: Permission) => can(role, p);
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r bg-sidebar transition-[width] duration-200 lg:block",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <AppSidebar has={has} collapsed={collapsed} />
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute bottom-20 right-2 h-6 w-6",
            collapsed && "right-[18px]",
          )}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </aside>

      {/* Sidebar mobile */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <AppSidebar has={has} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SheetTrigger
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            asChild
          >
            <Button variant="ghost" size="icon" aria-label="Abrir menu">
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <OrganizationSwitcher context={context} />
          <Separator orientation="vertical" className="mx-2 h-6" />
          <div className="hidden md:block">
            <CommandMenu />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <NotificationsPopover />
            <UserMenu context={context} />
          </div>
        </header>

        <ScrollArea className="flex-1">
          <main className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6">
            {children}
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}