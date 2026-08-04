"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { isSameDay, getHours, getMinutes } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AppointmentCard } from "./appointment-card";
import type { AppointmentWithRelations } from "../types";
import { HOURS_RANGE } from "../types";

interface DailyViewProps {
  appointments: AppointmentWithRelations[];
  currentDate: Date;
  onAppointmentClick: (appointment: AppointmentWithRelations) => void;
}

const HOUR_HEIGHT = 64;

function getAppointmentPosition(startAt: string | Date, endAt: string | Date) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const startHour = getHours(start) + getMinutes(start) / 60;
  const endHour = getHours(end) + getMinutes(end) / 60;
  const top = (startHour - 8) * HOUR_HEIGHT;
  const height = Math.max((endHour - startHour) * HOUR_HEIGHT, 24);
  return { top, height };
}

export function DailyView({
  appointments,
  currentDate,
  onAppointmentClick,
}: DailyViewProps) {
  const dayAppointments = appointments.filter((a) =>
    isSameDay(new Date(a.startAt), currentDate),
  );

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="relative flex">
        {/* Time column */}
        <div className="w-16 shrink-0 border-r">
          {HOURS_RANGE.map((hour) => (
            <div
              key={hour}
              className="relative border-b"
              style={{ height: HOUR_HEIGHT }}
            >
              <span className="absolute -top-2.5 left-1 text-[11px] text-muted-foreground">
                {String(hour).padStart(2, "0")}:00
              </span>
            </div>
          ))}
        </div>

        {/* Appointments area */}
        <div className="relative min-w-0 flex-1">
          {/* Hour grid lines */}
          {HOURS_RANGE.map((hour) => (
            <div
              key={hour}
              className="border-b"
              style={{ height: HOUR_HEIGHT }}
            />
          ))}

          {/* Current time indicator */}
          {isSameDay(currentDate, new Date()) && (
            <CurrentTimeIndicator hourHeight={HOUR_HEIGHT} />
          )}

          {/* Appointment cards */}
          <AnimatePresence mode="popLayout">
            {dayAppointments.map((appointment) => {
              const { top, height } = getAppointmentPosition(
                appointment.startAt,
                appointment.endAt,
              );

              return (
                <motion.div
                  key={appointment.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1 right-2"
                  style={{ top, height: Math.max(height, 48) }}
                >
                  <AppointmentCard
                    appointment={appointment}
                    onClick={onAppointmentClick}
                    className="h-full"
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </ScrollArea>
  );
}

function CurrentTimeIndicator({ hourHeight }: { hourHeight: number }) {
  const now = new Date();
  const hours = getHours(now) + getMinutes(now) / 60;
  const top = (hours - 8) * hourHeight;

  if (hours < 8 || hours > 18) return null;

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
      style={{ top }}
    >
      <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
      <div className="h-px flex-1 bg-destructive" />
    </div>
  );
}
