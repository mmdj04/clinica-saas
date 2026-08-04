"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDateShort, formatTime } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  data?: unknown;
  readAt?: string | null;
  createdAt: string;
}

const typeStyles: Record<string, string> = {
  appointment: "bg-sky-500",
  payment: "bg-emerald-500",
  alert: "bg-rose-500",
  system: "bg-muted-foreground",
  info: "bg-slate-500",
};

async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await fetch("/api/notifications", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export function NotificationsPopover() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const unread = data?.filter((n) => !n.readAt).length ?? 0;

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "POST" });
    refetch();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notificações">
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="px-0 py-0">Notificações</DropdownMenuLabel>
          {unread > 0 ? (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:underline"
            >
              Marcar todas como lidas
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !data?.length ? (
            <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
              <Bell className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium">Sem notificações</p>
              <p className="text-xs text-muted-foreground">
                Novidades aparecerão aqui.
              </p>
            </div>
          ) : (
            data.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex items-start gap-3 py-2.5"
              >
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    typeStyles[n.type] ?? typeStyles.info,
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm",
                      !n.readAt ? "font-semibold" : "font-normal",
                    )}
                  >
                    {n.title}
                  </p>
                  {n.body ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {n.body}
                    </p>
                  ) : null}
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatDateShort(n.createdAt)} às {formatTime(n.createdAt)}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}