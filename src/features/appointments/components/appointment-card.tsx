"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Clock, User } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { AppointmentWithRelations } from "../types";
import { STATUS_LABELS, STATUS_VARIANT, TYPE_LABELS } from "../types";

interface AppointmentCardProps {
  appointment: AppointmentWithRelations;
  compact?: boolean;
  onClick?: (appointment: AppointmentWithRelations) => void;
  className?: string;
}

export function AppointmentCard({
  appointment,
  compact = false,
  onClick,
  className,
}: AppointmentCardProps) {
  const professionalColor = appointment.professional.color || "#7c3aed";

  if (compact) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "cursor-pointer rounded-md border-l-[3px] bg-card px-2 py-1.5 text-xs transition-colors hover:bg-accent/50",
          className,
        )}
        style={{ borderLeftColor: professionalColor }}
        onClick={() => onClick?.(appointment)}
      >
        <p className="truncate font-medium">{appointment.patient.name}</p>
        <p className="text-muted-foreground">
          {formatTime(appointment.startAt)}–{formatTime(appointment.endAt)}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group cursor-pointer rounded-lg border-l-[4px] bg-card p-3 shadow-sm transition-all hover:shadow-md",
        className,
      )}
      style={{ borderLeftColor: professionalColor }}
      onClick={() => onClick?.(appointment)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {appointment.patient.name}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" />
            <span>
              {formatTime(appointment.startAt)}–{formatTime(appointment.endAt)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">{appointment.professional.name}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={STATUS_VARIANT[appointment.status]} className="text-[10px]">
            {STATUS_LABELS[appointment.status]}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {TYPE_LABELS[appointment.type]}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
