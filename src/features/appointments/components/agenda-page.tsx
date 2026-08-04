"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { Plus, Clock, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { CalendarHeader } from "./calendar-header";
import { DailyView } from "./daily-view";
import { WeeklyView } from "./weekly-view";
import { MonthlyView } from "./monthly-view";
import { AppointmentForm } from "./appointment-form";
import { WaitlistPanel } from "./waitlist-panel";
import {
  useAppointments,
  usePatients,
  useProfessionals,
  useRooms,
  useSpecialties,
} from "../queries/appointments";
import type { ViewMode, AppointmentWithRelations } from "../types";

interface AgendaPageProps {
  organizationId: string;
}

export function AgendaPage({ organizationId }: AgendaPageProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [viewMode, setViewMode] = React.useState<ViewMode>("daily");
  const [formOpen, setFormOpen] = React.useState(false);
  const [waitlistOpen, setWaitlistOpen] = React.useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    React.useState<AppointmentWithRelations | null>(null);
  const [formDefaultDate, setFormDefaultDate] = React.useState<
    Date | undefined
  >();

  const dateRange = React.useMemo(() => {
    switch (viewMode) {
      case "daily":
        return {
          from: startOfDay(currentDate).toISOString(),
          to: endOfDay(currentDate).toISOString(),
        };
      case "weekly":
        return {
          from: startOfWeek(currentDate, { weekStartsOn: 0 }).toISOString(),
          to: endOfWeek(currentDate, { weekStartsOn: 0 }).toISOString(),
        };
      case "monthly":
        return {
          from: startOfMonth(currentDate).toISOString(),
          to: endOfMonth(currentDate).toISOString(),
        };
    }
  }, [currentDate, viewMode]);

  const {
    data: appointments = [],
    isLoading,
    isError,
    refetch,
  } = useAppointments({
    organizationId,
    from: dateRange.from,
    to: dateRange.to,
  });

  const { data: patients = [] } = usePatients(organizationId);
  const { data: professionals = [] } = useProfessionals(organizationId);
  const { data: rooms = [] } = useRooms(organizationId);
  const { data: specialties = [] } = useSpecialties(organizationId);

  function handleAppointmentClick(appointment: AppointmentWithRelations) {
    setSelectedAppointment(appointment);
    setFormOpen(true);
  }

  function handleDayClick(date: Date) {
    setFormDefaultDate(date);
    setSelectedAppointment(null);
    setFormOpen(true);
  }

  function openNewForm(date?: Date) {
    setSelectedAppointment(null);
    setFormDefaultDate(date || currentDate);
    setFormOpen(true);
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Agenda"
        description="Gerencie os agendamentos da clínica"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWaitlistOpen(true)}
        >
          <Clock className="mr-1.5 h-3.5 w-3.5" />
          Fila de Espera
        </Button>
        <Button size="sm" onClick={() => openNewForm()}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Novo Agendamento
        </Button>
      </PageHeader>

      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onDateChange={setCurrentDate}
        onViewChange={setViewMode}
      />

      {isLoading ? (
        <div className="flex h-[calc(100vh-280px)] items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Carregando agendamentos...
          </div>
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" />}
          title="Nenhum agendamento"
          description='Não há agendamentos para este período. Clique em "Novo Agendamento" para começar.'
          action={
            <Button size="sm" onClick={() => openNewForm()}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Novo Agendamento
            </Button>
          }
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === "daily" && (
              <DailyView
                appointments={appointments}
                currentDate={currentDate}
                onAppointmentClick={handleAppointmentClick}
              />
            )}
            {viewMode === "weekly" && (
              <WeeklyView
                appointments={appointments}
                currentDate={currentDate}
                onAppointmentClick={handleAppointmentClick}
              />
            )}
            {viewMode === "monthly" && (
              <MonthlyView
                appointments={appointments}
                currentDate={currentDate}
                onAppointmentClick={handleAppointmentClick}
                onDayClick={handleDayClick}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <AppointmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        organizationId={organizationId}
        appointment={selectedAppointment ?? undefined}
        patients={patients}
        professionals={professionals}
        rooms={rooms}
        specialties={specialties}
        defaultDate={formDefaultDate}
        onSuccess={() => {
          setSelectedAppointment(null);
          setFormDefaultDate(undefined);
        }}
      />

      <WaitlistPanel
        open={waitlistOpen}
        onOpenChange={setWaitlistOpen}
        organizationId={organizationId}
        patients={patients}
        professionals={professionals}
        specialties={specialties}
      />
    </div>
  );
}
