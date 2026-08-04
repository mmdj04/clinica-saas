"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subMonths,
  subDays,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { DateRange, DateRangePreset } from "../types";

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const presets: { label: string; key: DateRangePreset }[] = [
  { label: "Hoje", key: "today" },
  { label: "7 dias", key: "7days" },
  { label: "30 dias", key: "30days" },
  { label: "Este mês", key: "thisMonth" },
  { label: "Último mês", key: "lastMonth" },
  { label: "Personalizado", key: "custom" },
];

function getPresetRange(preset: DateRangePreset): DateRange {
  const now = new Date();
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "7days":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case "30days":
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
    case "thisMonth":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "lastMonth": {
      const last = subMonths(now, 1);
      return { from: startOfMonth(last), to: endOfMonth(last) };
    }
    case "custom":
      return { from: startOfMonth(now), to: endOfMonth(now) };
  }
}

export function DateRangeSelector({
  value,
  onChange,
  className,
}: DateRangeSelectorProps) {
  const [activePreset, setActivePreset] = React.useState<DateRangePreset>("30days");

  const handlePreset = (preset: DateRangePreset) => {
    setActivePreset(preset);
    if (preset !== "custom") {
      onChange(getPresetRange(preset));
    }
  };

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value + "T00:00:00") : value.from;
    setActivePreset("custom");
    onChange({ ...value, from: date });
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value + "T00:00:00") : value.to;
    setActivePreset("custom");
    onChange({ ...value, to: date });
  };

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end", className)}>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <Button
            key={p.key}
            variant={activePreset === p.key ? "default" : "outline"}
            size="sm"
            onClick={() => handlePreset(p.key)}
          >
            {p.label}
          </Button>
        ))}
      </div>
      {activePreset === "custom" && (
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">De</Label>
            <Input
              type="date"
              value={format(value.from, "yyyy-MM-dd")}
              onChange={handleFromChange}
              className="w-[150px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Até</Label>
            <Input
              type="date"
              value={format(value.to, "yyyy-MM-dd")}
              onChange={handleToChange}
              className="w-[150px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
