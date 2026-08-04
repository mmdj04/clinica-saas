"use client";

import * as React from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { ViewMode } from "../types";

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  onDateChange: (date: Date) => void;
  onViewChange: (mode: ViewMode) => void;
}

function formatDateTitle(date: Date, mode: ViewMode): string {
  switch (mode) {
    case "daily":
      return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
    case "weekly": {
      const weekStart = startOfWeek(date, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
      const sameMonth = format(weekStart, "MMM yyyy") === format(weekEnd, "MMM yyyy");
      if (sameMonth) {
        return `${format(weekStart, "d", { locale: ptBR })}–${format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
      }
      return `${format(weekStart, "d 'de' MMM", { locale: ptBR })} – ${format(weekEnd, "d 'de' MMM 'de' yyyy", { locale: ptBR })}`;
    }
    case "monthly":
      return format(date, "MMMM 'de' yyyy", { locale: ptBR });
  }
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onDateChange,
  onViewChange,
}: CalendarHeaderProps) {
  const navigatePrev = () => {
    switch (viewMode) {
      case "daily": {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 1);
        onDateChange(d);
        break;
      }
      case "weekly": {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 7);
        onDateChange(d);
        break;
      }
      case "monthly": {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() - 1);
        onDateChange(d);
        break;
      }
    }
  };

  const navigateNext = () => {
    switch (viewMode) {
      case "daily": {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 1);
        onDateChange(d);
        break;
      }
      case "weekly": {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 7);
        onDateChange(d);
        break;
      }
      case "monthly": {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() + 1);
        onDateChange(d);
        break;
      }
    }
  };

  const goToday = () => onDateChange(new Date());

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={navigatePrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={navigateNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToday}>
          <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
          Hoje
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <h2 className="text-sm font-semibold capitalize sm:text-base">
          {formatDateTitle(currentDate, viewMode)}
        </h2>
      </div>

      <Tabs
        value={viewMode}
        onValueChange={(v) => onViewChange(v as ViewMode)}
      >
        <TabsList className="h-8">
          <TabsTrigger value="daily" className="text-xs">
            Dia
          </TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs">
            Semana
          </TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs">
            Mês
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
