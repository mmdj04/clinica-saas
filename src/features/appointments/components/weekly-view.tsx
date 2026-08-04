"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  format,
  startOfWeek,
  eachDayOfInterval,
  endOfWeek,
  isSameDay,
  isToday,
  getHours,
  getMinutes,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AppointmentCard } from "./appointment-card";
import type { AppointmentWithRelations } from "../types";
import { HOURS_RANGE } from "../types";

interface WeeklyViewProps {
  appointments: AppointmentWithRelations[];
  currentDate: Date;
  onAppointmentClick: (appointment: AppointmentWithRelations) => void;
}

const HOUR_HEIGHT = 48;

function getAppointmentTop(startAt: string | Date) {
  const start = new Date(startAt);
  const hours = getHours(start) + getMinutes(start) / 60;
  return (hours - 8) * HOUR_HEIGHT;
}

export function WeeklyView({
  appointments,
  currentDate,
  onAppointmentClick,
}: WeeklyViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="flex h-[calc(100vh-220px)] flex-col">
      {/* Day headers */}
      <div className="flex border-b">
        <div className="w-16 shrink-0" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "flex-1 border-l px-1 py-2 text-center",
              isToday(day) && "bg-primary/5",
            )}
          >
            <p className="text-[11px] uppercase text-muted-foreground">
              {format(day, "EEE", { locale: ptBR })}
            </p>
            <p
              className={cn(
                "text-sm font-semibold",
                isToday(day) && "text-primary",
              )}
            >
              {format(day, "d")}
            </p>
          </div>
        ))}
      </div>

      {/* Grid */}
      <ScrollArea className="flex-1">
        <div className="relative flex">
          {/* Time column */}
          <div className="w-16 shrink-0">
            {HOURS_RANGE.map((hour) => (
              <div
                key={hour}
                className="relative border-b"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute -top-2.5 left-1 text-[10px] text-muted-foreground">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const dayAppts = appointments.filter((a) =>
              isSameDay(new Date(a.startAt), day),
            );

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "relative flex-1 border-l",
                  isToday(day) && "bg-primary/5",
                )}
              >
                {/* Hour lines */}
                {HOURS_RANGE.map((hour) => (
                  <div
                    key={hour}
                    className="border-b"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}

                {/* Appointment cards */}
                <AnimatePresence mode="popLayout">
                  {dayAppts.map((appointment) => {
                    const top = getAppointmentTop(appointment.startAt);
                    const start = new Date(appointment.startAt);
                    const end = new Date(appointment.endAt);
                    const durationHours =
                      (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    const height = Math.max(durationHours * HOUR_HEIGHT, 24);

                    return (
                      <motion.div
                        key={appointment.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0.5 right-0.5"
                        style={{ top, height: Math.max(height, 32) }}
                      >
                        <AppointmentCard
                          appointment={appointment}
                          compact
                          onClick={onAppointmentClick}
                          className="h-full"
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
