"use server";

import { prisma } from "@/lib/prisma";
import type {
  AppointmentCreateInput,
  AppointmentUpdateInput,
} from "@/lib/validations/appointment";
import type { Prisma } from "@prisma/client";
import {
  isDemo,
  demoAppointments,
  demoPatients,
  demoProfessionals,
  demoRooms,
  demoSpecialties,
} from "@/lib/demo";

export interface ListAppointmentsParams {
  organizationId: string;
  from: Date;
  to: Date;
  professionalId?: string;
  roomId?: string;
  specialtyId?: string;
  status?: string;
}

export async function listAppointments(params: ListAppointmentsParams) {
  if (isDemo) {
    return demoAppointments
      .filter((a) => {
        if (a.startAt < params.from || a.endAt > params.to) return false;
        if (params.professionalId && a.professionalId !== params.professionalId) return false;
        if (params.roomId && a.roomId !== params.roomId) return false;
        if (params.specialtyId && a.specialtyId !== params.specialtyId) return false;
        if (params.status && a.status !== params.status) return false;
        return true;
      })
      .map((a) => ({
        ...a,
        patient: { id: a.patientId, name: a.patientName, phone: "(11) 99999-0000" },
        professional: { id: a.professionalId, name: a.professionalName, color: "#7c3aed" },
        room: a.roomId ? { id: a.roomId, name: a.roomName } : null,
        specialty: a.specialtyId ? { id: a.specialtyId, name: a.specialtyName, color: "#7c3aed" } : null,
      }));
  }

  const where: Prisma.AppointmentWhereInput = {
    organizationId: params.organizationId,
    startAt: { gte: params.from },
    endAt: { lte: params.to },
    ...(params.professionalId && { professionalId: params.professionalId }),
    ...(params.roomId && { roomId: params.roomId }),
    ...(params.specialtyId && { specialtyId: params.specialtyId }),
    ...(params.status && { status: params.status as never }),
  };

  return prisma.appointment.findMany({
    where,
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      professional: { select: { id: true, name: true, color: true } },
      room: { select: { id: true, name: true } },
      specialty: { select: { id: true, name: true, color: true } },
    },
    orderBy: { startAt: "asc" },
  });
}

export async function getAppointmentById(id: string, organizationId: string) {
  return prisma.appointment.findFirst({
    where: { id, organizationId },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      professional: { select: { id: true, name: true, color: true } },
      room: { select: { id: true, name: true } },
      specialty: { select: { id: true, name: true, color: true } },
    },
  });
}

export async function createAppointment(
  organizationId: string,
  data: AppointmentCreateInput,
) {
  return prisma.appointment.create({
    data: {
      organizationId,
      patientId: data.patientId,
      professionalId: data.professionalId,
      roomId: data.roomId || null,
      specialtyId: data.specialtyId || null,
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      status: data.status ?? "SCHEDULED",
      type: data.type ?? "RETURN",
      price: data.price ?? 0,
      notes: data.notes || null,
    },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      professional: { select: { id: true, name: true, color: true } },
      room: { select: { id: true, name: true } },
      specialty: { select: { id: true, name: true, color: true } },
    },
  });
}

export async function updateAppointment(
  id: string,
  organizationId: string,
  data: AppointmentUpdateInput,
) {
  return prisma.appointment.update({
    where: { id, organizationId },
    data: {
      ...(data.patientId !== undefined && { patientId: data.patientId }),
      ...(data.professionalId !== undefined && {
        professionalId: data.professionalId,
      }),
      ...(data.roomId !== undefined && { roomId: data.roomId || null }),
      ...(data.specialtyId !== undefined && {
        specialtyId: data.specialtyId || null,
      }),
      ...(data.startAt !== undefined && { startAt: new Date(data.startAt) }),
      ...(data.endAt !== undefined && { endAt: new Date(data.endAt) }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
    },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      professional: { select: { id: true, name: true, color: true } },
      room: { select: { id: true, name: true } },
      specialty: { select: { id: true, name: true, color: true } },
    },
  });
}

export async function cancelAppointment(
  id: string,
  organizationId: string,
  reason: string,
) {
  return prisma.appointment.update({
    where: { id, organizationId },
    data: {
      status: "CANCELLED",
      cancelReason: reason,
      cancelledAt: new Date(),
    },
  });
}

export async function rescheduleAppointment(
  id: string,
  organizationId: string,
  startAt: Date,
  endAt: Date,
) {
  return prisma.appointment.update({
    where: { id, organizationId },
    data: { startAt, endAt },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      professional: { select: { id: true, name: true, color: true } },
      room: { select: { id: true, name: true } },
      specialty: { select: { id: true, name: true, color: true } },
    },
  });
}

export async function deleteAppointment(id: string, organizationId: string) {
  return prisma.appointment.delete({ where: { id, organizationId } });
}

// ── Waiting List ──────────────────────────────────────────────

export async function listWaitingList(organizationId: string) {
  return prisma.waitingListEntry.findMany({
    where: { organizationId },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      professional: { select: { id: true, name: true } },
      specialty: { select: { id: true, name: true } },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
  });
}

export async function createWaitingListEntry(
  organizationId: string,
  data: {
    patientId: string;
    professionalId?: string;
    specialtyId?: string;
    preferredDate?: string;
    priority?: number;
    notes?: string;
  },
) {
  return prisma.waitingListEntry.create({
    data: {
      organizationId,
      patientId: data.patientId,
      professionalId: data.professionalId || null,
      specialtyId: data.specialtyId || null,
      preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
      priority: data.priority ?? 1,
      notes: data.notes || null,
    },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      professional: { select: { id: true, name: true } },
      specialty: { select: { id: true, name: true } },
    },
  });
}

export async function updateWaitingListEntry(
  id: string,
  organizationId: string,
  data: { status?: string; priority?: number },
) {
  return prisma.waitingListEntry.update({
    where: { id, organizationId },
    data,
  });
}

export async function deleteWaitingListEntry(
  id: string,
  organizationId: string,
) {
  return prisma.waitingListEntry.delete({ where: { id, organizationId } });
}

// ── Related Data ──────────────────────────────────────────────

export async function listPatients(organizationId: string) {
  if (isDemo) {
    return demoPatients
      .filter((p) => p.status === "active")
      .map((p) => ({ id: p.id, name: p.name, phone: p.phone }));
  }
  return prisma.patient.findMany({
    where: { organizationId, status: "active" },
    select: { id: true, name: true, phone: true },
    orderBy: { name: "asc" },
  });
}

export async function listProfessionals(organizationId: string) {
  if (isDemo) {
    return demoProfessionals.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      specialtyId: p.specialtyId,
    }));
  }
  return prisma.professional.findMany({
    where: { organizationId, active: true },
    select: { id: true, name: true, color: true, specialtyId: true },
    orderBy: { name: "asc" },
  });
}

export async function listRooms(organizationId: string) {
  if (isDemo) {
    return demoRooms.map((r) => ({ id: r.id, name: r.name }));
  }
  return prisma.room.findMany({
    where: { organizationId, active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function listSpecialties(organizationId: string) {
  if (isDemo) {
    return demoSpecialties.map((s) => ({
      id: s.id,
      name: s.name,
      color: s.color,
    }));
  }
  return prisma.specialty.findMany({
    where: { organizationId, active: true },
    select: { id: true, name: true, color: true },
    orderBy: { name: "asc" },
  });
}
