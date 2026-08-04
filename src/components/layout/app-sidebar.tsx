"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  filterNav,
  mainNav,
  type NavGroup,
} from "@/config/navigation";
import type { Permission } from "@/lib/permissions";

export interface AppSidebarProps {
  has: (p: Permission) => boolean;
  collapsed?: boolean;
}

export function AppSidebar({ has, collapsed }: AppSidebarProps) {
  const pathname = usePathname();
  const groups: NavGroup[] = React.useMemo(
    () => filterNav(mainNav, has),
    [has],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-5">
        <Link
          href="/app/dashboard"
          className="flex items-center gap-2"
          aria-label="Clínica SaaS"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
            C
          </div>
          <span className="hidden text-sm font-semibold tracking-tight md:block">
            Clínica SaaS
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto scrollbar-thin px-3 py-4">
        {groups.map((group, gi) => (
          <div key={gi} className="space-y-1">
            {group.label ? (
              <p className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
            ) : null}
            {group.items.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", collapsed && "mx-auto")} />
                  {!collapsed ? <span>{item.title}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t px-3 py-3">
        <p className="px-3 text-[11px] text-muted-foreground">v0.1.0</p>
      </div>
    </div>
  );
}