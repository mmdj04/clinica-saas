"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { ShellContext } from "@/types/shell";

export function OrganizationSwitcher({ context }: { context: ShellContext }) {
  const { organization, memberships } = context;

  if (!memberships.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 justify-start gap-2 px-2 text-muted-foreground"
        >
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="max-w-40 truncate text-sm font-medium text-foreground">
            {organization.name}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Clínicas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {memberships.map((m) => (
          <DropdownMenuItem
            key={m.organizationId}
            className="justify-between"
            onSelect={(e) => {
              if (m.organizationId === organization.id) e.preventDefault();
            }}
          >
            <span className="truncate">{m.organization.name}</span>
            {m.organizationId === organization.id ? (
              <Check className="h-4 w-4 text-primary" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}