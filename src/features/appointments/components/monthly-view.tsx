"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { AppointmentWithRelations } from "../types";

interface MonthlyViewProps {
  appointments: AppointmentWithRelations[];
  currentDate: Date;
  onAppointmentClick: (appointment: AppointmentWithRelations) => void;
  onDayClick?: (date: Date) => void;
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function MonthlyView({
  appointments,
  currentDate,
  onAppointmentClick,
  onDayClick,
}: MonthlyViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getAppointmentsForDay = (day: Date) =>
    appointments.filter((a) => isSameDay(new Date(a.startAt), day));

  return (
    <div className="flex h-[calc(100vh-220px)] flex-col">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid flex-1 grid-cols-7">
        {days.map((day) => {
          const dayAppts = getAppointmentsForDay(day);
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);

          return (
            <motion.div
              key={day.toISOString()}
              className={cn(
                "min-h-[80px] border-b border-r p-1 transition-colors",
                !inMonth && "bg-muted/30 text-muted-foreground",
                today && "bg-primary/5",
                "cursor-pointer hover:bg-accent/30",
              )}
              onClick={() => onDayClick?.(day)}
              whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    today && "bg-primary text-primary-foreground",
                  )}
                >
                  {format(day, "d")}
                </span>
                {dayAppts.length > 0 && (
                  <Badge variant="secondary" className="h-5 min-w-5 text-[10px]">
                    {dayAppts.length}
                  </Badge>
                )}
              </div>

              <div className="mt-1 space-y-0.5">
                {dayAppts.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-[10px] transition-colors hover:bg-accent/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(apt);
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          apt.professional.color || "#7c3aed",
                      }}
                    />
                    <span className="truncate font-medium">
                      {format(new Date(apt.startAt), "HH:mm")}{" "}
                      {apt.patient.name}
                    </span>
                  </div>
                ))}
                {dayAppts.length > 3 && (
                  <p className="px-1 text-[10px] text-muted-foreground">
                    +{dayAppts.length - 3} mais
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
